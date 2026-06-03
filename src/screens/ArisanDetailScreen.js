import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useArisan } from '../context/ArisanContext';
import MemberCard from '../components/MemberCard';
import PaymentStatus from '../components/PaymentStatus';

export default function ArisanDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { currentArisan, members, payments, loading, fetchArisan, drawWinner, deleteArisan } = useArisan();

  useEffect(() => {
    fetchArisan(id);
  }, [id]);

  const handleDraw = async () => {
    Alert.alert('Undian Arisan', 'Lakukan undian untuk periode ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Undi!',
        onPress: async () => {
          const result = await drawWinner(id);
          if (result) {
            Alert.alert(
              'Selamat!',
              `Pemenang: ${result.winner.name}\nPeriode: ${result.period}\nTotal: Rp ${result.totalAmount.toLocaleString()}`
            );
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Hapus Arisan', 'Yakin ingin menghapus arisan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteArisan(id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading && !currentArisan) {
    return <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />;
  }

  if (!currentArisan) {
    return (
      <View style={styles.loader}>
        <Text>Arisan tidak ditemukan</Text>
      </View>
    );
  }

  const totalCollected = currentArisan.amount * members.length;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{currentArisan.name}</Text>
        {currentArisan.description ? (
          <Text style={styles.desc}>{currentArisan.description}</Text>
        ) : null}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Rp {currentArisan.amount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Iuran</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{members.length}</Text>
            <Text style={styles.statLabel}>Anggota</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Rp {totalCollected.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.drawBtn} onPress={handleDraw}>
            <Text style={styles.drawBtnText}>Undi Pemenang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Anggota ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MemberCard member={item} />}
        style={styles.list}
      />

      <TouchableOpacity
        style={styles.paymentBtn}
        onPress={() => navigation.navigate('Payment', { arisanId: id, members, amount: currentArisan.amount })}
      >
        <Text style={styles.paymentBtnText}>Kelola Pembayaran</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16, elevation: 2 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 14, color: '#777', marginTop: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#6C63FF' },
  statLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  drawBtn: { flex: 1, backgroundColor: '#6C63FF', padding: 14, borderRadius: 10, alignItems: 'center' },
  drawBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  deleteBtn: { backgroundColor: '#FF4757', padding: 14, borderRadius: 10 },
  deleteBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', paddingHorizontal: 16, marginBottom: 8 },
  list: { flex: 1, paddingHorizontal: 16 },
  paymentBtn: {
    backgroundColor: '#2ED573',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
