import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type QRCodeRef = {
  toDataURL(callback: (dataURL: string) => void): void;
};

export default function GenerateScreen() {
  const [url, setUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<QRCodeRef | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (url.trim() === '') {
      setShowQR(false);
    }
  }, [url]);

  const handleGenerate = () => {
    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      Alert.alert('Missing URL', 'Please enter a valid URL.');
      return;
    }

    let fullUrl = trimmedUrl;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' +
        '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' +
        'localhost|' +
        '\\d{1,3}(\\.\\d{1,3}){3})' +
        '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' +
        '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' +
        '(\\#[-a-zA-Z\\d_]*)?$',
      'i'
    );

    if (!urlPattern.test(fullUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid web address.');
      return;
    }

    setUrl(fullUrl);
    setShowQR(true);
    Keyboard.dismiss();
  };


    

  const handleShare = () => {
    qrRef.current?.toDataURL(async (dataURL: string) => {
      try {
        const uri = `data:image/png;base64,${dataURL}`;
        await Share.share({
          url: uri,
          message: 'Here is your QR Code',
        });
      } catch {
        Alert.alert('Error', 'Unable to share QR code.');
      }
    });
  };

  const handleOpen = () => {
    let link = url.trim();
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = 'https://' + link;
    }

    Linking.canOpenURL(link)
      .then((supported) => {
        if (supported) {
          Linking.openURL(link);
        } else {
          Alert.alert('Invalid URL', 'Unable to open this link.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Something went wrong trying to open the link.');
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={29} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.label}> Enter URL to Generate QR Code</Text>

        <TextInput
          style={[styles.input, { color: 'black' }]}
          placeholder="https://example.com"
          placeholderTextColor="#999"
          onChangeText={setUrl}
          value={url}
          keyboardType="url"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
          <Text style={styles.generateText}>Generate QR Code</Text>
        </TouchableOpacity>

        {showQR && url.trim() !== '' && (
          <View style={styles.qrContainer}>
            <QRCode
              value={url}
              size={200}
              getRef={(ref: QRCodeRef | null) => (qrRef.current = ref)}
            />
            <View style={styles.popupRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Feather name="share-2" size={22} color="#fff" />
                <Text style={styles.iconLabel}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleOpen}>
                <Feather name="external-link" size={22} color="#fff" />
                <Text style={styles.iconLabel}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  label: {
    fontSize: 18,
    marginTop: 150,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    borderColor: '#888',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  generateBtn: {
    backgroundColor: '#0f766e',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  generateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  popupRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    width: '80%',
    backgroundColor: '#0f766e',
    paddingVertical: 14,
    borderRadius: 12,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: '#fff',
    marginTop: 5,
    fontSize: 13,
    fontWeight: '500',
  },
});
