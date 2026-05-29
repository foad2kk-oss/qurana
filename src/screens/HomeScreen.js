import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { ALL_SURAHS, SAMPLE_SURAHS } from '../services/QuranData';

const SURAHS = ALL_SURAHS;

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { themeMode, memorizedVerses, historyLogs } = useContext(ProgressContext);
  const { playAyah, isPlaying, currentAyah, pauseSound } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  // Calculate stats
  const totalAyahs = SURAHS.reduce((sum, s) => sum + s.totalAyahs, 0);
  const totalMemorized = Object.keys(memorizedVerses).length;
  const progressPercent = totalAyahs > 0 ? Math.round((totalMemorized / totalAyahs) * 100) : 0;

  // Use Al-Fatihah Ayah 1 as the daily ayah
  const dailySurah = SAMPLE_SURAHS[0];
  const dailyAyah = dailySurah.ayahs[0];

  // Dynamic AI feedback based on logs
  const getAITeacherMessage = () => {
    if (historyLogs.length === 0) {
      return {
        title: 'مرحباً بك في طريق الحفظ!',
        body: 'ابدأ اليوم بتحديد ورد الحفظ اليومي الخاص بك، واستمع لآية اليوم 3 مرات بتركيز ثم حاول تسميعها بصوتك.',
        mood: 'welcome'
      };
    }

    const latestLog = historyLogs[0];
    if (latestLog.score >= 90) {
      return {
        title: 'أحسنت وأبدعت ما شاء الله!',
        body: `تلاوتك الأخيرة لآية ${latestLog.ayahNum} من سورة ${SURAHS.find(s => s.id === latestLog.surahId)?.englishName || ''} كانت ممتازة بفضل الله (النتيجة: ${latestLog.score}%). واصل هذا التميز!`,
        mood: 'happy'
      };
    } else if (latestLog.score >= 70) {
      return {
        title: 'قريب جداً من الإتقان!',
        body: `قراءتك جيدة في الآية ${latestLog.ayahNum}، ولكن هناك بعض الأخطاء البسيطة. تدرب على الاستماع إليها مكررة لتثبيتها في ذهنك.`,
        mood: 'encourage'
      };
    } else {
      return {
        title: 'المحاولة هي أولى خطوات النجاح',
        body: 'الآيات الأخيرة تحتاج إلى تثبيت أكثر ومراجعة للتشكيل ومخارج الحروف. استعن بوضع التكرار التلقائي في التطبيق.',
        mood: 'study'
      };
    }
  };

  const aiMessage = getAITeacherMessage();

  const handlePlayDailyAyah = () => {
    if (isPlaying && currentAyah === dailyAyah.number) {
      pauseSound();
    } else {
      playAyah(dailySurah.id, dailyAyah.number, 'husary', true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: activeColors.textSecondary }]}>أهلاً بك يا حافظ القرآن</Text>
            <Text style={[styles.titleText, { color: activeColors.text }]}>ترتيل الحافظ</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.avatarContainer, { backgroundColor: COLORS.primary + '15', borderColor: activeColors.glassBorder }]}>
              <MaterialCommunityIcons name="account-circle-outline" size={32} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Progress Card with LinearGradient */}
        <LinearGradient 
          colors={COLORS.primaryGradient} 
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
          style={styles.progressCard}
        >
          <View style={styles.progressTextSection}>
            <Text style={styles.progressCardTitle}>نسبة حفظ القرآن الكريم</Text>
            <Text style={styles.progressCardSubtitle}>لقد أتممت حفظ {totalMemorized} من أصل {totalAyahs} آية</Text>
            <TouchableOpacity 
              style={styles.progressBtn}
              onPress={() => navigation.navigate('Memorize')}
            >
              <Text style={styles.progressBtnText}>ابدأ الحفظ الآن</Text>
              <MaterialCommunityIcons name="arrow-left" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Radial Progress Simulation */}
          <View style={styles.radialContainer}>
            <View style={[styles.radialOuterRing, { borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
              <View style={[styles.radialInnerRing, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Text style={styles.progressValText}>{progressPercent}%</Text>
                <Text style={styles.progressSubVal}>منجز</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* AI Teacher Section with Glassmorphism and Gold touch */}
        <View style={[styles.aiSection, { backgroundColor: activeColors.glassBg, borderColor: activeColors.glassBorderGold }]}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={24} color={COLORS.secondary} />
            <Text style={[styles.aiTitle, { color: COLORS.secondary }]}>المعلم الذكي (AI Teacher)</Text>
          </View>
          <Text style={[styles.aiMsgTitle, { color: activeColors.text }]}>{aiMessage.title}</Text>
          <Text style={[styles.aiMsgBody, { color: activeColors.textSecondary }]}>{aiMessage.body}</Text>
        </View>

        {/* Daily Ayah Card with Elegant Gold-bordered Slate Card */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>آية اليوم للتأمل والحفظ</Text>
        <View style={[styles.ayahCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          <View style={styles.ayahCardHeader}>
            <View style={styles.ayahInfo}>
              <Text style={[styles.ayahSurahName, { color: activeColors.text }]}>{dailySurah.name}</Text>
              <Text style={[styles.ayahNumberText, { color: activeColors.textSecondary }]}>الآية {dailyAyah.number}</Text>
            </View>
            <TouchableOpacity style={[styles.playBtn, { backgroundColor: COLORS.primary + '20' }]} onPress={handlePlayDailyAyah}>
              <MaterialCommunityIcons 
                name={isPlaying && currentAyah === dailyAyah.number ? "pause" : "play"} 
                size={22} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* Quran Text Panel */}
          <View style={[styles.quranTextContainer, { backgroundColor: themeMode === 'dark' ? 'rgba(13, 148, 136, 0.05)' : '#FAF9F6', borderColor: activeColors.border }]}>
            <Text style={[styles.quranText, { color: activeColors.text }]}>
              {dailyAyah.text}
            </Text>
          </View>

          {/* Word level Tajweed Info summary */}
          <View style={styles.tajweedRow}>
            <Text style={[styles.tajweedLabel, { color: activeColors.textSecondary }]}>الأحكام بالتلوين:</Text>
            <View style={styles.rulesList}>
              <View style={styles.ruleBadge}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.success }]} />
                <Text style={[styles.ruleBadgeText, { color: activeColors.textSecondary }]}>غنة</Text>
              </View>
              <View style={styles.ruleBadge}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.secondary }]} />
                <Text style={[styles.ruleBadgeText, { color: activeColors.textSecondary }]}>قلقلة</Text>
              </View>
              <View style={styles.ruleBadge}>
                <View style={[styles.colorDot, { backgroundColor: COLORS.error }]} />
                <Text style={[styles.ruleBadgeText, { color: activeColors.textSecondary }]}>مد</Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
          
          <Text style={[styles.translationText, { color: activeColors.textSecondary }]}>
            {dailyAyah.translation}
          </Text>
        </View>

        {/* Daily Schedule Checklist */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>جدول المراجعة اليومي</Text>
        <View style={[styles.scheduleCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
          <View style={styles.scheduleItem}>
            <View style={[styles.checkbox, { borderColor: COLORS.success, backgroundColor: COLORS.success + '15' }]}>
              <MaterialCommunityIcons name="check" size={16} color={COLORS.success} />
            </View>
            <View style={styles.scheduleDetails}>
              <Text style={[styles.scheduleSurahName, { color: activeColors.text }]}>سورة الفاتحة</Text>
              <Text style={[styles.scheduleDesc, { color: activeColors.textSecondary }]}>مراجعة وتثبيت (الآيات 1 - 7)</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={[styles.statusText, { color: COLORS.success }]}>مكتمل</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: activeColors.border }]} />

          <View style={styles.scheduleItem}>
            <TouchableOpacity onPress={() => navigation.navigate('Memorize')}>
              <View style={[styles.checkbox, { borderColor: COLORS.secondary, backgroundColor: COLORS.secondary + '10' }]} />
            </TouchableOpacity>
            <View style={styles.scheduleDetails}>
              <Text style={[styles.scheduleSurahName, { color: activeColors.text }]}>سورة الإخلاص</Text>
              <Text style={[styles.scheduleDesc, { color: activeColors.textSecondary }]}>حفظ جديد وتسميع (الآيات 1 - 4)</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.warning + '20' }]}>
              <Text style={[styles.statusText, { color: COLORS.secondary }]}>قيد الحفظ</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 90 }} />
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
  header: {
    flexDirection: 'row-reverse', // RTL orientation
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: SIZES.fontXs,
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'right',
  },
  titleText: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    fontFamily: 'System',
    textAlign: 'right',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  progressCard: {
    borderRadius: 16,
    padding: SIZES.md,
    flexDirection: 'row-reverse', // RTL orientation
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
    marginBottom: SIZES.lg,
  },
  progressTextSection: {
    flex: 1,
    alignItems: 'flex-end', // RTL alignment
  },
  progressCardTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  progressCardSubtitle: {
    fontSize: SIZES.fontXs,
    marginBottom: 12,
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressBtn: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row-reverse', // RTL icon on the left
    alignItems: 'center',
    ...SHADOWS.small,
  },
  progressBtnText: {
    color: COLORS.primary,
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  radialContainer: {
    marginLeft: SIZES.md,
  },
  radialOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialInnerRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressValText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressSubVal: {
    fontSize: 9,
    marginTop: -2,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  aiSection: {
    borderWidth: 1,
    borderRadius: 16,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  aiHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginRight: 8,
  },
  aiMsgTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  aiMsgBody: {
    fontSize: SIZES.fontXs,
    lineHeight: 18,
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SIZES.sm,
    marginTop: SIZES.sm,
  },
  ayahCard: {
    borderRadius: 16,
    padding: SIZES.md,
    borderWidth: 1,
    ...SHADOWS.small,
    marginBottom: SIZES.lg,
  },
  ayahCardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ayahInfo: {
    alignItems: 'flex-end',
  },
  ayahSurahName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  ayahNumberText: {
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quranTextContainer: {
    borderRadius: 12,
    padding: SIZES.md,
    marginVertical: SIZES.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quranText: {
    fontSize: SIZES.fontXl - 2,
    lineHeight: 44,
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  tajweedRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 8,
  },
  tajweedLabel: {
    fontSize: SIZES.fontXs - 1,
    marginLeft: 8,
  },
  rulesList: {
    flexDirection: 'row-reverse',
  },
  ruleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 12,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  ruleBadgeText: {
    fontSize: SIZES.fontXs - 2,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  translationText: {
    fontSize: SIZES.fontXs,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scheduleCard: {
    borderRadius: 16,
    padding: SIZES.md,
    borderWidth: 1,
    ...SHADOWS.small,
    marginBottom: SIZES.lg,
  },
  scheduleItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleDetails: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  scheduleSurahName: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  scheduleDesc: {
    fontSize: SIZES.fontXs - 1,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: SIZES.fontXs - 2,
    fontWeight: 'bold',
  }
});
