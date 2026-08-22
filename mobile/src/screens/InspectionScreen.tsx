import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from "react-native";
import { fetchInspectionChecklist, submitInspection, InspectionItem } from "../api";

/** Human labels for the server-defined checklist keys. */
const LABEL: Record<string, string> = {
  brakes: "Brakes",
  tyres: "Tyres & wheels",
  lights: "Lights & indicators",
  mirrors: "Mirrors",
  windscreen: "Windscreen & wipers",
  fluids: "Oil / coolant levels",
  seatbelts: "Seatbelts",
  warning_devices: "Warning triangle & extinguisher",
  bodywork: "Bodywork & doors",
  load_security: "Load security",
};

type Props = { kind: "PRE" | "POST"; tripId?: number | null; onDone: () => void; onCancel: () => void };

export default function InspectionScreen({ kind, tripId, onDone, onCancel }: Props) {
  const [checklist, setChecklist] = useState<string[]>([]);
  const [state, setState] = useState<Record<string, { ok: boolean; note: string }>>({});
  const [odometer, setOdometer] = useState("");
  const [fuel, setFuel] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInspectionChecklist()
      .then((d) => {
        setChecklist(d.checklist);
        // Default every item to PASS; the driver flags only what is wrong.
        const init: Record<string, { ok: boolean; note: string }> = {};
        d.checklist.forEach((k) => (init[k] = { ok: true, note: "" }));
        setState(init);
      })
      .catch(() => Alert.alert("Offline", "Could not load the checklist. Try again when you have signal."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: string) =>
    setState((p) => ({ ...p, [key]: { ...p[key], ok: !p[key].ok } }));

  const failed = checklist.filter((k) => state[k] && !state[k].ok);

  const submit = async () => {
    setSaving(true);
    try {
      const items: InspectionItem[] = checklist.map((k) => ({
        key: k, ok: state[k]?.ok ?? true, note: state[k]?.note || "",
      }));
      const fuelNum = fuel ? parseInt(fuel, 10) : null;
      if (fuelNum !== null && (fuelNum < 0 || fuelNum > 100)) {
        Alert.alert("Check the fuel level", "Enter a percentage between 0 and 100.");
        setSaving(false);
        return;
      }
      const r = await submitInspection({
        kind,
        items,
        odometer: odometer ? parseInt(odometer, 10) : null,
        fuel_percent: fuelNum,
        defect_notes: notes,
        trip_id: tripId ?? null,
      });
      Alert.alert(
        r.has_defects ? "Defects reported" : "Inspection complete",
        r.has_defects
          ? "Your dispatcher has been alerted about the faults you flagged."
          : "Vehicle signed off as roadworthy.",
        [{ text: "OK", onPress: onDone }]
      );
    } catch (e: any) {
      Alert.alert("Could not submit", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={10}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{kind === "PRE" ? "Pre-trip check" : "Post-trip check"}</Text>
        <View style={{ width: 52 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.hint}>
          Tap any item that is NOT in working order. Everything starts as passed.
        </Text>

        {checklist.map((key) => {
          const ok = state[key]?.ok ?? true;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.item, !ok && styles.itemBad]}
              onPress={() => toggle(key)}
              activeOpacity={0.7}
            >
              <View style={[styles.tick, !ok && styles.tickBad]}>
                <Text style={styles.tickText}>{ok ? "✓" : "!"}</Text>
              </View>
              <Text style={[styles.itemText, !ok && styles.itemTextBad]}>
                {LABEL[key] ?? key}
              </Text>
              <Text style={[styles.itemState, !ok && styles.itemStateBad]}>
                {ok ? "Pass" : "Defect"}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.label}>Odometer (km)</Text>
        <TextInput
          style={styles.input}
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="number-pad"
          placeholder="e.g. 128400"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Fuel level (%)</Text>
        <TextInput
          style={styles.input}
          value={fuel}
          onChangeText={(t) => setFuel(t.replace(/[^0-9]/g, "").slice(0, 3))}
          keyboardType="number-pad"
          placeholder="e.g. 75"
          placeholderTextColor="#94a3b8"
        />

        {failed.length > 0 && (
          <>
            <Text style={styles.label}>What is wrong?</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Describe the fault so the workshop knows what to expect"
              placeholderTextColor="#94a3b8"
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.cta, failed.length > 0 && styles.ctaWarn, saving && styles.ctaOff]}
          onPress={submit}
          disabled={saving}
        >
          <Text style={styles.ctaText}>
            {saving
              ? "Submitting…"
              : failed.length > 0
              ? `Report ${failed.length} defect${failed.length > 1 ? "s" : ""}`
              : "Sign off as roadworthy"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0f0720" },
  center: { flex: 1, backgroundColor: "#0f0720", alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14,
  },
  back: { color: "#c4b5fd", fontSize: 15, fontWeight: "600" },
  title: { color: "#fff", fontSize: 17, fontWeight: "800" },
  body: { paddingHorizontal: 20 },
  hint: { color: "#a78bfa", fontSize: 13, marginBottom: 14, lineHeight: 19 },
  item: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1a1330",
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 8,
    borderWidth: 1, borderColor: "transparent",
  },
  itemBad: { backgroundColor: "#3b1220", borderColor: "#f43f5e" },
  tick: {
    width: 28, height: 28, borderRadius: 10, backgroundColor: "#10b981",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  tickBad: { backgroundColor: "#f43f5e" },
  tickText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  itemText: { color: "#e9e3ff", fontSize: 15, fontWeight: "600", flex: 1 },
  itemTextBad: { color: "#fff" },
  itemState: { color: "#10b981", fontSize: 12, fontWeight: "700" },
  itemStateBad: { color: "#fda4af" },
  label: { color: "#c4b5fd", fontSize: 13, fontWeight: "700", marginTop: 18, marginBottom: 6 },
  input: {
    backgroundColor: "#1a1330", borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, color: "#fff", fontSize: 16,
  },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  cta: {
    marginTop: 24, backgroundColor: "#7c3aed", borderRadius: 16,
    paddingVertical: 17, alignItems: "center",
  },
  ctaWarn: { backgroundColor: "#e11d48" },
  ctaOff: { opacity: 0.6 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
