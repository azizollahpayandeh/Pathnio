import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { useAuth } from "../auth";
import {
  ensureTracking,
  reconcileTracking,
  requestPermissions,
} from "../location/tracker";
import { flush } from "../location/queue";
import {
  agoLabel,
  computeStatus,
  STATUS_COLOR,
  STATUS_DETAIL,
  STATUS_LABEL,
  StatusInfo,
} from "../location/status";
import { STATIONARY_KMH } from "../config";
import { tripAction } from "../api";
import InspectionScreen from "./InspectionScreen";
import ReportScreen from "./ReportScreen";

const REFRESH_MS = 5000;

export default function HomeScreen() {
  // The driver can open a full-screen task on top of the dashboard.
  const [task, setTask] = useState<
    | null
    | { kind: "inspection"; pre: boolean }
    | { kind: "incident" }
    | { kind: "expense" }
  >(null);
  const [tripBusy, setTripBusy] = useState(false);


  const { user, ctx, refreshContext, signOut } = useAuth();
  // Alert.prompt is iOS-only, so the odometer is captured in a real modal
  // that works the same on Android (the platform this app ships on).
  const [odoPrompt, setOdoPrompt] = useState<
    null | { tripId: number; action: "start" | "complete" }
  >(null);
  const [odoValue, setOdoValue] = useState("");

  const confirmTripAction = useCallback(async () => {
    if (!odoPrompt) return;
    const { tripId, action } = odoPrompt;
    setTripBusy(true);
    try {
      const raw = odoValue.trim();
      const odo = raw ? parseInt(raw, 10) : null;
      const r = await tripAction(tripId, action, {
        odometer: odo !== null && Number.isFinite(odo) ? odo : null,
      });
      setOdoPrompt(null);
      setOdoValue("");
      await refreshContext();
      if (action === "complete") {
        Alert.alert("Trip complete", `Recorded ${r.distance} km.`);
      }
    } catch (e: any) {
      Alert.alert("Could not update", e?.message ?? "Please try again.");
    } finally {
      setTripBusy(false);
    }
  }, [odoPrompt, odoValue, refreshContext]);
  const [trk, setTrk] = useState<StatusInfo | null>(null);
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Status loop: auto-start tracking, then keep the real state on screen --
  const tick = useCallback(async () => {
    const started = await ensureTracking(); // silent no-op until permitted
    const s = await computeStatus();
    setTrk(s);
    // Back online with a backlog? drain it now.
    if (started && s.online && s.pending > 0) {
      await flush();
      setTrk(await computeStatus());
    }
  }, []);

  useEffect(() => {
    (async () => {
      await reconcileTracking(); // clear anything stale from a previous build
      await tick();
    })();
    timer.current = setInterval(tick, REFRESH_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [tick]);

  // --- Live speed while the screen is open (foreground only, no extra cost
  //     in the background where the tracking task already runs) --------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!trk || trk.status === "PERMISSION_MISSING" || trk.status === "GPS_DISABLED") {
        setSpeedKmh(null);
        return;
      }
      if (watcher.current) return; // already watching
      try {
        const sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 5 },
          (pos) => {
            if (cancelled) return;
            const mps = pos.coords.speed;
            setSpeedKmh(
              typeof mps === "number" && mps >= 0 ? Math.round(mps * 3.6) : 0
            );
          }
        );
        watcher.current = sub;
      } catch {
        /* speed readout is optional — never break the screen */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trk?.status]);

  useEffect(
    () => () => {
      watcher.current?.remove();
      watcher.current = null;
    },
    []
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setNotice(null);
    try {
      await refreshContext(); // re-pull vehicle/trip/driver from the backend
      await tick();
    } catch {
      setNotice("Couldn't refresh. Check your connection.");
    } finally {
      setRefreshing(false);
    }
  };

  const grantPermission = async () => {
    setWorking(true);
    setNotice(null);
    try {
      const perm = await requestPermissions();
      if (!perm.granted) {
        setNotice(
          "Please choose “Allow all the time” so trips can be recorded while the app is closed."
        );
      }
      await tick();
    } finally {
      setWorking(false);
    }
  };

  const status = trk?.status ?? "STARTING";
  const color = STATUS_COLOR[status];
  const driver = ctx?.driver;
  const vehicle = ctx?.vehicle;
  const trip = ctx?.trip;
  const moving = (speedKmh ?? 0) >= STATIONARY_KMH;

  // A task owns the whole screen while it is open.
  if (task?.kind === "inspection") {
    return (
      <InspectionScreen
        kind={task.pre ? "PRE" : "POST"}
        tripId={trip?.id ?? null}
        onDone={() => {
          setTask(null);
          refreshContext();
        }}
        onCancel={() => setTask(null)}
      />
    );
  }
  if (task?.kind === "incident" || task?.kind === "expense") {
    return (
      <ReportScreen
        mode={task.kind}
        tripId={trip?.id ?? null}
        onDone={() => setTask(null)}
        onCancel={() => setTask(null)}
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a78bfa" />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoMark}>P</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {driver?.full_name || user?.username}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {ctx?.company?.name || "—"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={signOut} hitSlop={10}>
          <Text style={styles.signout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      {/* Status + speed */}
      <View style={[styles.hero, { borderColor: color }]}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.statusText, { color }]}>{STATUS_LABEL[status]}</Text>
        </View>
        <Text style={styles.statusDetail}>{STATUS_DETAIL[status]}</Text>

        {status === "PERMISSION_MISSING" ? (
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.cta}
              onPress={grantPermission}
              disabled={working}
            >
              {working ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Grant location access</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaGhost} onPress={() => Linking.openSettings()}>
              <Text style={styles.ctaGhostText}>Settings</Text>
            </TouchableOpacity>
          </View>
        ) : status === "GPS_DISABLED" ? (
          <TouchableOpacity style={styles.cta} onPress={() => Linking.openSettings()}>
            <Text style={styles.ctaText}>Turn on location</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.speedBlock}>
            <Text style={styles.speedValue}>
              {speedKmh === null ? "—" : speedKmh}
              <Text style={styles.speedUnit}>  km/h</Text>
            </Text>
            <Text style={styles.speedCaption}>{moving ? "Moving" : "Stationary"}</Text>
          </View>
        )}
      </View>

      {/* Assigned vehicle */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Assigned vehicle</Text>
        {vehicle ? (
          <>
            <Text style={styles.cardValue}>{vehicle.plate_number}</Text>
            <Text style={styles.cardMuted}>
              {[vehicle.model, vehicle.vehicle_type].filter(Boolean).join(" · ") || "—"}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.cardEmpty}>No vehicle assigned</Text>
            <Text style={styles.cardMuted}>
              Your manager assigns a vehicle from the Pathnio dashboard. Your
              position is still recorded.
            </Text>
          </>
        )}
      </View>

      {/* Current trip */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current trip</Text>
        {trip ? (
          <>
            <Text style={styles.cardValue}>
              {trip.origin} → {trip.destination}
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>{trip.status}</Text>
              </View>
              {trip.cargo ? (
                <Text style={styles.cardMuted} numberOfLines={1}>
                  Cargo: {trip.cargo}
                </Text>
              ) : null}
            </View>

            {/* The driver drives the trip's lifecycle from here — until now
                status could only be changed from the office dashboard. */}
            {trip.status === "PLANNED" && (
              <TouchableOpacity
                style={[styles.tripBtn, tripBusy && styles.ctaOff]}
                disabled={tripBusy}
                onPress={() => {
                  setOdoValue("");
                  setOdoPrompt({ tripId: trip.id, action: "start" });
                }}
              >
                <Text style={styles.tripBtnText}>Start this trip</Text>
              </TouchableOpacity>
            )}
            {trip.status === "ACTIVE" && (
              <TouchableOpacity
                style={[styles.tripBtn, styles.tripBtnDone, tripBusy && styles.ctaOff]}
                disabled={tripBusy}
                onPress={() => {
                  setOdoValue("");
                  setOdoPrompt({ tripId: trip.id, action: "complete" });
                }}
              >
                <Text style={styles.tripBtnText}>Finish trip</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.cardEmpty}>No active trip</Text>
        )}
      </View>

      {/* Driver actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.action}
            onPress={() => setTask({ kind: "inspection", pre: true })}
          >
            <Text style={styles.actionIcon}>🛠</Text>
            <Text style={styles.actionText}>Pre-trip check</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.action}
            onPress={() => setTask({ kind: "inspection", pre: false })}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Post-trip check</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={() => setTask({ kind: "expense" })}>
            <Text style={styles.actionIcon}>⛽</Text>
            <Text style={styles.actionText}>Log a cost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.action, styles.actionDanger]}
            onPress={() => setTask({ kind: "incident" })}
          >
            <Text style={styles.actionIcon}>⚠️</Text>
            <Text style={styles.actionText}>Report problem</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync + connectivity */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sync</Text>
        <View style={styles.kvRow}>
          <Text style={styles.k}>Connection</Text>
          <Text style={[styles.v, { color: trk?.online ? "#34d399" : "#f59e0b" }]}>
            {trk ? (trk.online ? "Online" : "No internet") : "…"}
          </Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.k}>Last synced</Text>
          <Text style={styles.v}>{agoLabel(trk?.lastSync ?? null)}</Text>
        </View>
        <View style={styles.kvRow}>
          <Text style={styles.k}>Waiting to send</Text>
          <Text style={styles.v}>
            {trk ? (trk.pending === 0 ? "Nothing" : `${trk.pending} points`) : "…"}
          </Text>
        </View>
      </View>

      {/* Driver details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Driver</Text>
        <View style={styles.kvRow}>
          <Text style={styles.k}>Name</Text>
          <Text style={styles.v}>{driver?.full_name || "—"}</Text>
        </View>
        {driver?.mobile ? (
          <View style={styles.kvRow}>
            <Text style={styles.k}>Phone</Text>
            <Text style={styles.v}>{driver.mobile}</Text>
          </View>
        ) : null}
        {driver?.email ? (
          <View style={styles.kvRow}>
            <Text style={styles.k}>Email</Text>
            <Text style={styles.v} numberOfLines={1}>{driver.email}</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.footer}>
        Tracking runs automatically while you are on the road — even when the app
        is closed. Pull down to refresh.
      </Text>

      <Modal
        visible={!!odoPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setOdoPrompt(null)}
      >
        <View style={styles.modalBack}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {odoPrompt?.action === "start" ? "Start trip" : "Finish trip"}
            </Text>
            <Text style={styles.modalHint}>
              Odometer reading in km. Leave blank to skip.
            </Text>
            <TextInput
              style={styles.modalInput}
              value={odoValue}
              onChangeText={setOdoValue}
              keyboardType="number-pad"
              placeholder="e.g. 128400"
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalGhost]}
                onPress={() => setOdoPrompt(null)}
              >
                <Text style={styles.modalGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalPrimary, tripBusy && styles.ctaOff]}
                onPress={confirmTripAction}
                disabled={tripBusy}
              >
                <Text style={styles.modalPrimaryText}>
                  {tripBusy
                    ? "Saving…"
                    : odoPrompt?.action === "start"
                    ? "Start"
                    : "Finish"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f0720" },
  ctaOff: { opacity: 0.6 },
  tripBtn: {
    marginTop: 14, backgroundColor: "#7c3aed", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  tripBtnDone: { backgroundColor: "#059669" },
  tripBtnText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 },
  action: {
    width: "47%", backgroundColor: "#241a45", borderRadius: 16,
    paddingVertical: 18, alignItems: "center",
  },
  actionDanger: { backgroundColor: "#3b1220" },
  actionIcon: { fontSize: 22, marginBottom: 6 },
  actionText: { color: "#e9e3ff", fontSize: 13, fontWeight: "700" },
  modalBack: {
    flex: 1, backgroundColor: "rgba(6,3,16,0.75)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    width: "100%", backgroundColor: "#1a1330", borderRadius: 22, padding: 22,
  },
  modalTitle: { color: "#fff", fontSize: 19, fontWeight: "800", marginBottom: 4 },
  modalHint: { color: "#a78bfa", fontSize: 13, marginBottom: 14 },
  modalInput: {
    backgroundColor: "#0f0720", borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, color: "#fff", fontSize: 17,
  },
  modalRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  modalBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalGhost: { backgroundColor: "#2d2350" },
  modalGhostText: { color: "#c4b5fd", fontWeight: "700", fontSize: 15 },
  modalPrimary: { backgroundColor: "#7c3aed" },
  modalPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  content: { padding: 18, paddingTop: 58, paddingBottom: 36 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  brandRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  logoMark: { color: "#fff", fontSize: 22, fontWeight: "800" },
  name: { color: "#fff", fontSize: 17, fontWeight: "800" },
  company: { color: "#a78bfa", fontSize: 13, marginTop: 1 },
  signout: { color: "#f87171", fontSize: 14, fontWeight: "700" },

  notice: {
    backgroundColor: "#3b1d1d",
    borderColor: "#7f1d1d",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: { color: "#fecaca", fontSize: 13, lineHeight: 18 },

  hero: {
    backgroundColor: "#1a1330",
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 14,
  },
  statusRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 9 },
  statusText: { fontSize: 17, fontWeight: "800" },
  statusDetail: { color: "#c4b5fd", fontSize: 13, lineHeight: 19, marginTop: 6 },

  speedBlock: { marginTop: 18, alignItems: "center" },
  speedValue: { color: "#fff", fontSize: 54, fontWeight: "900", letterSpacing: -1 },
  speedUnit: { color: "#a78bfa", fontSize: 17, fontWeight: "700" },
  speedCaption: { color: "#8b7fb0", fontSize: 13, marginTop: 2, fontWeight: "600" },

  ctaRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cta: {
    flex: 1,
    backgroundColor: "#7c3aed",
    borderRadius: 13,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  ctaGhost: {
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#2a2145",
  },
  ctaGhostText: { color: "#c4b5fd", fontWeight: "700", fontSize: 15 },

  card: {
    backgroundColor: "#faf9ff",
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardValue: { color: "#111827", fontSize: 21, fontWeight: "800" },
  cardMuted: { color: "#6b7280", fontSize: 13, marginTop: 4, lineHeight: 18 },
  cardEmpty: { color: "#9ca3af", fontSize: 16, fontWeight: "600" },

  pillRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 9 },
  pill: {
    backgroundColor: "#ede9fe",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  pillText: { color: "#6d28d9", fontWeight: "800", fontSize: 11 },

  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  k: { color: "#6b7280", fontSize: 14 },
  v: { color: "#111827", fontSize: 14, fontWeight: "700", maxWidth: "62%", textAlign: "right" },

  footer: {
    color: "#6d6390",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 17,
  },
});
