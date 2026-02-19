import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface SweetAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'delete';
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const SweetAlert: React.FC<SweetAlertProps> = ({
  visible,
  title,
  message,
  type = 'delete',
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  const isError = type === 'error' || type === 'delete';
  const mainColor = isError ? '#d93025' : '#29A539';
  const icon = isError ? '✕' : '✓';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <View style={[styles.iconCircle, { backgroundColor: mainColor }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          <Text style={[styles.alertTitle, { color: mainColor }]}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.btnRow}>
            {onCancel && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                <Text style={styles.cancelBtnText}>
                  {cancelText || 'CANCEL'}
                </Text>
              </TouchableOpacity>
            )}
            {onConfirm && (
              <TouchableOpacity
                style={[styles.confirmBtn, { borderColor: mainColor }]}
                onPress={onConfirm}
              >
                <Text style={[styles.confirmBtnText, { color: mainColor }]}>
                  {confirmText || (type === 'delete' ? 'DELETE' : 'OK')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: { color: '#fff', fontSize: 35, fontWeight: 'bold' },
  alertTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  alertMessage: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  cancelBtn: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#3c4043',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelBtnText: { color: '#3c4043', fontWeight: 'bold' },
  confirmBtn: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: { fontWeight: 'bold' },
});

export default SweetAlert;
