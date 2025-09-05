import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Import GestureHandlerRootView
import { ThemeProvider } from '../utils/ThemeContext'; // Import your ThemeProvider
import { PremiumProvider } from '../contexts/PremiumContext'; // ✅ Import PremiumProvider
import RecentFilesScreen from '../screens/RecentFilesScreen';

import CameraScreen from '../screens/CameraScreen';
import FavouriteScreen from '../screens/FavouriteScreen';
import GalleryScreen from '../screens/GalleryScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from './explore';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import GenerateScreen from '@/screens/GenerateScreen';
//import PurchaseScreen from '@/screens/PurchaseScreen';

const Stack = createNativeStackNavigator();

const Layout: React.FC = () => {
  return (
    // Wrap everything with ThemeProvider and PremiumProvider
    <ThemeProvider>
      <PremiumProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Favourite" component={FavouriteScreen} />
            <Stack.Screen name="Gallery" component={GalleryScreen} />
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen name="Recent" component={RecentFilesScreen} />
            <Stack.Screen name="PdfViewer" component={PdfViewerScreen} />
            <Stack.Screen name="Generate" component={GenerateScreen} />
            {/* <Stack.Screen name="Purchase" component={PurchaseScreen} /> */}

          </Stack.Navigator>
        </GestureHandlerRootView>
      </PremiumProvider>
    </ThemeProvider>
  );
};

export default Layout;
