import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import StripeModal from '../screens/StripeModel';

import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const pickImageAndNavigate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      selectionLimit: 0,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setSelectedImage(selectedImageUri);
      navigation.navigate('Gallery', { imageUri: selectedImageUri });
    } else {
      Alert.alert('No images selected', 'Please select at least one image.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cart Button */}
      <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 1 }}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            backgroundColor: '#F97316',
            borderRadius: 60,
            padding: 8,
            elevation: 3,
          }}
        >
         <Ionicons name="cafe" size={30} color="white" />     

        </TouchableOpacity>
      </View>

      <Text style={styles.appTitle}>Snap QR & PDF</Text>
      <Text style={styles.subtitle}>One App. Two Powerful Tools.</Text>

      {/* Grid Cards */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Camera')}>
          <Image
            source={require('../assets/images/camera-icon.png')}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Select Camera Scan & PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Generate')}>
          <Image
            source={require('../assets/images/generate.png')}
            style={styles.gicon}
          />
          <Text style={styles.cardText}>Generate QR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={pickImageAndNavigate}>
          <Image
            source={require('../assets/images/gallery-icon.png')}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Select Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Favourite')}>
          <Image
            source={require('../assets/images/heart-icon.png')}
            style={styles.icon}
          />
          <Text style={styles.cardText}>Favourite</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.RecentCard}
        onPress={() => navigation.navigate('Recent')}
      >
        <Image
          source={require('../assets/images/recent.png')}
          style={styles.icon}
        />
        <Text style={styles.cardText}>Recent Files</Text>
      </TouchableOpacity>

      {/* Stripe Modal */}
      <StripeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 28,
    marginLeft: 10,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'left',
    marginTop: 10,
  },
  subtitle: {
    fontWeight: 'bold',
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 80,
    textAlign: 'left',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '47%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gicon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 40,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  RecentCard: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 13,
    paddingVertical: 20,
    marginBottom: 70,
    alignItems: 'center',
    justifyContent: 'center',
    width: '98%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
