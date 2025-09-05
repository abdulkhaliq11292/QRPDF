import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../types/navigation';

const FAVORITES_KEY = 'favourites';
const RECENT_KEY = 'recentFiles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RecentFile {
  uri: string;
  name: string;
  date: string;
  size: string;
  pages?: number;
  thumbnail?: string;
}

const RecentFilesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [favouritedUris, setFavouritedUris] = useState<string[]>([]);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  useEffect(() => {
    if (recentFiles.length > 0) loadFavourites();
  }, [recentFiles]);

  const loadRecentFiles = async () => {
    try {
      const json = await AsyncStorage.getItem(RECENT_KEY);
      if (json) setRecentFiles(JSON.parse(json));
    } catch (err) {
      console.error('Failed to load recent files:', err);
    }
  };

  const loadFavourites = async () => {
    try {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      if (json) {
        const favs: RecentFile[] = JSON.parse(json);
        const favUris = favs.map(f => f.uri);
        setFavouritedUris(favUris);
      }
    } catch (err) {
      console.error('Failed to load favourites:', err);
    }
  };

  const openPdf = async (uri: string) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) return Alert.alert('Error', 'File not found.');
    navigation.navigate('PdfViewer', { uri });
  };

  const deletePdf = async (file: RecentFile) => {
    Alert.alert('confirmation?', 'Are you sure You want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await FileSystem.deleteAsync(file.uri, { idempotent: true });
            const updatedRecent = recentFiles.filter(f => f.uri !== file.uri);
            await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updatedRecent));
            setRecentFiles(updatedRecent);

            const favJson = await AsyncStorage.getItem(FAVORITES_KEY);
            if (favJson) {
              const favs: RecentFile[] = JSON.parse(favJson);
              const updatedFavourites = favs.filter(f => f.uri !== file.uri);
              await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavourites));
              setFavouritedUris(updatedFavourites.map(f => f.uri));
            }
          } catch (err) {
            console.error('Delete failed:', err);
            Alert.alert('Error', 'Could not delete file.');
          }
        },
      },
    ]);
  };

  const deleteAllPdfs = () => {
    Alert.alert('Confirmation?', 'Are you sure you want to delete all files?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          try {
            for (const file of recentFiles) {
              await FileSystem.deleteAsync(file.uri, { idempotent: true });
            }
            await AsyncStorage.multiRemove([RECENT_KEY, FAVORITES_KEY]);
            setRecentFiles([]);
            setFavouritedUris([]);
          } catch (err) {
            console.error('Delete all failed:', err);
            Alert.alert('Error', 'Failed to delete all.');
          }
        },
      },
    ]);
  };

  const toggleFavourite = async (item: RecentFile) => {
    try {
      const json = await AsyncStorage.getItem(FAVORITES_KEY);
      let favourites: RecentFile[] = json ? JSON.parse(json) : [];
      const exists = favourites.some(f => f.uri === item.uri);

      if (exists) {
        favourites = favourites.filter(f => f.uri !== item.uri);
        setFavouritedUris(prev => prev.filter(uri => uri !== item.uri));
        Alert.alert('Removed', 'File removed from favourites.');
      } else {
        favourites.unshift(item);
        setFavouritedUris(prev => [...prev, item.uri]);
        Alert.alert('Added', 'File added to favourites.');
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favourites));
    } catch (err) {
      console.error('Toggle favourite failed:', err);
    }
  };

  const sharePdf = async (uri: string) => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return Alert.alert('Not available');
      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error('Share failed:', err);
      Alert.alert('Error sharing file');
    }
  };

  const renderItem = ({ item }: { item: RecentFile }) => (
    <View style={styles.card}>
      <Text style={styles.fileName}>{item.name}</Text>
      <Text style={styles.meta}>{item.size} | {item.date}</Text>
      <View style={styles.rowBetween}>
        <View style={styles.leftButtons}>
          <TouchableOpacity style={styles.btnOpen} onPress={() => openPdf(item.uri)}>
            <Text style={styles.btnText}>Open</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDelete} onPress={() => deletePdf(item)}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnShare} onPress={() => sharePdf(item.uri)}>
            <Text style={styles.btnText}>Share</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btnFav} onPress={() => toggleFavourite(item)}>
          <Text style={styles.btnText}>{favouritedUris.includes(item.uri) ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={29} color="#0f172a" />
      </TouchableOpacity>
      <Text style={styles.headerText}>Recent Files</Text>
      <TouchableOpacity style={styles.deleteAllBtn} onPress={deleteAllPdfs}>
        <Text style={styles.deleteAllText}>Delete All</Text>
      </TouchableOpacity>
      {recentFiles.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recent files</Text>
        </View>
      ) : (
        <FlatList data={recentFiles} keyExtractor={item => item.uri} renderItem={renderItem} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  fileName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 12, color: '#555', marginBottom: 10 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  btnOpen: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  btnDelete: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnShare: {
    backgroundColor: '#36b3fa',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnFav: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: { color: '#fff', fontWeight: '600' },
  leftButtons: { flexDirection: 'row' },
  deleteAllBtn: {
    backgroundColor: '#d32f2f',
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  deleteAllText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#333' },
  backButton: { marginTop: 35, marginBottom: 10, marginRight: 10 },
  headerText: {
    //marginLeft: 105,
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecentFilesScreen;
