import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

interface VerificationResult {
  success: boolean;
  message: string;
  userToken?: string;
}

export default function VerificationScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setVerifying(false);
      setVerificationResult({
        success: false,
        message: 'No verification token found'
      });
    }
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      // Send token to your backend API for verification
      const data : any = await axios.get(`http://192.168.8.122:8000/auth/signup/confirm-email/${token}`)
      .then((data) => data.data);
      
      if (data.success) {
        // Example: store authentication token
        // await AsyncStorage.setItem('userToken', data.userToken);
        // Navigate to home screen after 2 seconds
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      }
    } catch (error : any) {
      console.error('Verification error:', error);
      setVerificationResult({
        success: false,
        message: 'Network error during verification'
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      
      {verifying ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.message}>Verifying your email...</Text>
        </View>
      ) : verificationResult?.success ? (
        <View style={styles.resultContainer}>
          <Text style={styles.successMessage}>Email Successfully Verified!</Text>
          <Text style={styles.redirectMessage}>Redirecting to home screen...</Text>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.errorMessage}>Verification Failed</Text>
          <Text style={styles.errorDetails}>{verificationResult?.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  redirectMessage: {
    fontSize: 14,
    color: 'gray',
  },
  errorMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    textAlign: 'center',
  },
});