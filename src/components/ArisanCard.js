import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ArisanCard({ arisan, onPress }) {
  const formatRp = (num) => {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{arisan.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{arisan.status}</Text>
        </View>
      </View>
      {arisan.description ? (
        <Text style={styles.desc} numberOfLines={2}>{arisan.description}</Text>
      ) : null}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatRp(arisan.amount)}</Text>
          <Text style={styles.statLabel}>Iuran</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{arisan.memberCount || 0}</Text>
          <Text style={styles.statLabel}>Anggota</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{arisan.maxMembers}</Text>
          <Text style={styles.statLabel}>Maks</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1 },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, color: '#2ED573', fontWeight: '600' },
  desc: { fontSize: 13, color: '#999', marginTop: 6 },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
});
