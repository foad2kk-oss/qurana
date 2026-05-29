import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [memorizedVerses, setMemorizedVerses] = useState({}); // Format: { "surahId-ayahNum": true }
  const [weakVerses, setWeakVerses] = useState({});          // Format: { "surahId-ayahNum": count }
  const [historyLogs, setHistoryLogs] = useState([]);        // Array of { date, surahId, ayahNum, score, feedback }
  
  // Settings State
  const [apiKey, setApiKey] = useState('');
  const [isOfflineGraderMode, setIsOfflineGraderMode] = useState(true);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light'

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const storedMemorized = await AsyncStorage.getItem('tarteel_memorized');
      const storedWeak = await AsyncStorage.getItem('tarteel_weak');
      const storedLogs = await AsyncStorage.getItem('tarteel_logs');
      const storedApiKey = await AsyncStorage.getItem('tarteel_api_key');
      const storedGraderMode = await AsyncStorage.getItem('tarteel_grader_mode');
      const storedTheme = await AsyncStorage.getItem('tarteel_theme');

      if (storedMemorized) setMemorizedVerses(JSON.parse(storedMemorized));
      if (storedWeak) setWeakVerses(JSON.parse(storedWeak));
      if (storedLogs) setHistoryLogs(JSON.parse(storedLogs));
      if (storedApiKey) setApiKey(storedApiKey);
      if (storedGraderMode) setIsOfflineGraderMode(JSON.parse(storedGraderMode));
      if (storedTheme) setThemeMode(storedTheme);
    } catch (e) {
      console.error('Failed to load progress data', e);
    }
  };

  const saveProgressData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save ${key}`, e);
    }
  };

  // Toggle Memorization State for a verse
  const toggleMemorized = async (surahId, ayahNum) => {
    const key = `${surahId}-${ayahNum}`;
    const newMemorized = { ...memorizedVerses };
    
    if (newMemorized[key]) {
      delete newMemorized[key];
    } else {
      newMemorized[key] = true;
      // If it becomes memorized, remove from weak verses
      removeFromWeak(surahId, ayahNum);
    }

    setMemorizedVerses(newMemorized);
    await saveProgressData('tarteel_memorized', newMemorized);
  };

  const isVerseMemorized = (surahId, ayahNum) => {
    return !!memorizedVerses[`${surahId}-${ayahNum}`];
  };

  // Weak Verses management
  const addToWeak = async (surahId, ayahNum) => {
    const key = `${surahId}-${ayahNum}`;
    const newWeak = { ...weakVerses };
    newWeak[key] = (newWeak[key] || 0) + 1;
    setWeakVerses(newWeak);
    await saveProgressData('tarteel_weak', newWeak);
  };

  const removeFromWeak = async (surahId, ayahNum) => {
    const key = `${surahId}-${ayahNum}`;
    if (weakVerses[key]) {
      const newWeak = { ...weakVerses };
      delete newWeak[key];
      setWeakVerses(newWeak);
      await saveProgressData('tarteel_weak', newWeak);
    }
  };

  const clearWeakVerses = async () => {
    setWeakVerses({});
    await AsyncStorage.removeItem('tarteel_weak');
  };

  // Add a history item for voice recitation checks
  const addHistoryLog = async (surahId, ayahNum, score, feedback) => {
    const newLog = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      surahId,
      ayahNum,
      score,
      feedback
    };

    const newLogs = [newLog, ...historyLogs].slice(0, 100); // Limit to last 100 logs
    setHistoryLogs(newLogs);
    await saveProgressData('tarteel_logs', newLogs);

    // If score is weak (under 80), mark as weak verse
    if (score < 80) {
      await addToWeak(surahId, ayahNum);
    } else if (score >= 90) {
      // If score is excellent, remove from weak verses
      await removeFromWeak(surahId, ayahNum);
    }
  };

  const clearHistoryLogs = async () => {
    setHistoryLogs([]);
    await AsyncStorage.removeItem('tarteel_logs');
  };

  // Save specific settings
  const updateSettings = async (settings) => {
    try {
      if (settings.apiKey !== undefined) {
        setApiKey(settings.apiKey);
        await AsyncStorage.setItem('tarteel_api_key', settings.apiKey);
      }
      if (settings.isOfflineGraderMode !== undefined) {
        setIsOfflineGraderMode(settings.isOfflineGraderMode);
        await AsyncStorage.setItem('tarteel_grader_mode', JSON.stringify(settings.isOfflineGraderMode));
      }
      if (settings.themeMode !== undefined) {
        setThemeMode(settings.themeMode);
        await AsyncStorage.setItem('tarteel_theme', settings.themeMode);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  // Stats calculation
  const getOverallProgress = (totalAvailableAyahs) => {
    const totalMemorized = Object.keys(memorizedVerses).length;
    if (totalAvailableAyahs === 0) return 0;
    return Math.round((totalMemorized / totalAvailableAyahs) * 100);
  };

  return (
    <ProgressContext.Provider
      value={{
        memorizedVerses,
        weakVerses,
        historyLogs,
        apiKey,
        isOfflineGraderMode,
        themeMode,
        toggleMemorized,
        isVerseMemorized,
        addToWeak,
        removeFromWeak,
        clearWeakVerses,
        addHistoryLog,
        clearHistoryLogs,
        updateSettings,
        getOverallProgress,
        loadProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
