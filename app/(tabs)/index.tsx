import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Heart, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

interface BloodPressureReading {
  id: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  timestamp: number;
  note?: string;
}

export default function RecordScreen() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const saveReading = async () => {
    try {
      if (!systolic || !diastolic || !heartRate) {
        return;
      }

      const reading: BloodPressureReading = {
        id: Date.now().toString(),
        systolic,
        diastolic,
        heartRate,
        timestamp: date.getTime(),
        note: note.trim() || undefined,
      };

      const existingReadings = await AsyncStorage.getItem('bloodPressureReadings');
      const readings = existingReadings ? JSON.parse(existingReadings) : [];
      readings.push(reading);

      await AsyncStorage.setItem('bloodPressureReadings', JSON.stringify(readings));

      // Reset form
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setNote('');
      setDate(new Date());
    } catch (error) {
      console.error('Error saving reading:', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
    setDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#f0f9ff']}
      style={styles.gradientBackground}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Heart size={24} color="#ffffff" />
          </View>
          <Text style={styles.title}>BP Reading</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}>
              <Calendar size={20} color="#0284c7" />
              <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}>
              <Clock size={20} color="#0284c7" />
              <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Systolic (mmHg)</Text>
            <TextInput
              style={styles.input}
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              placeholder="120"
              placeholderTextColor="#94a3b8"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Diastolic (mmHg)</Text>
            <TextInput
              style={styles.input}
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="numeric"
              placeholder="80"
              placeholderTextColor="#94a3b8"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Heart Rate (BPM)</Text>
            <TextInput
              style={styles.input}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
              placeholder="75"
              placeholderTextColor="#94a3b8"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note about this reading"
              placeholderTextColor="#94a3b8"
              multiline={true}
              numberOfLines={2}
            />
          </View>

          <LinearGradient
            colors={(!systolic || !diastolic || !heartRate) ? ['#94a3b8', '#64748b'] : ['#0284c7', '#0369a1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.buttonGradient,
              (!systolic || !diastolic || !heartRate) && styles.buttonDisabled,
            ]}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={saveReading}
              disabled={!systolic || !diastolic || !heartRate}>
              <Text style={styles.buttonText}>Save Reading</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Date/Time Picker Modal for iOS and Web */}
      {(showDatePicker || showTimePicker) && (Platform.OS === 'web' || Platform.OS === 'ios') && (
        <Modal
          transparent={true}
          visible={showDatePicker || showTimePicker}
          animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setShowDatePicker(false);
              setShowTimePicker(false);
            }}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={date}
                mode={showDatePicker ? 'date' : 'time'}
                display="spinner"
                onChange={onDateChange}
                style={styles.picker}
              />
              <LinearGradient
                colors={['#0284c7', '#0369a1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneButtonGradient}
              >
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => {
                    setShowDatePicker(false);
                    setShowTimePicker(false);
                  }}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Date/Time Picker for Android */}
      {(showDatePicker || showTimePicker) && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode={showDatePicker ? 'date' : 'time'}
          onChange={onDateChange}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    flexWrap: 'nowrap',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0c4a6e',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeText: {
    color: '#0c4a6e',
    fontSize: 16,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#0c4a6e',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: '#0c4a6e',
    fontWeight: '500',
  },
  buttonGradient: {
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  button: {
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  picker: {
    height: 200,
  },
  doneButtonGradient: {
    borderRadius: 12,
    marginTop: 16,
  },
  doneButton: {
    padding: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
