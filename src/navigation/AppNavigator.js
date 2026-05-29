import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import MemorizerScreen from '../screens/MemorizerScreen';
import TajweedSchoolScreen from '../screens/TajweedSchoolScreen';
import ProgressTrackerScreen from '../screens/ProgressTrackerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { themeMode } = useContext(ProgressContext);
  const activeColors = COLORS[themeMode];

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: activeColors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: activeColors.tabBarBg,
            borderTopColor: activeColors.tabBarBorder,
          }
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Memorize') {
            iconName = focused ? 'microphone' : 'microphone-outline';
          } else if (route.name === 'Tajweed') {
            iconName = focused ? 'book-open-variant' : 'book-open-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'chart-arc' : 'chart-arc';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'الرئيسية' }}
      />
      <Tab.Screen 
        name="Memorize" 
        component={MemorizerScreen} 
        options={{ tabBarLabel: 'الحفظ والتسميع' }}
      />
      <Tab.Screen 
        name="Tajweed" 
        component={TajweedSchoolScreen} 
        options={{ tabBarLabel: 'مدرسة التجويد' }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressTrackerScreen} 
        options={{ tabBarLabel: 'متابعة التقدم' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'الإعدادات' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    paddingBottom: 10,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    borderTopWidth: 1,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginTop: 2,
  }
});
