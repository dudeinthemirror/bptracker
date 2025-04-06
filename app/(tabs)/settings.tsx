import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings as SettingsIcon, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const clearAllReadings = async () => {
    Alert.alert(
      'Clear All Readings',
      'Are you sure you want to delete all readings? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('bloodPressureReadings');
              Alert.alert('Success', 'All readings have been deleted.');
            } catch (error) {
              console.error('Error clearing readings:', error);
              Alert.alert('Error', 'Failed to clear readings.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={32} color="#2563eb" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={styles.button}
          onPress={clearAllReadings}>
          <Trash2 size={24} color="#ef4444" />
          <Text style={styles.buttonText}>Clear All Readings</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  buttonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
});