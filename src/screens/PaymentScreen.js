import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useArisan } from '../context/ArisanContext';

export default function PaymentScreen({ route }) {
  const { arisanId, members, amount } = route.params;
  const { payContribution, fetchArisan } = useArisan();
  const [payingId, setPayingId] = useState(null);

  const handlePay = async (memberId, memberName) => {
    Alert.alert(
      'Konfirmasi Pembayaran',
      `Tandai ${memberName} sudah membayar Rp ${amount.toLocaleString()}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Bayar',
          onPress: async () => {
            setPayingId(memberId);
            try {
              const period = 1;
              await payContribution({ memberId, arisanId, period, amount });
              await fetchArisan(arisanId);
              Alert.alert('Berhasil', 'Pembayaran dicatat');
            } catch (err) {
              Alert.alert('Error', err.message);
            } finally {
              setPayingId(null);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberStatus}>
            {item.isActive ? 'Aktif' : 'Tidak Aktif'}
          </Text>
        </View>
      </View>
      <View style={styles.amountSection}>
        <Text style={styles.amountText}>Rp {amount.toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => handlePay(item.id, item.name)}
          disabled={payingId === item.id}
        >
          {payingId === item.id ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.payBtnText}>Bayar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
        <Text style={styles.summaryAmount}>
          Rp {amount.toLocaleString()} / anggota
        </Text>
        <Text style={styles.summaryTotal}>
          Total: Rp {(amount * members.length).toLocaleString()}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Anggota</Text>
      <FlatList
        data={members.filter((m) => m.isActive)}
        keyExtractor={(item) => item.id}
        renderItem={renderMember}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  summary: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  summaryAmount: { fontSize: 24, fontWeight: 'bold', color: '#6C63FF', marginTop: 8 },
  summaryTotal: { fontSize: 14, color: '#777', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', paddingHorizontal: 16, marginBottom: 8 },
  list: { paddingHorizontal: 16 },
  memberCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  memberName: { fontSize: 16, fontWeight: '600', color: '#333' },
  memberStatus: { fontSize: 12, color: '#2ED573', marginTop: 2 },
  amountSection: { alignItems: 'flex-end' },
  amountText: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  payBtn: {
    backgroundColor: '#2ED573',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
