import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../auth";

export default function ActivationScreen() {
  const { user, activate, signOut } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onActivate = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Enter the activation code from your manager.");
      return;
    }
    setLoading(true);
    try {
      await activate(code.trim());
      // On success the auth context flips `activated` -> the app gate shows Home.
    } catch (e: any) {
      setError(e?.message || "Activation failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brandRow}>
        <View style={styles.logo}>
          <Text style={styles.logoMark}>P</Text>
        </View>
        <Text style={styles.brand}>Pathnio</Text>
      </View>
      <Text style={styles.subtitle}>Activate your driver account</Text>

      <View style={styles.card}>
        <Text style={styles.hello}>
          Signed in as <Text style={styles.helloName}>{user?.username}</Text>
        </Text>
        <Text style={styles.desc}>
          Your account isn't linked to a company yet. Enter the one-time
          activation code your manager shared with you.
        </Text>

        <Text style={styles.label}>Activation code</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="paste your code"
          placeholderTextColor="#9ca3af"
          value={code}
          onChangeText={setCode}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onActivate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Activate</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={styles.signout}>
          <Text style={styles.signoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0720",
    padding: 24,
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
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
  brand: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#c4b5fd", textAlign: "center", marginBottom: 28, fontSize: 15 },
  card: { backgroundColor: "#faf9ff", borderRadius: 20, padding: 20 },
  hello: { color: "#111827", fontSize: 15, fontWeight: "600" },
  helloName: { color: "#7c3aed" },
  desc: { color: "#6b7280", fontSize: 14, lineHeight: 20, marginTop: 6 },
  label: { color: "#4b5563", fontSize: 13, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  error: { color: "#dc2626", marginTop: 12, fontSize: 14 },
  button: {
    backgroundColor: "#7c3aed",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  signout: { alignItems: "center", marginTop: 16 },
  signoutText: { color: "#9ca3af", fontSize: 14, fontWeight: "600" },
});
