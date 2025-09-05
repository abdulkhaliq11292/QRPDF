import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GalleryScreen() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      // Request permission to access the media library (gallery)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        // Get photos from the 'DCIM' album
        const album = await MediaLibrary.getAlbumAsync('DCIM');
        const assets = await MediaLibrary.getAssetsAsync({
          album: album?.id,
          mediaType: 'photo',
          first: 50,
          sortBy: ['creationTime'],
        });
        setPhotos(assets.assets);  // Set photos to state
      } else {
        Alert.alert('Permission required to access gallery');
      }
    })();
  }, []);

  const toggleSelect = (uri: string) => {
    // Toggle selection of the image
    setSelected((prev) =>
      prev.includes(uri) ? prev.filter((u) => u !== uri) : [...prev, uri]
    );
  };

  const createPDF = async () => {
    // If no images are selected, show an alert
    if (selected.length === 0) {
      Alert.alert('Select images first');
      return;
    }

    // Create the HTML for the PDF with selected images
    const html = `
      <html>
        <body style="text-align: center;">
          ${selected
            .map(
              (uri) => `<img src="${uri}" style="width: 100%; margin: 10px 0;" />`
            )
            .join('')}
        </body>
      </html>
    `;

    // Generate the PDF from the HTML
    const { uri } = await Print.printToFileAsync({ html });

    // Alert the user with the path of the generated PDF
    Alert.alert('PDF Created', 'PDF path:\n' + uri);
    console.log('PDF File:', uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Multiple Photos</Text>

      {/* List of photos */}
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        numColumns={3}  // Display 3 images per row
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleSelect(item.uri)}>
            <Image
              source={{ uri: item.uri }}
              style={[
                styles.image,
                selected.includes(item.uri) && styles.selectedImage,
              ]}
            />
          </TouchableOpacity>
        )}
      />

      {/* Show the 'Convert to PDF' button if any images are selected */}
      {selected.length > 0 && (
        <Button title="Convert to PDF" onPress={createPDF} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 10 },
  heading: { fontSize: 20, textAlign: 'center', marginBottom: 10 },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedImage: {
    borderColor: '#007BFF', // Highlight selected images with a blue border
    borderWidth: 3,
  },
});
