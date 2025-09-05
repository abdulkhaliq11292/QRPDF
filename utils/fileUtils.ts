// utils/fileUtils.ts
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FAVORITES_DIR = FileSystem.documentDirectory + 'favorites/';

export async function ensureFavoritesFolder(): Promise<string> {
  const info = await FileSystem.getInfoAsync(FAVORITES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FAVORITES_DIR, { intermediates: true });
  }
  return FAVORITES_DIR;
}

// Add entry to recents list
export async function addToRecent(name: string, uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  const newEntry = {
    name,
    uri,
    date: new Date().toLocaleDateString(),
    size: info.exists && typeof info.size === 'number' ? `${(info.size / 1024) | 0} KB` : '0 KB',
  };
  const stored = await AsyncStorage.getItem('recentFiles');
  const arr = stored ? JSON.parse(stored) : [];
  arr.unshift(newEntry);
  await AsyncStorage.setItem('recentFiles', JSON.stringify(arr.slice(0, 20)));
}
