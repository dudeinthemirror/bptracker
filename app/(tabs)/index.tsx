import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Heart } from 'lucide-react-native';

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
        timestamp: Date.now(),
      };

      const existingReadings = await AsyncStorage.getItem('bloodPressureReadings');
      const readings = existingReadings ? JSON.parse(existingReadings) : [];
      readings.push(reading);

      await AsyncStorage.setItem('bloodPressureReadings', JSON.stringify(readings));

      // Reset form
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
    } catch (error) {
      console.error('Error saving reading:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Heart size={32} color="#2563eb" />
        <Text style={styles.title}>Blood Pressure Reading</Text>
      </View>

      <View style={styles.card}>
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
});