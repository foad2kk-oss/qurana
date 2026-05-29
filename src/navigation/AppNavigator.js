import React, { useContext, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';

import HomeScreen from '../screens/HomeScreen';
import MemorizerScreen from '../screens/MemorizerScreen';
import TajweedSchoolScreen from '../screens/TajweedSchoolScreen';
import ProgressTrackerScreen from '../screens/ProgressTrackerScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const TAB_CONFIG = [
  { name: 'Home',     label: 'الرئيسية',      icon: 'home-variant',       iconFocused: 'home-variant' },
  { name: 'Memorize', label: 'الحفظ',          icon: 'microphone-outline', iconFocused: 'microphone' },
  { name: 'Tajweed',  label: 'التجويد',        icon: 'book-open-outline',  iconFocused: 'book-open-variant' },
  { name: 'Progress', label: 'تقدمي',          icon: 'chart-arc',          iconFocused: 'chart-arc' },
  { name: 'Settings', label: 'الإعدادات',      icon: 'cog-outline',        iconFocused: 'cog' },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const { themeMode } = useContext(ProgressContext);
  const activeColors = COLORS[themeMode];

  const animValues = useRef(TAB_CONFIG.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))).current;

  useEffect(() => {
    animValues.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === state.index ? 1 : 0,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={[styles.tabBarWrapper, { backgroundColor: activeColors.tabBarBg, borderTopColor: activeColors.tabBarBorder }]}>
      {/* Glow line at top */}
      <View style={[styles.glowLine, { backgroundColor: COLORS.primary }]} />

      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const tab = TAB_CONFIG.find(t => t.name === route.name);
          const isFocused = state.index === index;
          const anim = animValues[index];

          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
          const labelOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <Animated.View style={[styles.tabIconWrap, { transform: [{ scale }, { translateY }] }]}>
                {isFocused ? (
                  <LinearGradient
                    colors={tab.name === 'Tajweed' ? COLORS.goldGradient : COLORS.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.activeIconBg}
                  >
                    <MaterialCommunityIcons name={tab.iconFocused} size={22} color="#FFF" />
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveIconBg}>
                    <MaterialCommunityIcons name={tab.icon} size={22} color={activeColors.textMuted} />
                  </View>
                )}
              </Animated.View>
              <Animated.Text style={[
                styles.tabLabel,
                { color: isFocused ? (tab.name === 'Tajweed' ? COLORS.secondary : COLORS.primary) : activeColors.textMuted, opacity: labelOpacity }
              ]}>
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_CONFIG.map(tab => {
        const screens = {
          Home: HomeScreen,
          Memorize: MemorizerScreen,
          Tajweed: TajweedSchoolScreen,
          Progress: ProgressTrackerScreen,
          Settings: SettingsScreen,
        };
        return (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={screens[tab.name]}
            options={{ tabBarLabel: tab.label }}
          />
        );
      })}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    ...SHADOWS.large,
  },
  glowLine: {
    height: 2,
    width: width * 0.4,
    alignSelf: 'center',
    borderRadius: 2,
    opacity: 0.6,
    marginTop: 0,
  },
  tabBarInner: {
    flexDirection: 'row-reverse',
    paddingBottom: 12,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  tabIconWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.teal,
  },
  inactiveIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
