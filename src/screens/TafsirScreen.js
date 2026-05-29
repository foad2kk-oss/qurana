import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Animated, Dimensions, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { getTafsir } from '../services/TafsirData';
import { SURAHS } from '../services/QuranData';
import { SURAH_JUZ } from '../services/QuranData';

const { width } = Dimensions.get('window');

const REVELATION_BADGE = {
  مكية: { bg: '#D97706', text: '#FFF', icon: 'weather-sunny' },
  مدنية: { bg: '#0D9488', text: '#FFF', icon: 'city-variant-outline' },
};

const THEME_COLORS = [
  '#0D9488', '#7C3AED', '#D97706', '#DC2626', '#059669',
  '#2563EB', '#DB2777', '#EA580C', '#0891B2', '#65A30D',
];

// ─── Surah list item ─────────────────────────────────────────────────────────
function SurahRow({ surah, isSelected, onPress, activeColors }) {
  const juz = SURAH_JUZ[surah.number] || 1;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.surahRow,
        { backgroundColor: isSelected ? COLORS.primary + '22' : activeColors.surface,
          borderColor: isSelected ? COLORS.primary : activeColors.border },
      ]}
    >
      <View style={[styles.surahNumberCircle, { backgroundColor: isSelected ? COLORS.primary : activeColors.surfaceAlt }]}>
        <Text style={[styles.surahNumberText, { color: isSelected ? '#FFF' : activeColors.textMuted }]}>
          {surah.number}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.surahNameAr, { color: activeColors.text }]}>{surah.name}</Text>
        <Text style={[styles.surahSubtitle, { color: activeColors.textMuted }]}>
          {surah.englishName} · {surah.numberOfAyahs} آية
        </Text>
      </View>
      <View style={[styles.juzBadge, { backgroundColor: COLORS.primary + '22' }]}>
        <Text style={[styles.juzBadgeText, { color: COLORS.primary }]}>ج{juz}</Text>
      </View>
      {isSelected && (
        <MaterialCommunityIcons name="check-circle" size={18} color={COLORS.primary} style={{ marginLeft: 6 }} />
      )}
    </TouchableOpacity>
  );
}

