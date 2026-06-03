import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useArisan } from '../context/ArisanContext';

export default function CreateArisanScreen({ navigation }) {
  const { createArisan, loading } = useArisan();
  const [form, setForm] = useState({
    name: '',
    description: '',
    amount: '',
    maxMembers: '10',
  });

  const handleCreate = async () => {
    if (!form.name.trim()) {
      return Alert.alert('Error', 'Nama arisan wajib diisi');
    }
    if (!form.amount || parseInt(form.amount) <= 0) {
      return Alert.alert('Error', 'Jumlah iuran wajib diisi dengan benar');
    }

    const success = await createArisan({
      name: form.name.trim(),
      description: form.description.trim(),
      amount: parseInt(form.amount),
      maxMembers: parseInt(form.maxMembers),
    });

    if (success) {
      Alert.alert('Berhasil', 'Arisan berhasil dibuat!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Nama Arisan</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Arisan Keluarga"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

        <Text style={styles.label}>Deskripsi (opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi arisan..."
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Jumlah Iuran (Rp)</Text>
        <TextInput
          style={styles.input}
          placeholder="50000"
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: text.replace(/[^0-9]/g, '') })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Maksimal Anggota</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          value={form.maxMembers}
          onChangeText={(text) => setForm({ ...form, maxMembers: text.replace(/[^0-9]/g, '') })}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Buat Arisan</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  textArea: { height: 80, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
