import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PaymentStatus({ member, payments, period }) {
  const hasPaid = payments?.some(
    (p) => p.memberId === member.id && p.period === period && p.status === 'paid'
  );

  return (
    <View style={[styles.badge, hasPaid ? styles.paidBadge : styles.unpaidBadge]}>
      <Text style={[styles.text, hasPaid ? styles.paidText : styles.unpaidText]}>
        {hasPaid ? 'Lunas' : 'Belum'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidBadge: { backgroundColor: '#E8F5E9' },
  unpaidBadge: { backgroundColor: '#FFF3E0' },
  text: { fontSize: 12, fontWeight: '600' },
  paidText: { color: '#2ED573' },
  unpaidText: { color: '#FF9800' },
});
