import React, { useEffect, useState } from "react";
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
import * as Network from "expo-network";
import { useAuth } from "../auth";

export default function LoginScreen() {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  // Sign-in needs the network — tell the driver up front instead of failing.
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const n = await Network.getNetworkStateAsync();
        if (alive) setOnline(!!n.isConnected && n.isInternetReachable !== false);
      } catch {
        /* assume online if the check itself fails */
      }
    };
    check();
    const t = setInterval(check, 5000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const onSubmit = async () => {
    setError(null);
    if (!username || !password) {
      setError("Enter your username and password.");
      return;
    }
    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!online) {
      setError("No internet connection. Connect and try again.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") await signIn(username, password);
      else await register(username, email, password);
    } catch (e: any) {
      setError(e?.message || (mode === "login" ? "Login failed." : "Registration failed."));
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
      <Text style={styles.subtitle}>Driver access</Text>

      {!online && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, mode === "login" && styles.tabActive]}
            onPress={() => { setMode("login"); setError(null); }}
          >
            <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "register" && styles.tabActive]}
            onPress={() => { setMode("register"); setError(null); }}
          >
            <Text style={[styles.tabText, mode === "register" && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="your username"
          placeholderTextColor="#9ca3af"
          value={username}
          onChangeText={setUsername}
        />

        {mode === "register" && (
          <>
            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
            />
          </>
        )}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "login" ? "Sign In" : "Create account"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        {mode === "login"
          ? "New driver? Register, then enter the activation code from your manager."
          : "After registering you'll enter the activation code your manager gave you."}
      </Text>
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
  subtitle: {
    color: "#c4b5fd",
    textAlign: "center",
    marginBottom: 28,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#faf9ff",
    borderRadius: 20,
    padding: 20,
  },
  offlineBanner: {
    backgroundColor: "#78350f",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  offlineText: { color: "#fde68a", fontSize: 13, fontWeight: "700", textAlign: "center" },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#efeaff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: "center" },
  tabActive: { backgroundColor: "#fff" },
  tabText: { color: "#8b7fb0", fontWeight: "700" },
  tabTextActive: { color: "#7c3aed" },
  label: { color: "#4b5563", fontSize: 13, marginBottom: 6, marginTop: 10 },
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
  hint: {
    color: "#8b7fb0",
    textAlign: "center",
    marginTop: 22,
    fontSize: 13,
    lineHeight: 18,
  },
});
