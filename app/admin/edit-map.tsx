import React, { useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../assets/Lib/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function EditMap() {
  const router = useRouter();

  // 🔐 Redirection si utilisateur non connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  // ✅ Déconnexion
  const handleLogout = async () => {
    try {
      await signOut(auth);

      Toast.show({
        type: 'info',
        text1: 'Déconnexion réussie 👋',
        text2: 'À bientôt sur SalesMap !',
      });

      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Échec de la déconnexion.',
      });
    }
  };

  // ✅ Simuler la modification
  const handleModify = () => {
    Toast.show({
      type: 'success',
      text1: 'Modifications enregistrées ✅',
      text2: 'Les positions ont été mises à jour.',
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}> Déconnexion</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Modifier les positions</Text>

      <Text style={styles.info}>
        ⚠️ Ici vous pourrez bientôt gérer la position des ophtalmologues sur la carte.
      </Text>

      <Button title="Valider les modifications" onPress={handleModify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#e11d48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  info: {
    marginBottom: 20,
    color: '#555',
  },
});
