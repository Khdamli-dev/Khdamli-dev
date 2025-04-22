import * as SecureStore from 'expo-secure-store';
import apiClient from './appClient';

const silentLogin = async (): Promise<boolean> => {
  const email: string | null = await SecureStore.getItemAsync('email');
  const password: string | null = await SecureStore.getItemAsync('password');
  if (!email || !password) return false;

  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    if (response.data.success) {
      // store tokens to expo-secure-store storage
      const {
        accessToken,
        refreshToken,
      }: { accessToken: string; refreshToken: string } = response.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export default silentLogin;
