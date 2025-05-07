import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Titre principal */}
        <Text style={styles.title}>Bienvenue, MARWA </Text>

        {/* Sous-titre */}
        <Text style={styles.subtitle}>Gérez votre plateforme en toute simplicité</Text>

        {/* Boutons d'action */}
        <TouchableOpacity style={styles.button} onPress={() => router.push('/admin/create-user' as any)}>
          <Text style={styles.buttonText}>➕ Créer un utilisateur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/admin/edit-map' as any)}>
          <Text style={styles.buttonSecondaryText}>🗺️ Modifier les positions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => router.push('/admin/delete-user' as any)}>
  <Text style={styles.deleteButtonText}>🗑️ Supprimer un utilisateur</Text>
</TouchableOpacity>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Fond très haut de gamme
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b', // Bleu gris très moderne
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#2563eb', // Bleu premium
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  buttonSecondaryText: {
    color: '#2563eb',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});