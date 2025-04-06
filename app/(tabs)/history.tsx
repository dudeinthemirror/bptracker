import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from 'lucide-react-native';

interface BloodPressureReading {
  id: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  timestamp: number;
}

export default function HistoryScreen() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadReadings = async () => {
    try {
      const storedReadings = await AsyncStorage.getItem('bloodPressureReadings');
      if (storedReadings) {
        const parsedReadings = JSON.parse(storedReadings);
        setReadings(parsedReadings.sort((a: BloodPressureReading, b: BloodPressureReading) => 
          b.timestamp - a.timestamp
        ));
      }
    } catch (error) {
      console.error('Error loading readings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReadings();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) return '#ef4444'; // High
    if (systolic >= 120 || diastolic >= 80) return '#f59e0b'; // Elevated
    return '#22c55e'; // Normal
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Activity size={32} color="#2563eb" />
        <Text style={styles.title}>Reading History</Text>
      </View>

      {readings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No readings recorded yet</Text>
        </View>
      ) : (
        readings.map((reading) => (
          <View key={reading.id} style={styles.card}>
            <View style={styles.readingHeader}>
              <Text style={styles.timestamp}>{formatDate(reading.timestamp)}</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: getStatusColor(
                      parseInt(reading.systolic),
                      parseInt(reading.diastolic)
                    ),
                  },
                ]}
              />
            </View>
            
            <View style={styles.readings}>
              <View style={styles.readingItem}>
                <Text style={styles.readingValue}>{reading.systolic}</Text>
                <Text style={styles.readingLabel}>Systolic</Text>
              </View>
              
              <View style={styles.readingItem}>
                <Text style={styles.readingValue}>{reading.diastolic}</Text>
                <Text style={styles.readingLabel}>Diastolic</Text>
              </View>
              
              <View style={styles.readingItem}>
                <Text style={styles.readingValue}>{reading.heartRate}</Text>
                <Text style={styles.readingLabel}>Heart Rate</Text>
              </View>
            </View>
          </View>
        ))
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
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 14,
    color: '#64748b',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  readings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readingItem: {
    alignItems: 'center',
    flex: 1,
  },
  readingValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
  },
  readingLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});