import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  SafeAreaView, Dimensions, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { ALL_SURAHS, SAMPLE_SURAHS, TAJWEED_RULES } from '../services/QuranData';

const { width } = Dimensions.get('window');

// ── Decorative star dots ───────────────────────────────────────────────────────
const STARS = [
  { top: 18, left: '10%', size: 4, opacity: 0.45 },
  { top: 36, left: '25%', size: 3, opacity: 0.3 },
  { top: 10, left: '55%', size: 5, opacity: 0.5 },
  { top: 28, left: '72%', size: 3, opacity: 0.35 },
  { top: 48, left: '88%', size: 4, opacity: 0.4 },
  { top: 8,  left: '40%', size: 3, opacity: 0.25 },
];

function StarField({ color }) {
  return (
    <>
      {STARS.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', top: s.top, left: s.left,
          width: s.size, height: s.size, borderRadius: s.size / 2,
          backgroundColor: color, opacity: s.opacity,
        }} />
      ))}
    </>
  );
}

// ── Tajweed-coloured word display ─────────────────────────────────────────────
function ColoredAyah({ words, themeMode }) {
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center' }}>
      {words.map((w, i) => {
        const rule = TAJWEED_RULES[w.rule];
        const color = rule && w.rule !== 'none'
          ? (themeMode === 'dark' ? rule.darkColor : rule.color)
          : (themeMode === 'dark' ? '#F3F4F6' : '#0F172A');
        return (
          <Text key={i} style={[caStyles.word, { color }]}>{w.text} </Text>
        );
      })}
    </View>
  );
}
const caStyles = StyleSheet.create({
  word: { fontSize: SIZES.fontXl, fontWeight: 'bold', lineHeight: 48 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { themeMode, memorizedVerses, historyLogs } = useContext(ProgressContext);
  const { playAyah, isPlaying, currentAyah, pauseSound } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];
  const isDark = themeMode === 'dark';

  const totalAyahs = ALL_SURAHS.reduce((sum, s) => sum + s.totalAyahs, 0);
  const totalMemorized = Object.keys(memorizedVerses).length;
  const progressPercent = totalAyahs > 0 ? Math.round((totalMemorized / totalAyahs) * 100) : 0;

  const dailySurah = SAMPLE_SURAHS[0];
  const dailyAyah  = dailySurah.ayahs[0];

  // Pulse animation for the play button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isPlaying && currentAyah === dailyAyah.number) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, currentAyah]);

  // Fade-in on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const getAIMessage = () => {
    if (historyLogs.length === 0) return {
      title: 'مرحباً بك في طريق الحفظ!',
      body: 'ابدأ اليوم بتحديد ورد الحفظ اليومي، واستمع لآية اليوم ثلاث مرات بتركيز ثم سمّعها.',
      icon: 'hand-wave', color: COLORS.secondary,
    };
    const log = historyLogs[0];
    if (log.score >= 90) return {
      title: 'أحسنت ما شاء الله! 🌟',
      body: `تلاوتك الأخيرة كانت ممتازة (${log.score}%). واصل هذا التميز.`,
      icon: 'star-circle', color: COLORS.success,
    };
    if (log.score >= 70) return {
      title: 'قريب من الإتقان!',
      body: `أداء جيد في الآية ${log.ayahNum}. راجع الكلمات الملوّنة بالأحمر.`,
      icon: 'trending-up', color: COLORS.primary,
    };
    return {
      title: 'المحاولة أولى خطوات النجاح',
      body: 'الآيات الأخيرة تحتاج تثبيتاً. استعن بوضع التكرار التلقائي.',
      icon: 'book-education', color: COLORS.info,
    };
  };
  const ai = getAIMessage();

  const handlePlayDaily = () => {
    if (isPlaying && currentAyah === dailyAyah.number) pauseSound();
    else playAyah(dailySurah.id, dailyAyah.number, 'husary', true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={[styles.welcomeText, { color: activeColors.textSecondary }]}>أهلاً بك يا حافظ القرآن</Text>
            <Text style={[styles.titleText, { color: activeColors.text }]}>ترتيل الحافظ</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <LinearGradient
              colors={isDark ? ['#1E293B', '#0F1626'] : ['#F1F5F9', '#FFFFFF']}
              style={[styles.avatarBtn, { borderColor: activeColors.glassBorderTeal }]}
            >
              <MaterialCommunityIcons name="account-circle" size={28} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Progress card ── */}
        <LinearGradient
          colors={COLORS.tealGoldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.progressCard, SHADOWS.teal]}
        >
          <StarField color="#FFF" />

          <View style={styles.progressTextSection}>
            <Text style={styles.progressCardTitle}>نسبة حفظ القرآن الكريم</Text>
            <Text style={styles.progressCardSubtitle}>
              أتممت حفظ {totalMemorized} من أصل {totalAyahs} آية
            </Text>
            <TouchableOpacity style={styles.progressBtn} onPress={() => navigation.navigate('Memorize')}>
              <Text style={styles.progressBtnText}>ابدأ الحفظ الآن</Text>
              <MaterialCommunityIcons name="arrow-left" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Radial progress ring */}
          <View style={styles.radialContainer}>
            <View style={styles.radialOuterRing}>
              <View style={styles.radialInnerRing}>
                <Text style={styles.progressValText}>{progressPercent}%</Text>
                <Text style={styles.progressSubVal}>منجز</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Tajweed colour legend ── */}
        <View style={[styles.legendCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderTeal }]}>
          <Text style={[styles.legendTitle, { color: activeColors.textSecondary }]}>دليل ألوان التجويد:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendScroll}>
            {Object.entries(TAJWEED_RULES).filter(([k]) => k !== 'none').map(([key, rule]) => (
              <View key={key} style={styles.legendBadge}>
                <View style={[styles.legendDot, { backgroundColor: isDark ? rule.darkColor : rule.color }]} />
                <Text style={[styles.legendText, { color: activeColors.textSecondary }]}>
                  {rule.name.split(' ')[0]}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── AI Teacher ── */}
        <View style={[styles.aiCard, { backgroundColor: activeColors.glassBg, borderColor: activeColors.glassBorderGold }]}>
          <LinearGradient
            colors={[ai.color + '22', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.aiHeader}>
            <View style={[styles.aiIconCircle, { backgroundColor: ai.color + '20' }]}>
              <MaterialCommunityIcons name={ai.icon} size={20} color={ai.color} />
            </View>
            <Text style={[styles.aiLabel, { color: ai.color }]}>المعلم الذكي</Text>
          </View>
          <Text style={[styles.aiMsgTitle, { color: activeColors.text }]}>{ai.title}</Text>
          <Text style={[styles.aiMsgBody, { color: activeColors.textSecondary }]}>{ai.body}</Text>
        </View>

        {/* ── Daily Ayah ── */}
        <View style={styles.sectionRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Tajweed')}>
            <Text style={[styles.sectionLink, { color: COLORS.primary }]}>مدرسة التجويد ←</Text>
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { color: activeColors.text }]}>آية اليوم</Text>
        </View>

        <View style={[styles.ayahCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          {/* Header */}
          <View style={styles.ayahCardHeader}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: isPlaying && currentAyah === dailyAyah.number ? COLORS.primary : COLORS.primary + '20' }]}
                onPress={handlePlayDaily}
              >
                <MaterialCommunityIcons
                  name={isPlaying && currentAyah === dailyAyah.number ? 'pause' : 'play'}
                  size={22}
                  color={isPlaying && currentAyah === dailyAyah.number ? '#FFF' : COLORS.primary}
                />
              </TouchableOpacity>
            </Animated.View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.ayahSurahName, { color: activeColors.text }]}>{dailySurah.name}</Text>
              <Text style={[styles.ayahNumber, { color: activeColors.textSecondary }]}>الآية {dailyAyah.number}</Text>
            </View>
          </View>

          {/* Quran text with tajweed colours */}
          <View style={[styles.quranTextBox, {
            backgroundColor: isDark ? 'rgba(13,148,136,0.05)' : '#FAF9F6',
            borderColor: activeColors.glassBorderTeal,
          }]}>
            <ColoredAyah words={dailyAyah.words} themeMode={themeMode} />
          </View>

          <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
          <Text style={[styles.translationText, { color: activeColors.textSecondary }]}>
            {dailyAyah.translation}
          </Text>
        </View>

        {/* ── Quick actions ── */}
        <Text style={[styles.sectionTitle, { color: activeColors.text, textAlign: 'right', marginBottom: SIZES.sm }]}>
          الوصول السريع
        </Text>
        <View style={styles.quickRow}>
          {[
            { label: 'الحفظ', sub: 'سمّع آياتك', icon: 'microphone', screen: 'Memorize', grad: COLORS.primaryGradient },
            { label: 'التجويد', sub: 'تدرّب الأحكام', icon: 'book-open-variant', screen: 'Tajweed', grad: COLORS.goldGradient },
            { label: 'التفسير', sub: 'فهم معاني السور', icon: 'book-open-page-variant', screen: 'Tafsir', grad: ['#7C3AED', '#A855F7'] },
            { label: 'تقدمي',  sub: 'إحصاءات حفظك', icon: 'chart-arc', screen: 'Progress', grad: COLORS.accentGradient },
          ].map(item => (
            <TouchableOpacity key={item.screen} style={styles.quickCard} onPress={() => navigation.navigate(item.screen)}>
              <LinearGradient colors={item.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickGrad}>
                <MaterialCommunityIcons name={item.icon} size={26} color="#FFF" />
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickSub}>{item.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Daily checklist ── */}
        <Text style={[styles.sectionTitle, { color: activeColors.text, textAlign: 'right', marginBottom: SIZES.sm }]}>
          جدول المراجعة اليومي
        </Text>
        <View style={[styles.scheduleCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
          {[
            { surah: 'سورة الفاتحة', desc: 'مراجعة وتثبيت (الآيات 1-7)', done: true },
            { surah: 'سورة الإخلاص', desc: 'حفظ جديد وتسميع (الآيات 1-4)', done: false, screen: 'Memorize' },
          ].map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: activeColors.border }]} />}
              <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                disabled={!item.screen}
              >
                <View style={[styles.statusBadge, {
                  backgroundColor: item.done ? COLORS.success + '20' : COLORS.secondary + '20',
                }]}>
                  <Text style={[styles.statusText, { color: item.done ? COLORS.success : COLORS.secondary }]}>
                    {item.done ? 'مكتمل' : 'قيد الحفظ'}
                  </Text>
                </View>
                <View style={styles.scheduleDetails}>
                  <Text style={[styles.scheduleSurahName, { color: activeColors.text }]}>{item.surah}</Text>
                  <Text style={[styles.scheduleDesc, { color: activeColors.textSecondary }]}>{item.desc}</Text>
                </View>
                <View style={[styles.checkBox, {
                  borderColor: item.done ? COLORS.success : COLORS.secondary,
                  backgroundColor: item.done ? COLORS.success + '15' : 'transparent',
                }]}>
                  {item.done && <MaterialCommunityIcons name="check" size={14} color={COLORS.success} />}
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SIZES.md },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg, paddingTop: 8 },
  welcomeText: { fontSize: SIZES.fontXs, fontWeight: '500' },
  titleText: { fontSize: SIZES.fontXxl, fontWeight: 'bold', marginTop: 2 },
  avatarBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, ...SHADOWS.small },

  progressCard: { borderRadius: 20, padding: SIZES.md, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg, overflow: 'hidden' },
  progressTextSection: { flex: 1, alignItems: 'flex-end' },
  progressCardTitle: { fontSize: SIZES.fontMd, fontWeight: 'bold', color: '#FFF', marginBottom: 4 },
  progressCardSubtitle: { fontSize: SIZES.fontXs, color: 'rgba(255,255,255,0.85)', marginBottom: 14, textAlign: 'right' },
  progressBtn: { backgroundColor: '#FFF', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, flexDirection: 'row-reverse', alignItems: 'center', ...SHADOWS.small },
  progressBtnText: { color: COLORS.primary, fontSize: SIZES.fontXs, fontWeight: 'bold', marginLeft: 6 },
  radialContainer: { marginLeft: SIZES.md },
  radialOuterRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  radialInnerRing: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  progressValText: { fontSize: SIZES.fontLg, fontWeight: 'bold', color: '#FFF' },
  progressSubVal: { fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: -2 },

  legendCard: { borderRadius: 14, borderWidth: 1, padding: SIZES.sm, marginBottom: SIZES.lg, flexDirection: 'row-reverse', alignItems: 'center' },
  legendTitle: { fontSize: SIZES.fontXs - 1, marginLeft: 8, whiteSpace: 'nowrap' },
  legendScroll: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 4 },
  legendBadge: { flexDirection: 'row-reverse', alignItems: 'center', marginLeft: 12 },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 4 },
  legendText: { fontSize: 10 },

  aiCard: { borderWidth: 1, borderRadius: 18, padding: SIZES.md, marginBottom: SIZES.lg, overflow: 'hidden', ...SHADOWS.small },
  aiHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8 },
  aiIconCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  aiLabel: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  aiMsgTitle: { fontSize: SIZES.fontSm + 1, fontWeight: 'bold', textAlign: 'right', marginBottom: 4 },
  aiMsgBody: { fontSize: SIZES.fontXs, lineHeight: 18, textAlign: 'right' },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  sectionTitle: { fontSize: SIZES.fontMd, fontWeight: 'bold' },
  sectionLink: { fontSize: SIZES.fontXs, fontWeight: 'bold' },

  ayahCard: { borderRadius: 18, padding: SIZES.md, borderWidth: 1, ...SHADOWS.small, marginBottom: SIZES.lg },
  ayahCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ayahSurahName: { fontSize: SIZES.fontMd, fontWeight: 'bold' },
  ayahNumber: { fontSize: SIZES.fontXs, marginTop: 2 },
  playBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  quranTextBox: { borderRadius: 14, padding: SIZES.md, borderWidth: 1, alignItems: 'center', marginBottom: SIZES.sm },
  divider: { height: 1, marginVertical: 12 },
  translationText: { fontSize: SIZES.fontXs, lineHeight: 18, textAlign: 'center', fontStyle: 'italic' },

  quickRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: SIZES.lg },
  quickCard: { flex: 1, marginHorizontal: 4, borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium },
  quickGrad: { padding: 14, alignItems: 'center', minHeight: 100, justifyContent: 'center' },
  quickLabel: { color: '#FFF', fontWeight: 'bold', fontSize: SIZES.fontSm, marginTop: 8 },
  quickSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2, textAlign: 'center' },

  scheduleCard: { borderRadius: 16, padding: SIZES.md, borderWidth: 1, ...SHADOWS.small, marginBottom: SIZES.lg },
  scheduleItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 6 },
  checkBox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  scheduleDetails: { flex: 1, alignItems: 'flex-end', marginHorizontal: 12 },
  scheduleSurahName: { fontSize: SIZES.fontSm, fontWeight: 'bold' },
  scheduleDesc: { fontSize: SIZES.fontXs - 1, marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
});
