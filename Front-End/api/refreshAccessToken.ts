import * as SecureStore from 'expo-secure-store';
import apiClient from './appClient';

const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken)
        return false;
    // apiClient.interceptors.request.use(
    //   async (config) => {
    //     // grab the refresh token
    //     if (token) {
    //       config.headers['x-refresh-token'] =
    //         `x-refresh-token ${token}`;
    //     }
    //     return config;
    //   },
    //   (err) => Promise.reject(err),
    // );
    const response = await apiClient.post('/auth/refresh', null, {
      headers: {
        'x-refresh-token': refreshToken,
      },
    });
    if (response.data.success) {
      const { accessToken }: { accessToken: string } = response.data;
      await SecureStore.setItemAsync('accessToken', accessToken);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default refreshAccessToken;
