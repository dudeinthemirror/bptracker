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

interface BloodPressureReading {
  id: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  timestamp: number;
}

export default function RecordScreen() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
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
      };

      const existingReadings = await AsyncStorage.getItem('bloodPressureReadings');
      const readings = existingReadings ? JSON.parse(existingReadings) : [];
      readings.push(reading);

      await AsyncStorage.setItem('bloodPressureReadings', JSON.stringify(readings));

      // Reset form
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Heart size={32} color="#2563eb" />
        <Text style={styles.title}>Blood Pressure Reading</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}>
            <Calendar size={20} color="#475569" />
            <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}>
            <Clock size={20} color="#475569" />
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
            maxLength={3}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!systolic || !diastolic || !heartRate) && styles.buttonDisabled,
          ]}
          onPress={saveReading}
          disabled={!systolic || !diastolic || !heartRate}>
          <Text style={styles.buttonText}>Save Reading</Text>
        </TouchableOpacity>
      </View>

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
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setShowDatePicker(false);
                  setShowTimePicker(false);
                }}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}

      {(showDatePicker || showTimePicker) && Platform.OS === 'android' && (
        <DateTimePicker
          value={date}
          mode={showDatePicker ? 'date' : 'time'}
          onChange={onDateChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateTimeText: {
    color: '#475569',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#475569',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  picker: {
    height: 200,
  },
  doneButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});