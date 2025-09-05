import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type StripeModalProps = {
  visible: boolean;
  onClose: () => void;
};
export default function StripeModal({ visible, onClose } : StripeModalProps) {
  const [amount, setAmount] = useState(2); // default to $2
  const openStripeCheckout = async () => {
    let url = '';
    // Map amounts to Stripe links
    switch (amount) {
      case 2:
        url = 'https://buy.stripe.com/6oUdR9a8Q2Fv0f0gWQgYU01';
        break;
      case 3:
        url = 'https://buy.stripe.com/9B66oH94M0xne5QeOIgYU02';
        break;
      case 4:
        url = 'https://buy.stripe.com/5kQ3cva8QgwlbXIaysgYU03';
        break;
      case 5:
        url = 'https://buy.stripe.com/cNidR980Icg55zk21WgYU04';
        break;
      case 10:
        url = 'https://buy.stripe.com/3cI5kD0yg2Fvd1M8qkgYU05';
        break;
      default:
        url = 'https://buy.stripe.com/test_4gMeVd4Owfshe5Q9uogYU00';
    }
    await WebBrowser.openBrowserAsync(url);
    setAmount(2); // reset to default
    onClose();
  };
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Buy Me a Coffee</Text>
            <Text style={styles.description}>
              Your support helps me keep building awesome free apps.
              {'\n'}Every coffee fuels another feature!
            </Text>
            {/* Amount buttons */}
            <View style={styles.amountRow}>
              {[2, 3, 4, 5, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.amountButton,
                    amount === value && styles.amountButtonSelected,
                  ]}
                  onPress={() => setAmount(value)}
                >
                  <Text
                    style={[
                      styles.amountText,
                      amount === value && styles.amountTextSelected,
                    ]}
                  >
                    ${value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.donateButton} onPress={openStripeCheckout}>
              <Text style={styles.donateButtonText}>Donate</Text>
            </TouchableOpacity>
            <Text style={styles.secureText}>Secured by Stripe Checkout</Text>
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
  },
  amountRow: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  amountButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  amountButtonSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  amountText: {
    fontSize: 14,
    color: '#333',
  },
  amountTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  donateButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 999,
    marginBottom: 16,
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secureText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  cancel: {
    padding: 6,
  },
  cancelText: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
});