import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

interface BloodPressureReading {
  id: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  timestamp: number;
  note?: string;
}

type TimeRange = '3days' | 'week';

export default function GraphScreen() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('3days');
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const loadReadings = async () => {
    try {
      setLoading(true);
      const storedReadings = await AsyncStorage.getItem('bloodPressureReadings');
      if (storedReadings) {
        const parsedReadings = JSON.parse(storedReadings);
        setReadings(parsedReadings.sort((a: BloodPressureReading, b: BloodPressureReading) => 
          a.timestamp - b.timestamp
        ));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading readings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, []);

  const getFilteredReadings = () => {
    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;
    let cutoffTime: number;

    if (timeRange === '3days') {
      cutoffTime = now.getTime() - 3 * msInDay;
    } else { // week
      cutoffTime = now.getTime() - 7 * msInDay;
    }

    return readings.filter(reading => reading.timestamp >= cutoffTime);
  };

  const formatChartData = () => {
    const filteredReadings = getFilteredReadings();
    
    // If no readings, return empty data
    if (filteredReadings.length === 0) {
      return {
        labels: [],
        datasets: [
          { data: [], color: () => '#ef4444' }, // Systolic
          { data: [], color: () => '#f59e0b' }, // Diastolic
          { data: [], color: () => '#0284c7' }, // Heart Rate
        ],
        legend: ['Systolic', 'Diastolic', 'Heart Rate']
      };
    }

    // Get labels (dates) for x-axis
    const labels = filteredReadings.map(reading => {
      const date = new Date(reading.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    // Get data for each dataset
    const systolicData = filteredReadings.map(reading => parseInt(reading.systolic));
    const diastolicData = filteredReadings.map(reading => parseInt(reading.diastolic));
    const heartRateData = filteredReadings.map(reading => parseInt(reading.heartRate));

    return {
      labels,
      datasets: [
        { data: systolicData, color: () => '#ef4444' }, // Red for Systolic
        { data: diastolicData, color: () => '#f59e0b' }, // Orange for Diastolic
        { data: heartRateData, color: () => '#0284c7' }, // Blue for Heart Rate
      ],
      legend: ['Systolic', 'Diastolic', 'Heart Rate']
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  // Calculate chart dimensions based on orientation
  const chartWidth = width - (isLandscape ? 48 : 32); // More padding in landscape
  const chartHeight = isLandscape ? height * 0.5 : 220; // Adjust height in landscape

  return (
    <LinearGradient
      colors={['#f0f9ff', '#e0f2fe', '#f0f9ff']}
      style={styles.gradientBackground}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {!isLandscape && (
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BarChart2 size={24} color="#ffffff" />
            </View>
            <Text style={styles.title}>BP Trends</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                timeRange === '3days' && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange('3days')}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === '3days' && styles.timeRangeTextActive,
                ]}
              >
                3 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.timeRangeButton,
                timeRange === 'week' && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange('week')}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === 'week' && styles.timeRangeTextActive,
                ]}
              >
                Week
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0284c7" />
            </View>
          ) : readings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No readings recorded yet</Text>
            </View>
          ) : getFilteredReadings().length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No readings in selected time range</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <LineChart
                data={formatChartData()}
                width={chartWidth}
                height={chartHeight}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
              <View style={[
                styles.legendContainer,
                isLandscape && styles.legendContainerLandscape
              ]}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
                  <Text style={styles.legendText}>Systolic</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#f59e0b' }]} />
                  <Text style={styles.legendText}>Diastolic</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#0284c7' }]} />
                  <Text style={styles.legendText}>Heart Rate</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: 16,
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
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeRangeText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  timeRangeTextActive: {
    color: '#0284c7',
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 16,
  },
  legendContainerLandscape: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
});
