import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

  const FAVORITES_DIR = FileSystem.documentDirectory + 'favorites/';

  export default function UnifiedCameraScreen() {
    const navigation = useNavigation();
    
    const [,requestPermission] = useCameraPermissions();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameraActive, setCameraActive] = useState(true);
    const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
    const cameraRef = useRef<CameraView | null>(null);

    const [scannedData, setScannedData] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const [capturedImage, setCapturedImage] = useState<any>(null);
    const [pdfModalVisible, setPdfModalVisible] = useState(false);
    const [pdfName, setPdfName] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);

    const lastScanTime = useRef(0);
    const lastScanValue = useRef('');

    useEffect(() => {
      (async () => {
        const { status } = await requestPermission();
        setHasPermission(status === 'granted');

        const info = await FileSystem.getInfoAsync(FAVORITES_DIR);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(FAVORITES_DIR, { intermediates: true });
        }
      })();
    }, []);

    const handleBarCodeScanned = ({ data }: { data: string }) => {
      const now = Date.now();
      if (now - lastScanTime.current > 2000 || data !== lastScanValue.current) {
        lastScanTime.current = now;
        lastScanValue.current = data;
        setScannedData(data);
        setModalVisible(true);
      }
    };

    const handleCopy = async () => {
      await Clipboard.setStringAsync(scannedData);
      showToast('Copied to clipboard!');
    };

    const showToast = (msg: string) => {
      if (Platform.OS === 'android') {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert('', msg);
      }
    };

    const handleOpenLink = () => {
      let url = scannedData;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      Linking.canOpenURL(url)
        .then((supported) => supported && Linking.openURL(url))
        .catch(() => Alert.alert('Error', 'Could not open link'));
    };

    const takePicture = async () => {
      if (cameraRef.current && !isCapturing) {
        setIsCapturing(true);
        try {
          const pic = await cameraRef.current.takePictureAsync({ quality: 1 });
          setCapturedImage(pic);
          setCameraActive(false);
          setPdfModalVisible(true);
        } catch (e) {
          console.error("Capture error", e);
          Alert.alert("Error", "Failed to capture image.");
        } finally {
          setIsCapturing(false);
        }
      }
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
    
        const fileExists = await FileSystem.getInfoAsync(newPath);
        const existingJson = await AsyncStorage.getItem('recentFiles');
        const existingList = existingJson ? JSON.parse(existingJson) : [];
    
        const validRecentList = [];
        for (const file of existingList) {
          const info = await FileSystem.getInfoAsync(file.uri);
          if (info.exists) validRecentList.push(file);
        }
        await AsyncStorage.setItem('recentFiles', JSON.stringify(validRecentList));
    
        const nameTaken = validRecentList.some((file: any) => file.name === finalName);
    
        if (fileExists.exists || nameTaken) {
          Alert.alert('Duplicate Name', 'A PDF with this name already exists.');
          return;
        }
    
        if (!capturedImage?.uri) {
          Alert.alert('No photo', 'No photo to convert.');
          return;
        }
    
        // ✅ Hide modal immediately
        setModalVisible(false);
        setPdfName('');
    
      
          const base64 = await FileSystem.readAsStringAsync(capturedImage.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
    
          const html = `
            <html><body style="margin:0;padding:0;">
              <img src="data:image/jpeg;base64,${base64}" style="width:100%; margin-top:50px; max-height: 73vh; object-fit: contain;" />
            </body></html>`;
    
       
      
        const { uri } = await Print.printToFileAsync({ html });
    
        await FileSystem.moveAsync({ from: uri, to: newPath });
    
        const updatedRecent = [
          {
            name: finalName,
            uri: newPath,
            date: new Date().toISOString(),
          },
          ...validRecentList.filter((f: any) => f.uri !== newPath),
        ].slice(0, 10);
        await AsyncStorage.setItem('recentFiles', JSON.stringify(updatedRecent));
    
        setModalVisible(false);
      setPdfName('');

      setCapturedImage(null); 
      setCameraActive(true);
      setPdfModalVisible(false); 

      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to create PDF.');
      }
    };
    
    const cancelPdfModal = () => {
      setPdfModalVisible(false);
      setPdfName('');
      setCapturedImage(null);
      setIsCapturing(false);
      setCameraActive(true);
    };

    const handleFlipCamera = () => {
      setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    };

    const handleGoBack = () => {
      navigation.goBack();
    };

    if (hasPermission === false) {
      return (
        <View style={styles.centered}>
          <Text>No camera permission</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {cameraActive && hasPermission && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            facing={cameraType}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
        )}

        <View style={styles.bottomControls}>
          <TouchableOpacity onPress={handleGoBack} style={styles.sideButton}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={takePicture} />

          <TouchableOpacity onPress={handleFlipCamera} style={styles.sideButton}>
            <Ionicons name="camera-reverse-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* QR Modal */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>QR Result</Text>
              <TouchableOpacity onPress={handleOpenLink}>
                <Text style={styles.modalLink}>{scannedData}</Text>
              </TouchableOpacity>
              <View style={styles.popupRow}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleCopy}>
                  <Ionicons name="copy-outline" size={22} color="#fff" />
                  <Text style={styles.iconLabel}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => Share.share({ message: scannedData })}>
                  <Ionicons name="share-social-outline" size={22} color="#fff" />
                  <Text style={styles.iconLabel}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleOpenLink}>
                  <Ionicons name="open-outline" size={22} color="#fff" />
                  <Text style={styles.iconLabel}>Open</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* PDF Modal */}
        <Modal visible={pdfModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>PDF File Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter name or leave blank"
                placeholderTextColor="#aaa"
                value={pdfName}
                onChangeText={setPdfName}
              />
              <View style={styles.popupRow}>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#1E90FF' }]} onPress={handleGeneratePDF}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#999' }]} onPress={cancelPdfModal}>
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
    container: { flex: 1, backgroundColor: 'white' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bottomControls: {
      position: 'absolute',
      bottom: 32,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 40,
      alignItems: 'center',
    },
    captureBtn: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#fff',
      borderWidth: 4,
      borderColor: '#ddd',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sideButton: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 25,
      padding: 10,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalBox: {
      width: '80%',
      backgroundColor: '#0f766e',
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    modalLink: { color: '#00BFFF', textAlign: 'center', marginBottom: 20, textDecorationLine: 'underline' },
    popupRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
    iconBtn: { alignItems: 'center', padding: 10 },
    iconLabel: { fontSize: 13, color: '#fff', marginTop: 4 },
    button: { backgroundColor: '#36b3fa', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    textInput: {
      width: '100%',
      color: 'white',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
    },
  });
