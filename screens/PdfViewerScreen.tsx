import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { RootStackParamList } from '../types/navigation';

type PdfViewerRouteProp = RouteProp<RootStackParamList, 'PdfViewer'>;

export default function PdfViewerScreen() {
  const route = useRoute<PdfViewerRouteProp>();
  const navigation = useNavigation();
  const { uri } = route.params;

  const [validUri, setValidUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFile = async () => {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
          setValidUri(uri.startsWith('file://') ? uri : `file://${uri}`);
        } else {
          Alert.alert('Error', 'File not found.');
          navigation.goBack();
        }
      } catch (err) {
        console.error('File check failed:', err);
        Alert.alert('Error', 'Failed to load PDF.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    checkFile();
  }, [uri]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>PDF Viewer</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 20 }} />
      ) : validUri ? (
        <WebView
          source={{ uri: validUri }}
          style={styles.webview}
          originWhitelist={['*']}
          useWebKit={true}
          startInLoadingState={true}
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load PDF.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 50,
    marginTop: 40,
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 4,
    zIndex: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  webview: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
});
