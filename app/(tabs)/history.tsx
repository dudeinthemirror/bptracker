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
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Activity, X, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { readingsApi, BloodPressureReading } from '../services/api';

export default function HistoryScreen() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [selectedStatus, setSelectedStatus] = useState<{
    color: string;
    title: string;
    description: string;
  } | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [editedSystolic, setEditedSystolic] = useState<string>('');
  const [editedDiastolic, setEditedDiastolic] = useState<string>('');
  const [editedHeartRate, setEditedHeartRate] = useState<string>('');
  const [editedNote, setEditedNote] = useState('');

  const handleEditReading = (reading: BloodPressureReading) => {
    setEditingReading(reading);
    setEditedSystolic(reading.systolic.toString());
    setEditedDiastolic(reading.diastolic.toString());
    setEditedHeartRate(reading.heart_rate.toString());
    setEditedNote(reading.note || '');
    setEditModalVisible(true);
  };

  const saveEditedReading = async () => {
    if (!editingReading) return;
    
    // Validate inputs
    if (!editedSystolic || !editedDiastolic || !editedHeartRate) {
      Alert.alert('Error', 'All fields except note are required');
      return;
    }

    try {
      // Create updated reading
      const updatedReading = {
        systolic: parseInt(editedSystolic),
        diastolic: parseInt(editedDiastolic),
        heart_rate: parseInt(editedHeartRate),
        note: editedNote || undefined,
        // We don't need to include timestamp as we're not changing it
      };

      // Update the reading via API
      await readingsApi.update(editingReading.id, updatedReading);
      
      // Refresh readings
      await loadReadings();
      
      // Close modal
      setEditModalVisible(false);
      setEditingReading(null);
      
      Alert.alert('Success', 'Reading updated successfully');
    } catch (error) {
      console.error('Error saving edited reading:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const loadReadings = async () => {
    try {
      setRefreshing(true);
      const response = await readingsApi.getAll();
      // Check if response is an array
      const fetchedReadings = Array.isArray(response) ? response : [];
      
      // Sort by timestamp (convert ISO string to Date for comparison)
      setReadings(fetchedReadings.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading readings:', error);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load readings');
    }
  };

  const onRefresh = () => {
    loadReadings();
  };

  useEffect(() => {
    loadReadings();
  }, []);

  const formatDate = (timestamp: string) => {
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
            const systolicNum = reading.systolic;
            const diastolicNum = reading.diastolic;
            const statusInfo = getStatusInfo(systolicNum, diastolicNum);
            
            return (
              <TouchableOpacity 
                key={reading.id} 
                style={[
                  styles.card,
                  isLandscape && styles.cardLandscape
                ]}
                onPress={() => handleEditReading(reading)}
                activeOpacity={0.7}
              >
                <View style={styles.readingHeader}>
                  <Text style={styles.timestamp}>{formatDate(reading.timestamp)}</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      showStatusModal(systolicNum, diastolicNum);
                    }}
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
                    <Text style={styles.readingValue}>{reading.heart_rate}</Text>
                    <Text style={styles.readingLabel}>Heart Rate</Text>
                  </View>
                </View>
                
                {reading.note && (
                  <TouchableOpacity 
                    style={styles.noteIconContainer}
                    onPress={(e) => {
                      e.stopPropagation();
                      setSelectedNote(reading.note || null);
                      setNoteModalVisible(true);
                    }}
                  >
                    <FileText size={20} color="#0284c7" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
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

      <Modal
        transparent={true}
        visible={noteModalVisible}
        animationType="fade"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNoteModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Note</Text>
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDescription}>{selectedNote}</Text>
          </View>
        </Pressable>
      </Modal>

      <Modal
        transparent={true}
        visible={editModalVisible}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {}}
        >
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Reading</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Systolic</Text>
              <TextInput
                style={styles.input}
                value={editedSystolic}
                onChangeText={setEditedSystolic}
                keyboardType="numeric"
                placeholder="Systolic"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Diastolic</Text>
              <TextInput
                style={styles.input}
                value={editedDiastolic}
                onChangeText={setEditedDiastolic}
                keyboardType="numeric"
                placeholder="Diastolic"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Heart Rate</Text>
              <TextInput
                style={styles.input}
                value={editedHeartRate}
                onChangeText={setEditedHeartRate}
                keyboardType="numeric"
                placeholder="Heart Rate"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Note (optional)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={editedNote}
                onChangeText={setEditedNote}
                placeholder="Add a note"
                multiline
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveEditedReading}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
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
    borderRadius: 18,
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
  cardLandscape: {
    width: '85%',
    alignSelf: 'center',
    marginHorizontal: 'auto',
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
  noteIconContainer: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  editModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#334155',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#0284c7',
    marginLeft: 12,
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
