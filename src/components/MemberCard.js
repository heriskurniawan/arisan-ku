import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MemberCard({ member }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        {member.phone ? (
          <Text style={styles.phone}>{member.phone}</Text>
        ) : null}
      </View>
      <View style={[styles.statusBadge, member.isActive ? styles.activeBadge : styles.inactiveBadge]}>
        <Text style={[styles.statusText, member.isActive ? styles.activeText : styles.inactiveText]}>
          {member.isActive ? 'Aktif' : 'Nonaktif'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#333' },
  phone: { fontSize: 12, color: '#999', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 12, fontWeight: '600' },
  activeText: { color: '#2ED573' },
  inactiveText: { color: '#FF4757' },
});
