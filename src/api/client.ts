import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://burfeecart.com/admin/admin-api.php';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('adminToken');
  if (token) {
    config.headers['X-Admin-Token'] = token;
  }
  return config;
});

export default apiClient;
