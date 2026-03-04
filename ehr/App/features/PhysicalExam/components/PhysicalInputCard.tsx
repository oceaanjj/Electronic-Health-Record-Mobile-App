import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CDSSModal from '../../../components/CDSSModal';
import SweetAlert from '../../../components/SweetAlert';

interface ExamInputProps {
  label: string;
  value: string;
  disabled: boolean;
  alertText?: string;
  onChangeText: (text: string) => void;
}

const LINE_HEIGHT = 28;

const ExamInputCard = ({
  label,
  value,
  disabled,
  alertText,
  onChangeText,
}: ExamInputProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [inputHeight, setInputHeight] = useState(112); // Tracks text height, initialized to 4 lines

  // LOGIC: The bell is only active if the input is not empty
  const isBellActive = value.trim().length > 0;
  // Keyword match: Backend found a specific clinical risk
  const hasBackendAlert = !!alertText && alertText.trim().length > 0;

  // Calculate the number of lines needed based on the current text height (minimum 4 lines)
  const numLines = Math.max(4, Math.ceil(inputHeight / LINE_HEIGHT));

  // Dynamically generate the notepad lines
  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      const topPosition = (i + 1) * LINE_HEIGHT;
      const isFirstLine = i === 0;
      // Since the bell is always at the bottom, we cut the right side of the last two lines
      const isNearBell = i >= numLines - 2;

      lines.push(
        <View
          key={i}
          style={[
            styles.line,
            {
              top: topPosition,
              left: isFirstLine ? 0 : -90,
              right: isNearBell ? 55 : 0,
            },
          ]}
        />,
      );
    }
    return lines;
  };

  return (
    <View style={[styles.card, disabled && {}]}>
      <View style={styles.cardHeader}>
        <Text style={styles.headerText}>{label}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Findings</Text>
        </View>

        <Pressable
          style={styles.inputArea}
          onPress={() => {
            if (disabled) {
              setShowAlert(true);
            }
          }}
        >
          {/* Dynamic Note Pad Lines */}
          <View style={styles.linesContainer} pointerEvents="none">
            {renderLines()}
          </View>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            multiline
            editable={!disabled}
            placeholder="Type findings..."
            pointerEvents={disabled ? 'none' : 'auto'}
            onContentSizeChange={e => {
              // Updates the height state whenever the user types a new line
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
        </Pressable>

        {/* The Bell */}
        <TouchableOpacity
          style={[
            styles.bellBtn,
            !isBellActive && { opacity: 0.3 },
            hasBackendAlert && styles.activeBell,
          ]}
          onPress={() => isBellActive && setModalVisible(true)}
          disabled={!isBellActive}
        >
          <Icon
            name={isBellActive ? 'notifications-active' : 'notifications'}
            size={22}
            color={
              hasBackendAlert ? '#B45309' : isBellActive ? '#B45309' : '#E5E7EB'
            }
          />
        </TouchableOpacity>
      </View>

      <CDSSModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={label}
        alertText={alertText || 'Analyzing findings for potential risks...'}
      />

      <SweetAlert
        visible={showAlert}
        title="Patient Required"
        message="Please select a patient first in the search bar before entering findings."
        type="error"
        onConfirm={() => setShowAlert(false)}
        confirmText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAED',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  cardHeader: {
    backgroundColor: '#FFEDC1',
    paddingVertical: 6,
    alignItems: 'center',
  },
  headerText: { color: '#EDB62C', fontWeight: 'bold', fontSize: 12 },
  content: {
    padding: 15,
    flexDirection: 'row',
    position: 'relative',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-start',
    width: 80,
    alignItems: 'center',
    marginTop: 2,
  },
  badgeText: { color: '#EDB62C', fontSize: 12, fontWeight: 'bold' },
  inputArea: {
    flex: 1,
    minHeight: 112, //  4 lines (4 * 28)
    position: 'relative',
  },
  input: {
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    flex: 1,
    zIndex: 2,
    padding: 0,
    paddingTop: 0,
    paddingBottom: 65,
    lineHeight: LINE_HEIGHT,
    minHeight: 112,
    marginLeft: 10,
    marginTop: 2,
    includeFontPadding: false,
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#D9D9D9',
    position: 'absolute',
  },
  bellBtn: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  activeBell: {
    backgroundColor: '#FDE68A',
    borderWidth: 1,
    borderColor: '#B45309',
  },
});

export default ExamInputCard;
