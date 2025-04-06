import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings as SettingsIcon, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#f0f9ff']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <SettingsIcon size={24} color="#ffffff" />
          </View>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.button}
            onPress={clearAllReadings}>
            <View style={styles.buttonIconContainer}>
              <Trash2 size={22} color="#ffffff" />
            </View>
            <Text style={styles.buttonText}>Clear All Readings</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#0c4a6e',
    letterSpacing: 0.5,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#b91c1c',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
