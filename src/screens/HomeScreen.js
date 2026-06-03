import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useArisan } from '../context/ArisanContext';
import ArisanCard from '../components/ArisanCard';

export default function HomeScreen({ navigation }) {
  const { arisans, loading, fetchArisans } = useArisan();

  useFocusEffect(
    useCallback(() => {
      fetchArisans();
    }, [fetchArisans])
  );

  const renderItem = ({ item }) => (
    <ArisanCard
      arisan={item}
      onPress={() => navigation.navigate('ArisanDetail', { id: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Selamat Datang di ArisanKu</Text>
        <Text style={styles.subtitle}>Kelola arisan Anda dengan mudah</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('CreateArisan')}
        >
          <Text style={styles.actionIcon}>+</Text>
          <Text style={styles.actionText}>Buat Arisan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnSecondary]}
          onPress={() => navigation.navigate('JoinArisan')}
        >
          <Text style={styles.actionIconSecondary}>→</Text>
          <Text style={[styles.actionText, { color: '#6C63FF' }]}>Gabung</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Daftar Arisan</Text>

      {loading && arisans.length === 0 ? (
        <ActivityIndicator size="large" color="#6C63FF" />
      ) : arisans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Belum ada arisan</Text>
          <Text style={styles.emptySubtext}>Buat atau gabung arisan sekarang!</Text>
        </View>
      ) : (
        <FlatList
          data={arisans}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchArisans} />
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#6C63FF', padding: 24, paddingTop: 16 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#ddd', marginTop: 4 },
  actions: { flexDirection: 'row', padding: 16, gap: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  actionIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  actionIconSecondary: { fontSize: 24, color: '#6C63FF', fontWeight: 'bold' },
  actionText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, marginBottom: 8 },
  list: { padding: 16, paddingTop: 0 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999' },
  emptySubtext: { fontSize: 14, color: '#bbb', marginTop: 4 },
});
