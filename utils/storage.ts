// utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native'; // ✅ Import Alert

// Define a function to add to favourites
export const addToFavourites = async (capturedPhotoUri: string) => {
  try {
    const favourites = await AsyncStorage.getItem('favourites');
    const favouritesList = favourites ? JSON.parse(favourites) : [];

    const newFavourite = {
      name: 'Sample Name', // Add the name of the file or image
      thumbnail: capturedPhotoUri, // Use the capturedPhotoUri passed as an argument
      pages: 10,  // Replace with actual pages or data as needed
      date: new Date().toLocaleDateString(),
      size: '1.2MB',  // Replace with actual size as needed
    };

    favouritesList.push(newFavourite);

    // Save back to AsyncStorage
    await AsyncStorage.setItem('favourites', JSON.stringify(favouritesList));

    // Show success message
    Alert.alert('Added to Favourites'); // ✅ Show Alert

  } catch (error) {
    console.error('Error saving to favourites:', error);
    Alert.alert('Error', 'Failed to add to favourites');  // Show error alert
  }
};
