import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '../../assets/Lib/firebaseConfig';

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login'); // Redirige si pas connecté
      }
    });
    return unsubscribe;
  }, []);

  return <Stack />;
}
