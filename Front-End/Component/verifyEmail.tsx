// app/verify-email.tsx
import { Text, View, ActivityIndicator } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VerifyEmailScreen() {
  // Extract the token from the URL's query parameters
  const { token } = useSearchParams<{ token?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (token) {
      axios
        .get(`https://your-backend.com/verify-email?token=${token}`)
        .then((response) => {
          if (response.data.success) {
            // If verification is successful, navigate to the next screen
            router.push('/OtherInformation');
          } else {
            setErrorMessage('Verification failed.');
          }
        })
        .catch((error) => {
          console.error(error);
          setErrorMessage('An error occurred during verification.');
        })
        .finally(() => setLoading(false));
    } else {
      setErrorMessage('No token provided.');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {errorMessage ? (
        <Text>{errorMessage}</Text>
      ) : (
        <Text>Email verified successfully!</Text>
      )}
    </View>
  );
}
