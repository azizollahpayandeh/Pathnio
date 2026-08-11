import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../auth";
import { isOnDuty, setOnDuty } from "../storage";
import {
  getCurrentPosition,
  isTracking,
  requestPermissions,
  startTracking,
  stopTracking,
} from "../location/tracker";
import { queueSize, flush } from "../location/queue";

type Fix = { lat: number; lng: number; speedKmh: number; at: string } | null;

export default function HomeScreen() {
  const { user, ctx, signOut } = useAuth();
  const [onDuty, setDuty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fix, setFix] = useState<Fix>(null);
  const [pending, setPending] = useState(0);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync UI with the actual tracking state on mount.
  useEffect(() => {
    (async () => {
      const running = await isTracking();
      const duty = await isOnDuty();
      setDuty(running && duty);
    })();
  }, []);

  const refresh = useCallback(async () => {
    setPending(await queueSize());
    try {
      const pos = await getCurrentPosition();
      setFix({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        speedKmh: Math.max(0, Math.round((pos.coords.speed ?? 0) * 3.6)),
        at: new Date(pos.timestamp).toLocaleTimeString(),
      });
    } catch {
      /* ignore transient read errors */
    }
  }, []);

  // While on duty, refresh the on-screen readout every few seconds.
  useEffect(() => {
    if (onDuty) {
      refresh();
      poll.current = setInterval(refresh, 5000);
    } else if (poll.current) {
      clearInterval(poll.current);
      poll.current = null;
    }
    return () => {
      if (poll.current) clearInterval(poll.current);
    };
  }, [onDuty, refresh]);

  const goOnDuty = async () => {
    const perm = await requestPermissions();
    if (!perm.granted) {
      Alert.alert(
        "Background location needed",
        "Pathnio needs “Allow all the time” location access to track your trips while the app is closed. Please enable it in Settings.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    await startTracking("eco");
    await setOnDuty(true);
    setDuty(true);
  };

  const goOffDuty = async () => {
    await stopTracking();
    await setOnDuty(false);
    setDuty(false);
    // Try to flush whatever is still queued before we stop.
    await flush();
    setPending(await queueSize());
  };

  const toggle = async (next: boolean) => {
    setBusy(true);
    try {
      if (next) await goOnDuty();
      else await goOffDuty();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoMark}>P</Text>
          </View>
          <View>
            <Text style={styles.brand}>Pathnio</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Duty card */}
      <View style={[styles.card, onDuty ? styles.cardOn : styles.cardOff]}>
        <Text style={styles.dutyLabel}>{onDuty ? "ON DUTY" : "OFF DUTY"}</Text>
        <Text style={styles.dutySub}>
          {onDuty
            ? "Your location is being shared with your fleet."
            : "Tracking is off. Flip the switch to start your shift."}
        </Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchHint}>
            {busy ? "Working…" : onDuty ? "Tracking" : "Not tracking"}
          </Text>
          <Switch
            value={onDuty}
            onValueChange={toggle}
            disabled={busy}
            trackColor={{ false: "#4b5563", true: "#34d399" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Assigned vehicle */}
      <View style={styles.stat}>
        <Text style={styles.statTitle}>Assigned vehicle</Text>
        {ctx?.vehicle ? (
          <>
            <Text style={styles.coord}>{ctx.vehicle.plate_number}</Text>
            <Text style={styles.metaMuted}>
              {[ctx.vehicle.model, ctx.vehicle.vehicle_type].filter(Boolean).join(" · ") || "—"}
            </Text>
          </>
        ) : (
          <Text style={styles.metaMuted}>No vehicle assigned yet</Text>
        )}
      </View>

      {/* Live readout */}
      <View style={styles.stat}>
        <Text style={styles.statTitle}>Current position</Text>
        {fix ? (
          <>
            <Text style={styles.coord}>
              {fix.lat.toFixed(5)}, {fix.lng.toFixed(5)}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>Speed: {fix.speedKmh} km/h</Text>
              <Text style={styles.meta}>Updated: {fix.at}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.metaMuted}>
            {onDuty ? "Getting a fix…" : "—"}
          </Text>
        )}
      </View>

      <View style={styles.stat}>
        <Text style={styles.statTitle}>Upload queue</Text>
        <Text style={styles.coord}>{pending}</Text>
        <Text style={styles.metaMuted}>
          fixes waiting to sync (auto-uploads in the background)
        </Text>
      </View>

      <Text style={styles.profileNote}>Profile: Eco · battery-friendly</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0f0720" },
  content: { padding: 20, paddingTop: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoMark: { color: "#fff", fontSize: 22, fontWeight: "800" },
  brand: { color: "#fff", fontSize: 20, fontWeight: "800" },
  username: { color: "#a78bfa", fontSize: 13 },
  signout: { color: "#f87171", fontSize: 14, fontWeight: "600" },

  card: { borderRadius: 20, padding: 22, marginBottom: 18 },
  cardOn: { backgroundColor: "#064e3b" },
  cardOff: { backgroundColor: "#1e1b2e" },
  dutyLabel: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 1,
  },
  dutySub: { color: "#d1d5db", marginTop: 6, fontSize: 14, lineHeight: 20 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  switchHint: { color: "#e5e7eb", fontSize: 15, fontWeight: "600" },

  stat: {
    backgroundColor: "#faf9ff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  statTitle: { color: "#6b7280", fontSize: 13, marginBottom: 6 },
  coord: { color: "#111827", fontSize: 22, fontWeight: "800" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  meta: { color: "#374151", fontSize: 14 },
  metaMuted: { color: "#9ca3af", fontSize: 13, marginTop: 4 },
  profileNote: {
    color: "#8b7fb0",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
  },
});
