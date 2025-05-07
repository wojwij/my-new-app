// app/commercial/map.tsx
import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../assets/Lib/firebaseConfig';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_API_KEY } from '../../assets/Lib/env';
import axios from 'axios';
import { decode } from '@mapbox/polyline'; 



export default function CommercialMap() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOphtas, setSelectedOphtas] = useState<{ lat: number; lng: number; name: string }[]>([]);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [showFiche, setShowFiche] = useState(false);
  const [currentOphta, setCurrentOphta] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [remarque, setRemarque] = useState('');
  const [categorie, setCategorie] = useState<'A' | 'B' | 'C' | null>(null);
  const router = useRouter();

  const sendLocationToFirestore = async (coords: { latitude: number; longitude: number }) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      await setDoc(doc(db, 'locations', email), {
        commercialEmail: email,
        lat: coords.latitude,
        lng: coords.longitude,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Erreur Firestore :', err);
    }
  };

  const saveFicheToFirestore = async () => {
    if (!auth.currentUser || !currentOphta || !categorie || !remarque) return;
    try {
      await addDoc(collection(db, 'visites'), {
        commercialEmail: auth.currentUser.email,
        ophtalmoName: currentOphta.name,
        remarque,
        categorie,
        km: 0,
        timestamp: new Date().toISOString(),
      });
      setShowFiche(false);
      setRemarque('');
      setCategorie(null);
    } catch (err) {
      console.error('Erreur enregistrement fiche :', err);
    }
  };

  const fetchOptimizedRoute = async (
    origin: { latitude: number; longitude: number },
    destinations: { lat: number; lng: number }[]
  ) => {
    try {
      const waypoints = destinations.map(dest => `${dest.lat},${dest.lng}`).join('|');
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${origin.latitude},${origin.longitude}&waypoints=optimize:true|${waypoints}&mode=driving&key=${GOOGLE_API_KEY}`
      );
      if (response.data.routes.length) {
        const points = decode(response.data.routes[0].overview_polyline.points);
        const coords = (points as [number, number][]).map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
      }
    } catch (error) {
      console.error('Erreur Directions API:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) router.replace('/login');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let subscriber: Location.LocationSubscription;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 20,
        },
        (loc) => {
          const coords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setLocation(coords);
          sendLocationToFirestore(coords);
          setLoading(false);

          for (let ophta of selectedOphtas) {
            const distance = Math.sqrt(
              Math.pow(coords.latitude - ophta.lat, 2) +
              Math.pow(coords.longitude - ophta.lng, 2)
            );
            if (distance < 0.001) {
              setCurrentOphta(ophta);
              setShowFiche(true);
              break;
            }
          }
        }
      );
    })();
    return () => subscriber && subscriber.remove();
  }, [selectedOphtas]);

  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
        placeholder="Chercher ophtalmologue"
        onPress={(data, details = null) => {
          if (details?.geometry?.location) {
            const { lat, lng } = details.geometry.location;
            const name = data.description;
            const newOphta = { lat, lng, name };
            const updatedList = [...selectedOphtas, newOphta];
            setSelectedOphtas(updatedList);
            if (location) fetchOptimizedRoute(location, updatedList);
          }
        }}
        fetchDetails
        query={{
          key: GOOGLE_API_KEY,
          language: 'fr',
          types: 'establishment',
          keyword: 'ophtalmologue',
        }}
        styles={{
          container: { flex: 0, position: 'absolute', width: '90%', zIndex: 1, marginTop: 40, alignSelf: 'center' },
          listView: { backgroundColor: 'white' },
        }}
      />

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Ma position"
            pinColor="blue"
          />
        )}
        {selectedOphtas.map((ophta, idx) => (
          <Marker
            key={idx}
            coordinate={{ latitude: ophta.lat, longitude: ophta.lng }}
            title={ophta.name}
            pinColor="green"
          />
        ))}
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="green" />}
      </MapView>

      <Modal visible={showFiche} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📝 Fiche de visite</Text>
            <Text>Ophtalmologue : {currentOphta?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Remarque..."
              value={remarque}
              onChangeText={setRemarque}
            />
            <View style={styles.categorieContainer}>
              {['A', 'B', 'C'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categorieButton, categorie === cat && styles.selectedCat]}
                  onPress={() => setCategorie(cat as 'A' | 'B' | 'C')}
                >
                  <Text style={styles.categorieText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={saveFicheToFirestore}>
              <Text style={{ color: 'white' }}>✅ Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    width: '90%',
    borderRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categorieContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  categorieButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  selectedCat: {
    backgroundColor: '#2563eb',
  },
  categorieText: {
    color: 'black',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    marginTop: 20,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
});
