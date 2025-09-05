import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

export default function GalleryScreen({ route }: any) {
  const navigation = useNavigation();
  const [images, setImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfName, setPdfName] = useState('');

  useEffect(() => {
    if (route.params?.imageUri) {
      setImages([route.params.imageUri]);
    }
  }, [route.params?.imageUri]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Permission to access gallery is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selected = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...selected]);
    }
  };

  const removeImage = (uriToRemove: string) => {
    setImages(prev => prev.filter(uri => uri !== uriToRemove));
  };

  const clearAllImages = () => {
    Alert.alert('Clear All', 'Are you sure you want to remove all selected images?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => setImages([]) },
    ]);
  };

  const handleGeneratePDF = async () => {
    try {
      const trimmedName = pdfName.trim();
      if (!trimmedName) {
        Alert.alert('Invalid Name', 'Please enter a valid PDF name.');
        return;
      }

      const finalName = `${trimmedName}.pdf`;
      const newPath = FileSystem.documentDirectory + finalName;

      // Check both file existence and duplicate in recentFiles
      const fileExists = await FileSystem.getInfoAsync(newPath);
      const existingJson = await AsyncStorage.getItem('recentFiles');
      const existingList = existingJson ? JSON.parse(existingJson) : [];
      const nameTaken = existingList.some((file: any) => file.name === finalName);

      if (fileExists.exists || nameTaken) {
        Alert.alert('Duplicate Name', 'A PDF with this name already exists.');
        return;
      }

      const imageTags = await Promise.all(
        images.map(async (uri, index) => {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
      
          return `
            <div class="page">
              <img src="data:image/jpeg;base64,${base64}"
                   style="max-width: 180mm; max-height: 245mm; object-fit: contain; " />
            </div>`;
        })
      );
      
      
      const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .page {
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-after: always;
            }
           
            img {
              max-width: 180mm;
              max-height: 260mm;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${imageTags.join('')}
        </body>
      </html>
      `;
      

      
      

      
      const { uri } = await Print.printToFileAsync({ html });

      await FileSystem.moveAsync({ from: uri, to: newPath });

      const saveToRecentFiles = async () => {
        const updated = [
          {
            name: finalName,
            uri: newPath,
            date: new Date().toISOString(),
          },
          ...existingList.filter((f: any) => f.uri !== newPath)
        ].slice(0, 10);

        await AsyncStorage.setItem('recentFiles', JSON.stringify(updated));
      };

      setModalVisible(false);
      setPdfName('');

      await saveToRecentFiles();
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create PDF.');
    }
  };

 const renderItem = ({ item }: RenderItemParams<string>) => (
  <View style={styles.imageWrapper}>
    <Image source={{ uri: item }} style={styles.image} />
    <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(item)}>
      <Text style={styles.removeButtonText}>✕</Text>
    </TouchableOpacity>
  </View>
);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.listWrapper}>
        <DraggableFlatList
          data={images}
          keyExtractor={(item, index) => `${item}-${index}`}
          onDragEnd={({ data }) => setImages(data)}
          renderItem={renderItem}
          contentContainerStyle={styles.imageContainer}
          numColumns={3}
        />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.buttonRed, images.length === 0 && styles.buttonDisabled]}
          onPress={clearAllImages}
          disabled={images.length === 0}
        >
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonRed, images.length === 0 && styles.buttonDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={images.length === 0}
        >
          <Text style={styles.buttonText}>Convert to PDF</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={pickImage}>
        <Text style={styles.addButtonText}>+ Add Image</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter PDF Name</Text>
            <TextInput
              placeholder="e.g. MyDocument"
              value={pdfName}
              onChangeText={setPdfName}
              style={styles.input}
              placeholderTextColor="#aaa"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleGeneratePDF}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#777' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  backArrow: { fontSize: 28, marginBottom: 15, color: '#000' },
  listWrapper: { flex: 1, maxHeight: 400 },
  imageContainer: { justifyContent: 'center', paddingBottom: 30 },
  imageWrapper: { position: 'relative', margin: 8, width: 90, height: 150 },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  removeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 50 },
  buttonRed: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b71c1c',
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: '#aaa', borderColor: '#888' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  addButton: {
    marginTop: 20,
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
    marginBottom: 20,
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});
