import React from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/auth";
import LoginScreen from "./src/screens/LoginScreen";
import ActivationScreen from "./src/screens/ActivationScreen";
import HomeScreen from "./src/screens/HomeScreen";

function Gate() {
  const { user, activated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color="#7c3aed" size="large" />
      </View>
    );
  }
  // Not logged in -> Login. Logged in but not linked to a driver -> Activation.
  // Logged in AND activated -> the tracking app.
  if (!user) return <LoginScreen />;
  if (!activated) return <ActivationScreen />;
  return <HomeScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <Gate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#0f0720",
    alignItems: "center",
    justifyContent: "center",
  },
});
