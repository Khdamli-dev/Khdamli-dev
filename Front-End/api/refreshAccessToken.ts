import * as SecureStore from 'expo-secure-store';
import apiClient from './appClient';
import silentLogin from './silentLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// this function return true when refresh access token with success
// and when both tokens are expired or invalid it make silent login and return true if it is success
// otherwise it return false

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken)
      return false;

    const response = await apiClient.post('/auth/refresh', null, {
      headers: {
        'x-refresh-token': `Bearer ${refreshToken}`,
      },
    });
    
    if (response.data.success) {
      const { accessToken }: { accessToken: string } = response.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      await AsyncStorage.setItem('userId',String(response.data.userId));
      await AsyncStorage.setItem('role', String(response.data.role));
      return true;
    }

    // session expired or not valid tokens
    return await silentLogin();
  } catch (error : any) {
    // session expired or not valid tokens
    return await silentLogin();
  }
};

export default refreshAccessToken;
