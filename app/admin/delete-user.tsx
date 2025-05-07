// ✅ Fichier : app/admin/delete-user.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../../assets/Lib/firebaseConfig';
import { deleteDoc, doc } from 'firebase/firestore';

export default function DeleteUser() {
  const [emailToDelete, setEmailToDelete] = useState('');

  const handleDelete = async () => {
    if (!emailToDelete) {
      Alert.alert('Erreur', 'Veuillez saisir un email.');
      return;
    }

    try {
      // Supprimer le document Firestore associé à l'utilisateur
      const userDocRef = doc(db, 'users', emailToDelete);
      await deleteDoc(userDocRef);

      Alert.alert('Succès', `Utilisateur ${emailToDelete} supprimé.`);
      setEmailToDelete('');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supprimer un utilisateur</Text>

      <TextInput
        style={styles.input}
        placeholder="Email de l'utilisateur à supprimer"
        value={emailToDelete}
        onChangeText={setEmailToDelete}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>🗑️ Supprimer l'utilisateur</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  deleteButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
