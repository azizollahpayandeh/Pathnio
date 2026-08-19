import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from "react-native";
import { reportIncident, submitExpense } from "../api";

type Mode = "incident" | "expense";
type Props = { mode: Mode; tripId?: number | null; onDone: () => void; onCancel: () => void };

const INCIDENT_KINDS = [
  { key: "BREAKDOWN", label: "Breakdown" },
  { key: "ACCIDENT", label: "Accident" },
  { key: "DELAY", label: "Delay" },
  { key: "THEFT", label: "Theft" },
  { key: "OTHER", label: "Other" },
] as const;

const SEVERITIES = [
  { key: "LOW", label: "Low" },
  { key: "MEDIUM", label: "Medium" },
  { key: "HIGH", label: "Urgent" },
] as const;

const EXPENSE_CATEGORIES = ["Fuel", "Tolls", "Parking", "Repair", "Other"];

export default function ReportScreen({ mode, tripId, onDone, onCancel }: Props) {
  const [kind, setKind] = useState<(typeof INCIDENT_KINDS)[number]["key"]>("BREAKDOWN");
  const [severity, setSeverity] = useState<(typeof SEVERITIES)[number]["key"]>("MEDIUM");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fuel");
  const [amount, setAmount] = useState("");
  const [liters, setLiters] = useState("");
  const [odometer, setOdometer] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      if (mode === "incident") {
        if (!description.trim()) {
          Alert.alert("Add a description", "Tell your dispatcher what happened.");
          setSaving(false);
          return;
        }
        await reportIncident({ kind, severity, description: description.trim(), trip_id: tripId ?? null });
        Alert.alert("Reported", "Your dispatcher has been alerted.", [{ text: "OK", onPress: onDone }]);
      } else {
        const value = parseFloat(amount.replace(",", "."));
        if (!isFinite(value) || value <= 0) {
          Alert.alert("Check the amount", "Enter an amount greater than zero.");
          setSaving(false);
          return;
        }
        await submitExpense({
          category,
          amount: value.toFixed(2),
          description: description.trim(),
          odometer: odometer ? parseInt(odometer, 10) : null,
          liters: liters ? parseFloat(liters.replace(",", ".")).toFixed(2) : null,
        });
        Alert.alert("Saved", "Sent to the office for approval.", [{ text: "OK", onPress: onDone }]);
      }
    } catch (e: any) {
      Alert.alert("Could not send", e?.message ?? "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isIncident = mode === "incident";

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} hitSlop={10}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isIncident ? "Report a problem" : "Log a cost"}</Text>
        <View style={{ width: 52 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {isIncident ? (
          <>
            <Text style={styles.label}>What happened?</Text>
            <View style={styles.chips}>
              {INCIDENT_KINDS.map((k) => (
                <TouchableOpacity
                  key={k.key}
                  style={[styles.chip, kind === k.key && styles.chipOn]}
                  onPress={() => setKind(k.key)}
                >
                  <Text style={[styles.chipText, kind === k.key && styles.chipTextOn]}>{k.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>How urgent?</Text>
            <View style={styles.chips}>
              {SEVERITIES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.chip, severity === s.key && styles.chipOn]}
                  onPress={() => setSeverity(s.key)}
                >
                  <Text style={[styles.chipText, severity === s.key && styles.chipTextOn]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chips}>
              {EXPENSE_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, category === c && styles.chipOn]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#94a3b8"
            />

            {category === "Fuel" && (
              <>
                <Text style={styles.label}>Litres (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={liters}
                  onChangeText={setLiters}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 45.2"
                  placeholderTextColor="#94a3b8"
                />
              </>
            )}

            <Text style={styles.label}>Odometer (optional)</Text>
            <TextInput
              style={styles.input}
              value={odometer}
              onChangeText={setOdometer}
              keyboardType="number-pad"
              placeholder="e.g. 128400"
              placeholderTextColor="#94a3b8"
            />
          </>
        )}

        <Text style={styles.label}>{isIncident ? "Details" : "Note (optional)"}</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder={isIncident ? "Where you are and what is wrong" : "Anything the office should know"}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.cta, isIncident && styles.ctaWarn, saving && styles.ctaOff]}
          onPress={submit}
          disabled={saving}
        >
          <Text style={styles.ctaText}>
            {saving ? "Sending…" : isIncident ? "Alert my dispatcher" : "Save cost"}
          </Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#0f0720" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 58, paddingBottom: 14,
  },
  back: { color: "#c4b5fd", fontSize: 15, fontWeight: "600" },
  title: { color: "#fff", fontSize: 17, fontWeight: "800" },
  body: { paddingHorizontal: 20 },
  label: { color: "#c4b5fd", fontSize: 13, fontWeight: "700", marginTop: 18, marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    backgroundColor: "#1a1330", borderWidth: 1, borderColor: "#2d2350",
  },
  chipOn: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  chipText: { color: "#c4b5fd", fontSize: 14, fontWeight: "600" },
  chipTextOn: { color: "#fff" },
  input: {
    backgroundColor: "#1a1330", borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, color: "#fff", fontSize: 16,
  },
  multiline: { minHeight: 110, textAlignVertical: "top" },
  cta: {
    marginTop: 26, backgroundColor: "#7c3aed", borderRadius: 16,
    paddingVertical: 17, alignItems: "center",
  },
  ctaWarn: { backgroundColor: "#e11d48" },
  ctaOff: { opacity: 0.6 },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