// ─── Tafsir content card ──────────────────────────────────────────────────────
function TafsirCard({ tafsir, surah, activeColors }) {
  const revBadge = REVELATION_BADGE[tafsir.revelation] || REVELATION_BADGE['مكية'];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, [tafsir]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Header gradient */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tafsirHeader}
      >
        <View style={styles.tafsirHeaderTop}>
          <View>
            <Text style={styles.tafsirSurahName}>{tafsir.title || surah.name}</Text>
            <Text style={styles.tafsirSurahEn}>{surah.englishName} · {tafsir.ayahCount || surah.numberOfAyahs} آية</Text>
          </View>
          <View style={[styles.revelationBadge, { backgroundColor: revBadge.bg }]}>
            <MaterialCommunityIcons name={revBadge.icon} size={13} color={revBadge.text} />
            <Text style={[styles.revelationText, { color: revBadge.text }]}>{tafsir.revelation}</Text>
          </View>
        </View>

        {/* Theme chips */}
        {tafsir.themes && tafsir.themes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {tafsir.themes.map((theme, i) => (
              <View key={i} style={[styles.themeChip, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={styles.themeChipText}>{theme}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
        <View style={styles.sectionLabel}>
          <MaterialCommunityIcons name="book-open-variant" size={16} color={COLORS.primary} />
          <Text style={[styles.sectionLabelText, { color: COLORS.primary }]}>ملخص التفسير</Text>
        </View>
        <Text style={[styles.summaryText, { color: activeColors.text }]}>{tafsir.summary}</Text>
      </View>

      {/* Lessons */}
      {tafsir.lessons && tafsir.lessons.length > 0 && (
        <View style={[styles.lessonsCard, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
          <View style={styles.sectionLabel}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color={COLORS.secondary} />
            <Text style={[styles.sectionLabelText, { color: COLORS.secondary }]}>الدروس والفوائد</Text>
          </View>
          {tafsir.lessons.map((lesson, i) => (
            <View key={i} style={styles.lessonRow}>
              <View style={[styles.lessonDot, { backgroundColor: THEME_COLORS[i % THEME_COLORS.length] }]} />
              <Text style={[styles.lessonText, { color: activeColors.text }]}>{lesson}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TafsirScreen({ navigation, route }) {
  const { themeMode } = useContext(ProgressContext);
  const activeColors = COLORS[themeMode];

  const initialSurah = route?.params?.surah || null;
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [search, setSearch] = useState('');
  const [selectedJuz, setSelectedJuz] = useState(0);
  const [showList, setShowList] = useState(!initialSurah);
  const [tafsir, setTafsir] = useState(
    initialSurah
      ? getTafsir(initialSurah.number, initialSurah.name, initialSurah.englishName, initialSurah.numberOfAyahs, initialSurah.revelationType)
      : null
  );

  const handleSelect = (surah) => {
    setSelectedSurah(surah);
    const t = getTafsir(surah.number, surah.name, surah.englishName, surah.numberOfAyahs, surah.revelationType);
    setTafsir(t);
    setShowList(false);
  };

  const filteredSurahs = SURAHS.filter(s => {
    const matchJuz = selectedJuz === 0 || (SURAH_JUZ[s.number] === selectedJuz);
    const q = search.trim();
    const matchSearch = !q ||
      s.name.includes(q) ||
      s.englishName.toLowerCase().includes(q.toLowerCase()) ||
      String(s.number).includes(q);
    return matchJuz && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: activeColors.background }]}>
      {/* Top bar */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        {navigation && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.topBarTitle}>تفسير السور</Text>
        <TouchableOpacity
          onPress={() => setShowList(!showList)}
          style={styles.listToggleBtn}
        >
          <MaterialCommunityIcons name={showList ? 'close' : 'format-list-bulleted'} size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ flex: 1 }}>
        {showList ? (
          /* ── Surah selector ── */
          <View style={{ flex: 1 }}>
            {/* Search */}
            <View style={[styles.searchRow, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={activeColors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: activeColors.text }]}
                placeholder="ابحث عن سورة..."
                placeholderTextColor={activeColors.textMuted}
                value={search}
                onChangeText={setSearch}
                textAlign="right"
              />
            </View>

            {/* Juz filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.juzRow}
            >
              {[0, ...Array.from({ length: 30 }, (_, i) => i + 1)].map(j => (
                <TouchableOpacity
                  key={j}
                  onPress={() => setSelectedJuz(j)}
                  style={[
                    styles.juzTab,
                    {
                      backgroundColor: selectedJuz === j ? COLORS.primary : activeColors.surfaceAlt,
                      borderColor: selectedJuz === j ? COLORS.primary : activeColors.border,
                    },
                  ]}
                >
                  <Text style={[styles.juzTabText, { color: selectedJuz === j ? '#FFF' : activeColors.textMuted }]}>
                    {j === 0 ? 'الكل' : `ج${j}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* List */}
            <FlatList
              data={filteredSurahs}
              keyExtractor={s => String(s.number)}
              renderItem={({ item }) => (
                <SurahRow
                  surah={item}
                  isSelected={selectedSurah?.number === item.number}
                  onPress={() => handleSelect(item)}
                  activeColors={activeColors}
                />
              )}
              contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : tafsir && selectedSurah ? (
          /* ── Tafsir content ── */
          <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* Change surah button */}
            <TouchableOpacity
              onPress={() => setShowList(true)}
              style={[styles.changeSurahBtn, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={16} color={COLORS.primary} />
              <Text style={[styles.changeSurahText, { color: COLORS.primary }]}>تغيير السورة</Text>
              <Text style={[styles.currentSurahLabel, { color: activeColors.textMuted }]}>
                {selectedSurah.name}
              </Text>
            </TouchableOpacity>

            <TafsirCard tafsir={tafsir} surah={selectedSurah} activeColors={activeColors} />

            <View style={{ height: 100 }} />
          </ScrollView>
        ) : (
          /* ── Empty state ── */
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#0D948822', '#7C3AED22']}
              style={styles.emptyIconCircle}
            >
              <MaterialCommunityIcons name="book-open-page-variant" size={56} color={COLORS.primary} />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: activeColors.text }]}>اختر سورة للتفسير</Text>
            <Text style={[styles.emptySubtitle, { color: activeColors.textMuted }]}>
              اضغط على الزر أعلاه لاختيار السورة التي تريد قراءة تفسيرها
            </Text>
            <TouchableOpacity
              onPress={() => setShowList(true)}
              style={styles.emptyBtn}
            >
              <LinearGradient colors={COLORS.primaryGradient} style={styles.emptyBtnGrad}>
                <Text style={styles.emptyBtnText}>تصفح السور</Text>
                <MaterialCommunityIcons name="format-list-bulleted" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 50,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backBtn: { padding: 4 },
  listToggleBtn: { padding: 4 },

  /* Search */
  searchRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    margin: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },

  /* Juz row */
  juzRow: { paddingHorizontal: 12, paddingBottom: 8, gap: 6, flexDirection: 'row-reverse' },
  juzTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  juzTabText: { fontSize: 12, fontWeight: '600' },

  /* Surah row */
  surahRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  surahNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahNumberText: { fontSize: 13, fontWeight: 'bold' },
  surahNameAr: { fontSize: 15, fontWeight: 'bold', textAlign: 'right' },
  surahSubtitle: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  juzBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  juzBadgeText: { fontSize: 11, fontWeight: 'bold' },

  /* Change surah */
  changeSurahBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    margin: 12,
    marginBottom: 0,
  },
  changeSurahText: { fontSize: 14, fontWeight: '600' },
  currentSurahLabel: { fontSize: 13, flex: 1, textAlign: 'left' },

  /* Tafsir header card */
  tafsirHeader: {
    margin: 12,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.teal,
  },
  tafsirHeaderTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tafsirSurahName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', textAlign: 'right' },
  tafsirSurahEn: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'right' },
  revelationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  revelationText: { fontSize: 12, fontWeight: 'bold' },
  themeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
  },
  themeChipText: { fontSize: 12, color: '#FFF', fontWeight: '600' },

  /* Summary card */
  summaryCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  sectionLabel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionLabelText: { fontSize: 14, fontWeight: 'bold' },
  summaryText: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
  },

  /* Lessons card */
  lessonsCard: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  lessonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  lessonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    flexShrink: 0,
  },
  lessonText: { flex: 1, fontSize: 14, lineHeight: 22, textAlign: 'right' },

  /* Content scroll */
  contentScroll: { paddingBottom: 40 },

  /* Empty state */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { borderRadius: 14, overflow: 'hidden' },
  emptyBtnGrad: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
});
