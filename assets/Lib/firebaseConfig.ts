// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// ✅ Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBeig9qbbwrCl3_SKKjBTvfUCnSQOmwrfs",
  authDomain: "salesmap-167f6.firebaseapp.com",
  projectId: "salesmap-167f6",
  storageBucket: "salesmap-167f6.appspot.com",
  messagingSenderId: "84487297629",
  appId: "1:84487297629:web:62c0f8386b9371ce838c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Initialisation correcte de l’auth avec AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { app, db, auth };