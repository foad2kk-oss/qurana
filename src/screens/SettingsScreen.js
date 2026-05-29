import React, { useContext, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Switch, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { QARIS } from '../services/QuranData';

function SectionHeader({ icon, label, color, themeMode }) {
  const activeColors = COLORS[themeMode];
  return (
    <View style={shStyles.row}>
      <Text style={[shStyles.label, { color: activeColors.text }]}>{label}</Text>
      <View style={[shStyles.iconWrap, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
      </View>
    </View>
  );
}
const shStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: SIZES.lg, marginBottom: SIZES.sm },
  label: { fontSize: SIZES.fontSm + 1, fontWeight: 'bold', marginLeft: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});

export default function SettingsScreen() {
  const { themeMode, apiKey, isOfflineGraderMode, updateSettings, clearWeakVerses, clearHistoryLogs } = useContext(ProgressContext);
  const { currentQari, setCurrentQari, setRepetitionCount, repetitionCount } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  const [inputKey, setInputKey] = useState(apiKey);
  const [isSecure, setIsSecure] = useState(true);

  const handleSaveApiKey = () => {
    updateSettings({ apiKey: inputKey });
    Alert.alert('تم الحفظ ✓', 'تم حفظ مفتاح API بنجاح.');
  };

  const handleGraderToggle = (value) => {
    if (!value && !apiKey && !inputKey) {
      Alert.alert('مفتاح API مطلوب', 'أدخل مفتاح OpenAI أولاً لتفعيل المصحح الذكي.');
      return;
    }
    updateSettings({ isOfflineGraderMode: value });
  };

  const confirmClear = () => {
    Alert.alert('تأكيد المسح', 'هل تريد مسح كل سجلات التسميع والآيات الضعيفة؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'نعم امسح', style: 'destructive', onPress: async () => {
        await clearWeakVerses();
        await clearHistoryLogs();
        Alert.alert('تم ✓', 'تم مسح السجلات. أعد تشغيل التطبيق لتصفير علامات الحفظ.');
      }},
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Page header */}
        <LinearGradient
          colors={themeMode === 'dark' ? ['#0F1626', '#070A14'] : ['#F0FDF9', '#FAF6F0']}
          style={styles.pageHeader}
        >
          <MaterialCommunityIcons name="cog" size={32} color={COLORS.primary} style={{ marginBottom: 8 }} />
          <Text style={[styles.pageTitle, { color: activeColors.text }]}>الإعدادات</Text>
          <Text style={[styles.pageSubtitle, { color: activeColors.textSecondary }]}>خصّص تجربتك في حفظ القرآن وتجويده</Text>
        </LinearGradient>

        {/* ── Appearance ── */}
        <SectionHeader icon="palette" label="المظهر والطابع" color={COLORS.accent} themeMode={themeMode} />
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderTeal }]}>
          <View style={styles.themeRow}>
            {[
              { mode: 'light', icon: 'white-balance-sunny', label: 'وضع مضيء', color: COLORS.secondary },
              { mode: 'dark',  icon: 'weather-night',       label: 'وضع مظلم',  color: COLORS.accent },
            ].map(t => {
              const isActive = themeMode === t.mode;
              return (
                <TouchableOpacity
                  key={t.mode}
                  style={[styles.themeOption, isActive && { borderColor: t.color, backgroundColor: t.color + '12' }]}
                  onPress={() => updateSettings({ themeMode: t.mode })}
                >
                  <MaterialCommunityIcons name={t.icon} size={26} color={isActive ? t.color : activeColors.textSecondary} />
                  <Text style={[styles.themeLabel, { color: isActive ? t.color : activeColors.textSecondary }]}>{t.label}</Text>
                  {isActive && (
                    <View style={[styles.activeCheckDot, { backgroundColor: t.color }]}>
                      <MaterialCommunityIcons name="check" size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Audio defaults ── */}
        <SectionHeader icon="volume-high" label="إعدادات التلاوة" color={COLORS.primary} themeMode={themeMode} />
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderTeal }]}>

          <View style={[styles.settingRow, { borderBottomColor: activeColors.border }]}>
            <Text style={[styles.settingLabel, { color: activeColors.text }]}>القارئ الافتراضي</Text>
            <View style={styles.badgesRow}>
              {QARIS.map(q => {
                const shortName = q.id === 'husary' ? 'الحصري' : q.id === 'minshawi' ? 'المنشاوي' : 'العفاسي';
                const isActive = currentQari === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[styles.badge, isActive && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                    onPress={() => setCurrentQari(q.id)}
                  >
                    <Text style={[styles.badgeText, { color: isActive ? '#FFF' : activeColors.text }]}>{shortName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: activeColors.text }]}>عدد مرات التكرار</Text>
            <View style={[styles.stepper, { borderColor: activeColors.border }]}>
              <TouchableOpacity onPress={() => setRepetitionCount(Math.max(1, repetitionCount - 1))} style={styles.stepBtn}>
                <MaterialCommunityIcons name="minus" size={18} color={activeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.stepValue, { color: COLORS.primary }]}>{repetitionCount}×</Text>
              <TouchableOpacity onPress={() => setRepetitionCount(repetitionCount + 1)} style={styles.stepBtn}>
                <MaterialCommunityIcons name="plus" size={18} color={activeColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── AI grader ── */}
        <SectionHeader icon="robot" label="المصحح الذكي (AI)" color={COLORS.info} themeMode={themeMode} />
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderTeal }]}>

          <View style={[styles.settingRow, { borderBottomColor: activeColors.border, paddingBottom: 14 }]}>
            <Switch
              value={isOfflineGraderMode}
              onValueChange={handleGraderToggle}
              trackColor={{ false: '#767577', true: COLORS.primary + '90' }}
              thumbColor={isOfflineGraderMode ? COLORS.primary : '#f4f3f4'}
            />
            <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
              <Text style={[styles.settingLabel, { color: activeColors.text }]}>وضع التقييم المحلي (دون إنترنت)</Text>
              <Text style={[styles.settingDesc, { color: activeColors.textSecondary }]}>يحاكي تدقيق التلاوة بدون شبكة.</Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', paddingTop: 12 }}>
            <Text style={[styles.settingLabel, { color: activeColors.text }]}>OpenAI API Key</Text>
            <Text style={[styles.settingDesc, { color: activeColors.textSecondary, marginBottom: 10 }]}>
              للتحويل الصوتي الحقيقي عبر Whisper ومقارنة التلاوة بالمصحف.
            </Text>
            <View style={[styles.inputRow, { borderColor: activeColors.border, backgroundColor: activeColors.surfaceAlt || activeColors.background }]}>
              <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
                <MaterialCommunityIcons name={isSecure ? 'eye-off' : 'eye'} size={20} color={activeColors.textSecondary} />
              </TouchableOpacity>
              <TextInput
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="sk-..."
                placeholderTextColor={activeColors.textMuted}
                secureTextEntry={isSecure}
                style={[styles.input, { color: activeColors.text }]}
              />
            </View>
            <TouchableOpacity style={{ width: '100%' }} onPress={handleSaveApiKey}>
              <LinearGradient colors={COLORS.primaryGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                <MaterialCommunityIcons name="content-save" size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>حفظ المفتاح</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Data management ── */}
        <SectionHeader icon="database" label="إدارة البيانات" color={COLORS.error} themeMode={themeMode} />
        <View style={[styles.card, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
          <TouchableOpacity style={styles.dangerRow} onPress={confirmClear}>
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
  container: { flex: 1 },
  scrollContent: { padding: SIZES.md },

  pageHeader: { borderRadius: 20, padding: SIZES.lg, alignItems: 'center', marginBottom: 4, ...SHADOWS.small },
  pageTitle: { fontSize: SIZES.fontXxl, fontWeight: 'bold', marginBottom: 4 },
  pageSubtitle: { fontSize: SIZES.fontXs, textAlign: 'center' },

  card: { borderRadius: 16, borderWidth: 1, padding: SIZES.md, ...SHADOWS.small },

  themeRow: { flexDirection: 'row-reverse', gap: 12 },
  themeOption: { flex: 1, borderWidth: 1.5, borderColor: '#CCC', borderRadius: 14, paddingVertical: 16, alignItems: 'center', position: 'relative' },
  themeLabel: { fontSize: SIZES.fontXs, fontWeight: 'bold', marginTop: 8 },
  activeCheckDot: { position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  settingLabel: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  settingDesc: { fontSize: SIZES.fontXs - 1, marginTop: 2, textAlign: 'right', lineHeight: 16 },

  badgesRow: { flexDirection: 'row', gap: 6 },
  badge: { borderWidth: 1, borderColor: '#CCC', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },

  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingHorizontal: 4 },
  stepBtn: { padding: 6 },
  stepValue: { fontSize: SIZES.fontSm, fontWeight: 'bold', paddingHorizontal: 8, minWidth: 32, textAlign: 'center' },

  inputRow: { width: '100%', flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  input: { flex: 1, textAlign: 'right', fontSize: SIZES.fontXs, marginRight: 8 },

  saveBtn: { width: '100%', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 12, gap: 8, ...SHADOWS.small },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: SIZES.fontSm, marginRight: 6 },

  dangerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  dangerText: { fontSize: SIZES.fontSm, fontWeight: 'bold', marginRight: 10 },
});
