import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../assets/Lib/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function CreateUser() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('commercial');

  // Forcer le retour vers login si déconnecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  const handleCreate = async () => {
    if (!email || !password) {
      return Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        role,
      });

      Toast.show({
        type: 'success',
        text1: 'Succès',
        text2: `Utilisateur ${role} créé avec succès.`,
      });

      router.replace('/admin/dashboard');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
  
      // ✅ Redirection avec indication de déconnexion
      router.replace({ pathname: '/login', params: { logout: '1' } });
  
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Déconnexion</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Créer un utilisateur 🧑‍💻</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'commercial' && styles.roleButtonSelected]}
            onPress={() => setRole('commercial')}
          >
            <Text style={[styles.roleButtonText, role === 'commercial' && styles.roleButtonTextSelected]}>
              Commercial
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === 'directeur' && styles.roleButtonSelected]}
            onPress={() => setRole('directeur')}
          >
            <Text style={[styles.roleButtonText, role === 'directeur' && styles.roleButtonTextSelected]}>
              Directeur
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Créer l'utilisateur</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#1e293b',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: 'white',
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#2563eb',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  roleButtonTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: '#2563eb',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#e11d48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 4,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});