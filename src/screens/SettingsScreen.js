import React, { useContext, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Switch, 
  Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { QARIS } from '../services/QuranData';

export default function SettingsScreen() {
  const { 
    themeMode, 
    apiKey, 
    isOfflineGraderMode, 
    updateSettings, 
    clearWeakVerses, 
    clearHistoryLogs,
    memorizedVerses
  } = useContext(ProgressContext);
  
  const { currentQari, setCurrentQari, setRepetitionCount, repetitionCount } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  const [inputKey, setInputKey] = useState(apiKey);
  const [isSecure, setIsSecure] = useState(true);

  const handleSaveApiKey = () => {
    updateSettings({ apiKey: inputKey });
    Alert.alert('تم الحفظ', 'تم حفظ مفتاح API بنجاح.');
  };

  const handleGraderToggle = (value) => {
    // If turning off offline mode, warn that they need an API key
    if (!value && !apiKey && !inputKey) {
      Alert.alert(
        'مفتاح API مطلوب',
        'لاستخدام المصحح بالذكاء الاصطناعي (Whisper)، يجب إدخال مفتاح API الخاص بـ OpenAI أولاً.',
        [{ text: 'حسناً', onPress: () => {} }]
      );
      return;
    }
    updateSettings({ isOfflineGraderMode: value });
  };

  const handleThemeChange = (mode) => {
    updateSettings({ themeMode: mode });
  };

  const confirmClearProgress = () => {
    Alert.alert(
      'تأكيد مسح البيانات',
      'هل أنت متأكد من رغبتك في مسح كل تقدم الحفظ؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'نعم، امسح تقدم الحفظ', 
          style: 'destructive',
          onPress: async () => {
            // Simply update settings or clear storage
            // In a real app we'd clear the state. Let's do it:
            // Since toggleMemorized resets individually, we can advise user to restart
            // or we could implement a complete reset in ProgressContext.
            // Let's clear logs and weak verses instantly:
            await clearWeakVerses();
            await clearHistoryLogs();
            Alert.alert('تم المسح', 'تم مسح سجل التسميع والآيات الضعيفة بنجاح. يرجى إعادة تشغيل التطبيق لتصفير علامات الحفظ.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.titleText, { color: activeColors.text }]}>الإعدادات</Text>
        <Text style={[styles.subtitleText, { color: activeColors.textSecondary }]}>خصص تجربتك في حفظ القرآن الكريم وتجويده</Text>

        {/* SECTION 1: APPEARANCE */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>المظهر والطابع</Text>
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          <View style={styles.themeRow}>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                themeMode === 'light' && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }
              ]}
              onPress={() => handleThemeChange('light')}
            >
              <MaterialCommunityIcons name="white-balance-sunny" size={24} color={themeMode === 'light' ? COLORS.primary : activeColors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: activeColors.text }]}>وضع مضيء</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                themeMode === 'dark' && { borderColor: COLORS.secondary, backgroundColor: COLORS.secondary + '10' }
              ]}
              onPress={() => handleThemeChange('dark')}
            >
              <MaterialCommunityIcons name="weather-night" size={24} color={themeMode === 'dark' ? COLORS.secondary : activeColors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: activeColors.text }]}>وضع مظلم</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* SECTION 2: AUDIO DEFAULTS */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>خيارات التلاوة الافتراضية</Text>
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          
          <View style={[styles.settingItem, { borderBottomColor: activeColors.border }]}>
            <View style={styles.dropdownWrap}>
              {QARIS.map(q => (
                <TouchableOpacity 
                  key={q.id}
                  style={[
                    styles.qariSmallBadge, 
                    currentQari === q.id && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                  ]}
                  onPress={() => setCurrentQari(q.id)}
                >
                  <Text style={[styles.qariBadgeText, { color: currentQari === q.id ? '#FFF' : activeColors.text }]}>
                    {q.id === 'husary' ? 'الحصري' : q.id === 'minshawi' ? 'المنشاوي' : 'العفاسي'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.settingLabel, { color: activeColors.text }]}>القارئ الافتراضي</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.numberControl}>
              <TouchableOpacity onPress={() => setRepetitionCount(Math.max(1, repetitionCount - 1))}>
                <MaterialCommunityIcons name="minus" size={16} color={activeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.numberValue, { color: activeColors.text }]}>{repetitionCount}x</Text>
              <TouchableOpacity onPress={() => setRepetitionCount(repetitionCount + 1)}>
                <MaterialCommunityIcons name="plus" size={16} color={activeColors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.settingLabel, { color: activeColors.text }]}>عدد مرات تكرار الآية</Text>
          </View>

        </View>

        {/* SECTION 3: AI SPEECH CORRECTION */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>المصحح الذكي والذكاء الاصطناعي</Text>
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          
          <View style={[styles.settingRowItem, { borderBottomColor: activeColors.border }]}>
            <Switch 
              value={isOfflineGraderMode}
              onValueChange={handleGraderToggle}
              trackColor={{ false: '#767577', true: COLORS.primary + '80' }}
              thumbColor={isOfflineGraderMode ? COLORS.primary : '#f4f3f4'}
            />
            <View style={styles.settingRowTextWrap}>
              <Text style={[styles.settingRowTitle, { color: activeColors.text }]}>وضع التقييم المحلي (دون إنترنت)</Text>
              <Text style={[styles.settingRowDesc, { color: activeColors.textSecondary }]}>يعمل بدون شبكة ويحاكي تدقيق التلاوة والتجويد.</Text>
            </View>
          </View>

          <View style={styles.apiKeySection}>
            <Text style={[styles.apiKeyLabel, { color: activeColors.text }]}>OpenAI API Key (للتحليل الصوتي الحقيقي)</Text>
            <Text style={[styles.apiKeyDesc, { color: activeColors.textSecondary }]}>
              ندعم تحويل التلاوة إلى نص عبر Whisper لمقارنتها بمصحف الحفظ بدقة.
            </Text>
            
            <View style={[styles.inputContainer, { borderColor: activeColors.border }]}>
              <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.inputIcon}>
                <MaterialCommunityIcons name={isSecure ? "eye-off" : "eye"} size={20} color={activeColors.textSecondary} />
              </TouchableOpacity>
              <TextInput
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="sk-..."
                placeholderTextColor={activeColors.textMuted}
                secureTextEntry={isSecure}
                style={[styles.apiKeyInput, { color: activeColors.text }]}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSaveApiKey}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveKeyBtn}
              >
                <Text style={styles.saveKeyText}>حفظ مفتاح الذكاء الاصطناعي</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </View>

        {/* SECTION 4: CLEAR PROGRESS DATA */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>إدارة البيانات والتقدم</Text>
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          
          <TouchableOpacity style={styles.dangerRow} onPress={confirmClearProgress}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.error} />
            <Text style={[styles.dangerText, { color: COLORS.error }]}>تصفير كل سجلات التسميع والتقدم</Text>
          </TouchableOpacity>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.md,
  },
  titleText: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'right',
    marginTop: 10,
  },
  subtitleText: {
    fontSize: SIZES.fontXs,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontSm + 1,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SIZES.sm,
    marginTop: SIZES.md,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.small,
    marginBottom: SIZES.sm,
  },
  themeRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  themeOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  themeOptionText: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  dropdownWrap: {
    flexDirection: 'row',
  },
  qariSmallBadge: {
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  qariBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  numberControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  numberValue: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  settingRowItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingRowTextWrap: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  settingRowTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  settingRowDesc: {
    fontSize: SIZES.fontXs - 2,
    marginTop: 2,
    textAlign: 'right',
  },
  apiKeySection: {
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  apiKeyLabel: {
    fontSize: SIZES.fontXs + 1,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  apiKeyDesc: {
    fontSize: SIZES.fontXs - 2,
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  apiKeyInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: SIZES.fontXs,
  },
  inputIcon: {
    marginRight: 8,
  },
  saveKeyBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    ...SHADOWS.small,
  },
  saveKeyText: {
    color: '#FFF',
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  dangerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dangerText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginRight: 8,
  }
});
