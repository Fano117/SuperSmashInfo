import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface PasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  title?: string;
}

// Contraseña hardcodeada - NUNCA mostrar al usuario
const SECURE_PASSWORD = 'StAnBanco2026';

export default function PasswordModal({
  visible,
  onCancel,
  onSuccess,
  title = '🔐 SEGURIDAD',
}: PasswordModalProps) {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (password === SECURE_PASSWORD) {
      setPassword('');
      onSuccess();
    } else {
      Alert.alert('❌ ERROR', 'Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.label}>Ingresa la contraseña:</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#666"
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>CANCELAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>CONFIRMAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderWidth: 4,
    borderColor: '#ffd700',
    width: '100%',
    maxWidth: 400,
  },
  header: {
    backgroundColor: '#e94560',
    padding: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  title: {
    color: '#ffd700',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  body: {
    padding: 20,
  },
  label: {
    color: '#eeeeee',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0f3460',
    borderWidth: 3,
    borderColor: '#e94560',
    color: '#eeeeee',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderWidth: 3,
  },
  cancelButton: {
    backgroundColor: '#16213e',
    borderColor: '#888',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  confirmButton: {
    backgroundColor: '#00ff00',
    borderColor: '#00aa00',
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
