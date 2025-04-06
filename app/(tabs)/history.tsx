import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{
    color: string;
    title: string;
    description: string;
  } | null>(null);

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
    return new Date(timestamp).toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusInfo = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) {
      return {
        color: '#ef4444',
        title: 'High Blood Pressure',
        description: 'Systolic ≥ 140 or Diastolic ≥ 90. Consider consulting with a healthcare professional.'
      };
    }
    if (systolic >= 120 || diastolic >= 80) {
      return {
        color: '#f59e0b',
        title: 'Elevated Blood Pressure',
        description: 'Systolic 120-139 or Diastolic 80-89. Consider lifestyle changes to lower your blood pressure.'
      };
    }
    return {
      color: '#22c55e',
      title: 'Normal Blood Pressure',
      description: 'Systolic < 120 and Diastolic < 80. Keep up the good work!'
    };
  };
  
  const showStatusModal = (systolic: number, diastolic: number) => {
    const statusInfo = getStatusInfo(systolic, diastolic);
    setSelectedStatus(statusInfo);
    setStatusModalVisible(true);
  };

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#f0f9ff']}
      style={styles.gradientBackground}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Activity size={24} color="#ffffff" />
          </View>
          <Text style={styles.title}>Reading History</Text>
        </View>

        {readings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No readings recorded yet</Text>
          </View>
        ) : (
          readings.map((reading) => {
            const systolicNum = parseInt(reading.systolic);
            const diastolicNum = parseInt(reading.diastolic);
            const statusInfo = getStatusInfo(systolicNum, diastolicNum);
            
            return (
              <View key={reading.id} style={styles.card}>
                <View style={styles.readingHeader}>
                  <Text style={styles.timestamp}>{formatDate(reading.timestamp)}</Text>
                  <TouchableOpacity
                    onPress={() => showStatusModal(systolicNum, diastolicNum)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusInfo.color },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.readings}>
                  <View style={styles.readingItem}>
                    <Text style={styles.readingValue}>{reading.systolic}</Text>
                    <Text style={styles.readingLabel}>Systolic</Text>
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: statusInfo.color }]} />
                  
                  <View style={styles.readingItem}>
                    <Text style={styles.readingValue}>{reading.diastolic}</Text>
                    <Text style={styles.readingLabel}>Diastolic</Text>
                  </View>
                  
                  <View style={[styles.divider, { backgroundColor: statusInfo.color }]} />
                  
                  <View style={styles.readingItem}>
                    <Text style={styles.readingValue}>{reading.heartRate}</Text>
                    <Text style={styles.readingLabel}>Heart Rate</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      
      <Modal
        transparent={true}
        visible={statusModalVisible}
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalStatusIndicator, { backgroundColor: selectedStatus?.color }]} />
              <Text style={styles.modalTitle}>{selectedStatus?.title}</Text>
              <TouchableOpacity
                onPress={() => setStatusModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{selectedStatus?.description}</Text>
          </View>
        </Pressable>
      </Modal>
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
    paddingBottom: 80,
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 0,
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
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  readings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readingItem: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  readingValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0c4a6e',
  },
  readingLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
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
    width: '85%',
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalStatusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0c4a6e',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
});
