import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';

import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '../utils/ThemeContext';
import { colors } from '../utils/themeColors';

interface FavouriteItem {
  name: string;
  thumbnail: string;
  pages: number;
  date: string;
  size: string;
  uri: string; // PDF file path
}

const FavouriteScreen = () => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const { theme } = useTheme();
  const themeColors = colors[theme as keyof typeof colors];
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadFavourites();
  }, []);

  
  const loadFavourites = async () => {
    try {
      const json = await AsyncStorage.getItem('favourites');
      if (json) {
        setFavourites(JSON.parse(json));
      }
    } catch (err) {
      console.error('Error loading favourites:', err);
    }
  };

  const openPdf = async (uri: string) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      Alert.alert('Error', 'File does not exist.');
      return;
    }

    navigation.navigate('PdfViewer', { uri });
  };

  const removeFavourite = async (fileName: string) => {
    Alert.alert('Remove', 'Remove from favourites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = favourites.filter((item) => item.name !== fileName);
          await AsyncStorage.setItem('favourites', JSON.stringify(updated));
          setFavourites(updated);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: FavouriteItem }) => (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <Image
        source={{ uri: item.thumbnail || 'fallback_image_uri' }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: themeColors.text }]}>{item.name}</Text>
        <Text style={[styles.meta, { color: themeColors.text }]}>
          {item.pages} pages | {item.date} | {item.size}
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.btnOpen}
        onPress={() => openPdf(item.uri)}
      >
        <Text style={styles.btnText}>Open</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeFavourite(item.name)}>
        <Text style={styles.heart}>💔</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
     <View style={styles.header}>
  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
    <Feather name="arrow-left" size={29} color="black" />
  </TouchableOpacity>
  <Text style={styles.headerText}>Favourite</Text>
</View>


      {favourites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/images/no-file.png')}
            style={styles.emptyImage}
          />
          <Text style={[styles.emptyText, { color: themeColors.text }]}>
            No File Found
          </Text>
        </View>
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  backText: {
    fontSize: 19,
    color: '#007AFF',
  },
  headerText: {
    //marginLeft: 55,
    marginTop:10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginTop: 50,
  },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  meta: { fontSize: 12 },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnOpen: {
    backgroundColor: '#1976d2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  heart: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: 'gray',
    borderWidth: 1,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyImage: { width: 200, height: 100, marginBottom: 0 },
  emptyText: { fontSize: 16 },
});

export default FavouriteScreen;
