import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ArisanProvider } from './src/context/ArisanContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/database/db';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.center}>
          <Text style={styles.error}>Error: {this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((err) => setDbError(err.message));
  }, []);

  if (dbError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>DB Error: {dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Memuat...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ArisanProvider>
        <AppNavigator />
      </ArisanProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  error: { color: '#FF4757', fontSize: 16, textAlign: 'center', padding: 20 },
  loadingText: { marginTop: 12, color: '#999', fontSize: 14 },
});
