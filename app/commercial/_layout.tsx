import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../assets/Lib/firebaseConfig';

export default function CommercialLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  return <Stack />;
}

