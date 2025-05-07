import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../assets/Lib/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function DirecteurMap() {
  const [locations, setLocations] = useState<{
    id: string;
    commercialEmail: string;
    lat: number;
    lng: number;
    updatedAt?: string;
  }[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setCurrentUserEmail(user.email ?? '');
      } else {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false); // Sécurité en cas de blocage
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const fetchLocations = async () => {
    setRefreshing(true);
    try {
      const snapshot = await getDocs(collection(db, 'locations'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as {
          commercialEmail: string;
          lat: number;
          lng: number;
          updatedAt?: string;
        }),
      }));

      console.log('📍 Données Firestore :', data);
      setLocations(data);

      if (data.length > 0) {
        const lats = data.map(d => d.lat);
        const lngs = data.map(d => d.lng);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const calculatedRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(maxLat - minLat, 0.05) * 1.5,
          longitudeDelta: Math.max(maxLng - minLng, 0.05) * 1.5,
        };

        console.log('🗺️ Région calculée :', calculatedRegion);
        setRegion(calculatedRegion);
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Chargement des positions impossible.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
  
      // ✅ Redirection vers login avec indication de déconnexion
      router.replace({ pathname: '/login', params: { logout: '1' } });
  
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de se déconnecter.',
      });
    }
  };
  

  useEffect(() => {
    fetchLocations();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region ? (
        <MapView style={styles.map} region={region}>
          {locations.map(loc => (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.lat, longitude: loc.lng }}
              title={loc.commercialEmail}
              description={
                loc.updatedAt
                  ? `Dernière mise à jour : ${new Date(loc.updatedAt).toLocaleString()}`
                  : 'Date non définie'
              }
              pinColor={loc.commercialEmail === currentUserEmail ? 'blue' : 'red'}
            />
          ))}
        </MapView>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
          📌 Aucune région calculée. Vérifie tes données Firestore.
        </Text>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchLocations}>
        <Text style={styles.refreshText}>
          {refreshing ? 'Actualisation...' : '🔄 Rafraîchir la carte'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutText}>🚪 Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
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
