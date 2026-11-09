import { Platform } from 'react-native';

const BASE = 'https://pocket-coach-nine.vercel.app';

// On the web, relative paths work. In the phone app, they need the full address.
export const apiUrl = (path) => (Platform.OS === 'web' ? path : BASE + path);