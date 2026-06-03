import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useArisan } from '../context/ArisanContext';

export default function JoinArisanScreen({ navigation }) {
  const { arisans, fetchArisans, joinArisan } = useArisan();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedArisan, setSelectedArisan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArisans();
  }, []);

  const handleJoin = async () => {
    if (!selectedArisan) {
      return Alert.alert('Error', 'Pilih arisan yang ingin diikuti');
    }
    if (!name.trim()) {
      return Alert.alert('Error', 'Nama wajib diisi');
    }

    setLoading(true);
    try {
      await joinArisan({
        arisanId: selectedArisan.id,
        name: name.trim(),
        phone: phone.trim(),
      });
      Alert.alert('Berhasil', `Anda bergabung dengan ${selectedArisan.name}`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nama Anda</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan nama"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>No. HP (opsional)</Text>
        <TextInput
          style={styles.input}
          placeholder="08123456789"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Pilih Arisan</Text>
        {arisans.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada arisan tersedia</Text>
        ) : (
          <FlatList
            data={arisans}
            keyExtractor={(item) => item.id}
            style={styles.arisanList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.arisanItem,
                  selectedArisan?.id === item.id && styles.arisanItemSelected,
                ]}
                onPress={() => setSelectedArisan(item)}
              >
                <Text style={[
                  styles.arisanItemText,
                  selectedArisan?.id === item.id && styles.arisanItemTextSelected,
                ]}>
                  {item.name}
                </Text>
                <Text style={styles.arisanItemSub}>
                  Rp {item.amount.toLocaleString()} | {item.maxMembers} anggota
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleJoin}
          disabled={loading || !selectedArisan}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gabung</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  arisanList: { maxHeight: 220, marginTop: 4 },
  arisanItem: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#eee',
  },
  arisanItemSelected: { borderColor: '#6C63FF', backgroundColor: '#f0f0ff' },
  arisanItemText: { fontSize: 16, fontWeight: '600', color: '#333' },
  arisanItemTextSelected: { color: '#6C63FF' },
  arisanItemSub: { fontSize: 12, color: '#999', marginTop: 4 },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#999', textAlign: 'center', marginTop: 12 },
});
