import { Tabs } from 'expo-router';
import { Chrome as Home, History, Settings, BarChart2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderTopColor: 'rgba(255, 255, 255, 0.3)',
          borderTopWidth: 1,
          elevation: 0,
          height: isLandscape ? 45 : 60, // Reduce height in landscape mode
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: isLandscape ? 4 : Math.max(10, insets.bottom), // Add padding for home indicator
        },
        tabBarBackground: () => (
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: isLandscape ? 10 : 12,
          fontWeight: '500',
          marginBottom: isLandscape ? 2 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: isLandscape ? 3 : 6,
        },
        headerStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: '#0c4a6e',
          fontSize: 18,
          fontWeight: '700',
        },
        headerBackground: () => (
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Record',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.iconWrapper, isLandscape && styles.iconWrapperLandscape]}>
              <Home size={isLandscape ? size-4 : size-2} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.iconWrapper, isLandscape && styles.iconWrapperLandscape]}>
              <History size={isLandscape ? size-4 : size-2} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: 'Graph',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.iconWrapper, isLandscape && styles.iconWrapperLandscape]}>
              <BarChart2 size={isLandscape ? size-4 : size-2} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.iconWrapper, isLandscape && styles.iconWrapperLandscape]}>
              <Settings size={isLandscape ? size-4 : size-2} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  iconWrapperLandscape: {
    marginTop: 2,
  },
});
