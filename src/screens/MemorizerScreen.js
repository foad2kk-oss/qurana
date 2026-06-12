import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';

/* ── Beep sound on mistake (web only) ── */
function playBeep() {
  if (Platform.OS !== 'web') return;
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.55);
    setTimeout(() => ctx.close(), 1200);
  } catch (_) {}
}
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { AudioContext } from '../context/AudioContext';
import { ProgressContext } from '../context/ProgressContext';
import { ALL_SURAHS, TAJWEED_RULES, loadSurahAyahs, SURAH_JUZ, ALL_QARIS } from '../services/QuranData';
import { TextInput } from 'react-native';
import { getTafsir } from '../services/TafsirData';

const SURAHS = ALL_SURAHS;
import { evaluateRecitation, transcribeAudio, getMockCorrection } from '../services/SpeechService';

const { width } = Dimensions.get('window');

export default function MemorizerScreen({ navigation }) {
  const { themeMode, isOfflineGraderMode, apiKey, addHistoryLog, toggleMemorized, isVerseMemorized } = useContext(ProgressContext);
  const activeColors = COLORS[themeMode];

  const {
    isPlaying,
    currentSurah,
    currentAyah,
    currentQari,
    setCurrentQari,
    repetitionCount,
    setRepetitionCount,
    groupRepetition,
    playbackSpeed,
    setSpeed,
    isLoading,
    playAyah,
    playGroup,
    pauseSound,
    resumeSound,
    unloadSound,
    ayahRange,
    setAyahRange,
    isRecording,
    recordedUri,
    startRecording,
    stopRecording,
    playRecordedVoice,
    isPlaybackUserVoice,
    stopRecordedVoice
  } = useContext(AudioContext);

  // Component UI State
  const [selectedSurahIndex, setSelectedSurahIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('listen'); // 'listen' | 'recite'
  
  // Modals / Overlays
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
  const [isAyahRangeModalOpen, setIsAyahRangeModalOpen] = useState(false);
  const [isQariModalOpen, setIsQariModalOpen] = useState(false);

  // Surah filter state
  const [surahSearch, setSurahSearch] = useState('');
  const [selectedJuz, setSelectedJuz] = useState(0); // 0 = all

  // Tafsir panel
  const [showTafsir, setShowTafsir] = useState(false);
  const [ayahTafsir, setAyahTafsir] = useState({}); // { ayahNum: tafsirText }
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);

  // Recitation evaluation state
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [durationSecs, setDurationSecs] = useState(0);
  const timerRef = useRef(null);

  // Sequential (آية بآية) mode
  const [isSeqMode, setIsSeqMode]   = useState(false);
  const [seqOffset, setSeqOffset]   = useState(0);
  const [completedSeq, setCompletedSeq] = useState([]);

  // Reset sequential progress when range or surah changes
  useEffect(() => { setSeqOffset(0); setCompletedSeq([]); setEvaluationResult(null); }, [selectedSurahIndex, ayahRange.start, ayahRange.end]);

  // ── Reveal mode (التسميع المخفي — آية بآية كدوائر) ──
  const [isRevealMode,       setIsRevealMode]       = useState(false);
  const [revealedAyahs,      setRevealedAyahs]      = useState(new Set()); // indices in displayAyahs
  const [errorAyahs,         setErrorAyahs]         = useState(new Set()); // indices with mistakes
  const [currentRevealIdx,   setCurrentRevealIdx]   = useState(0);         // active ayah index
  const [isRevealListening,  setIsRevealListening]  = useState(false);
  const [revealAllDone,      setRevealAllDone]       = useState(false);
  const revealRecogRef       = useRef(null);
  const isRevealListenRef    = useRef(false);
  const currentRevealIdxRef  = useRef(0);
  const revealAyahsRef       = useRef([]); // full displayAyahs list

  const normalizeAr = (s = '') =>
    s.replace(/[ؐ-ًؚ-ٰٟۖ-ۭ]/g, '')
     .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
     .replace(/\s+/g, ' ').trim();

  function processRevealAyah(text) {
    const idx = currentRevealIdxRef.current;
    const ayahs = revealAyahsRef.current;
    if (idx >= ayahs.length) return;

    const ayahWords = ayahs[idx]?.words || [];
    const spoken  = normalizeAr(text).split(/\s+/).filter(Boolean);
    const correct = spoken.filter((w, i) => normalizeAr(ayahWords[i]?.text || '') === w).length;
    const ratio   = ayahWords.length > 0 ? correct / ayahWords.length : 0;

    if (ratio >= 0.5) {
      setRevealedAyahs(prev => new Set([...prev, idx]));
    } else {
      setErrorAyahs(prev => new Set([...prev, idx]));
      playBeep();
    }

    const nextIdx = idx + 1;
    currentRevealIdxRef.current = nextIdx;
    setCurrentRevealIdx(nextIdx);

    if (nextIdx >= ayahs.length) {
      stopRevealListening();
      setRevealAllDone(true);
    }
  }

  function startRevealListening(ayahsList) {
    if (Platform.OS !== 'web') { alert('هذه الميزة تعمل على المتصفح فقط'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('يحتاج Chrome أو Edge'); return; }

    revealAyahsRef.current       = ayahsList;
    currentRevealIdxRef.current  = 0;
    isRevealListenRef.current    = true;
    setRevealedAyahs(new Set());
    setErrorAyahs(new Set());
    setCurrentRevealIdx(0);
    setRevealAllDone(false);
    setIsRevealListening(true);

    function session() {
      if (!isRevealListenRef.current) return;
      const r = new SR();
      r.lang = 'ar-SA'; r.continuous = false; r.interimResults = false;

      r.onresult = e => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
        processRevealAyah(text);
      };
      r.onend = () => {
        revealRecogRef.current = null;
        if (isRevealListenRef.current) setTimeout(session, 150);
      };
      r.onerror = ev => { if (ev.error === 'no-speech' || ev.error === 'aborted') return; };
      revealRecogRef.current = r;
      try { r.start(); } catch (_) {}
    }
    session();
  }

  function stopRevealListening() {
    isRevealListenRef.current = false;
    setIsRevealListening(false);
    if (revealRecogRef.current) { try { revealRecogRef.current.abort(); } catch (_) {} revealRecogRef.current = null; }
  }

  function resetRevealMode() {
    stopRevealListening();
    setIsRevealMode(false);
    setRevealedAyahs(new Set());
    setErrorAyahs(new Set());
    setCurrentRevealIdx(0);
    setRevealAllDone(false);
    currentRevealIdxRef.current = 0;
  }

  // Cleanup reveal on unmount / surah change
  useEffect(() => () => stopRevealListening(), []);
  useEffect(() => { resetRevealMode(); }, [selectedSurahIndex, ayahRange.start, ayahRange.end]);

  // Waveform animation ref
  const waveAnims = useRef(Array(8).fill(0).map(() => new Animated.Value(4))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentSurahObj = SURAHS[selectedSurahIndex];

  const [activeAyahs, setActiveAyahs] = useState([]);
  const [isLoadingAyahs, setIsLoadingAyahs] = useState(true);

  // Set default range and load ayahs when Surah changes
  useEffect(() => {
    const fetchAyahs = async () => {
      setIsLoadingAyahs(true);
      try {
        const ayahs = await loadSurahAyahs(currentSurahObj.id);
        setActiveAyahs(ayahs);
        // Default range: first 5 ayahs (or all if surah has ≤5)
        const defaultEnd = Math.min(5, currentSurahObj.totalAyahs);
        setAyahRange({ start: 1, end: defaultEnd });
        setEvaluationResult(null);
      } catch (err) {
        console.error(err);
        alert('فشل تحميل آيات السورة. يرجى التأكد من الاتصال بالإنترنت.');
      } finally {
        setIsLoadingAyahs(false);
      }
    };
    fetchAyahs();
    unloadSound();
  }, [selectedSurahIndex]);

  // Fetch per-ayah tafsir when panel opens
  const fetchAyahTafsir = async () => {
    if (isLoadingTafsir || Object.keys(ayahTafsir).length > 0) return;
    setIsLoadingTafsir(true);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${currentSurahObj.id}/ar.muyassar`
      );
      if (!res.ok) throw new Error('tafsir fetch failed');
      const data = await res.json();
      const map = {};
      (data.data?.ayahs || []).forEach(a => { map[a.numberInSurah] = a.text; });
      setAyahTafsir(map);
    } catch (e) {
      console.log('Tafsir fetch error:', e);
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  // Duration Timer for recording
  useEffect(() => {
    if (isRecording) {
      setDurationSecs(0);
      timerRef.current = setInterval(() => {
        setDurationSecs(prev => prev + 1);
      }, 1000);
      
      // Start waveform & pulse animation
      startRecordingAnimations();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      pulseAnim.setValue(1);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecordingAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    // Waveform bars animation
    waveAnims.forEach((anim, idx) => {
      const runWave = () => {
        if (!isRecording) return;
        const toVal = Math.random() * 32 + 4; // Height from 4 to 36
        const speed = Math.random() * 200 + 100;
        Animated.timing(anim, {
          toValue: toVal,
          duration: speed,
          useNativeDriver: false,
        }).start(() => {
          if (isRecording) runWave();
        });
      };
      runWave();
    });
  };

  // Recording action handlers
  const handleStartRecord = async () => {
    setEvaluationResult(null);
    const success = await startRecording();
    if (!success) {
      alert('الرجاء السماح بالوصول إلى الميكروفون للتسجيل.');
    }
  };

  const handleStopRecordAndGrade = async () => {
    const uri = await stopRecording();
    if (!uri) return;

    setIsEvaluating(true);
    try {
      let recitationReport;

      // In sequential mode evaluate only the current single ayah
      const clampedEnd = Math.min(ayahRange.end, ayahRange.start + 7);
      const rangeAyahs = activeAyahs.slice(ayahRange.start - 1, clampedEnd);
      const targetAyahs = isSeqMode ? [rangeAyahs[seqOffset]].filter(Boolean) : rangeAyahs;
      const groupWords  = targetAyahs.flatMap(a => a.words || []);
      const refAyah     = ayahRange.start + (isSeqMode ? seqOffset : 0);

      if (isOfflineGraderMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        recitationReport = getMockCorrection(groupWords, refAyah);
      } else {
        const transcription = await transcribeAudio(uri, apiKey);
        recitationReport = evaluateRecitation(groupWords, transcription);
        recitationReport.tajweedErrors = (recitationReport.words || [])
          .filter(w => (w.status === 'missing' || w.status === 'tajweed_error') && w.rule && w.rule !== 'none');
      }

      setEvaluationResult(recitationReport);

      // 🔔 Beep when there are errors
      const hasErrors = recitationReport.score < 100 ||
        (recitationReport.tajweedErrors && recitationReport.tajweedErrors.length > 0);
      if (hasErrors) playBeep();

      // Save to history
      addHistoryLog(currentSurahObj.id, refAyah, recitationReport.score, recitationReport.feedback);

      // In sequential mode, save result to completed list
      if (isSeqMode) {
        setCompletedSeq(prev => [...prev, {
          ayahNum: refAyah,
          score: recitationReport.score,
          hasErrors,
        }]);
      }
    } catch (e) {
      console.error(e);
      alert(e.message === 'API_KEY_MISSING'
        ? 'يرجى إدخال مفتاح API الخاص بـ OpenAI في الإعدادات لتفعيل التحليل بالذكاء الاصطناعي، أو تشغيل وضع التقييم المحلي.'
        : 'فشل تحليل الصوت. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  // Advance to next ayah in sequential mode
  const handleSeqNext = () => {
    const clampedEnd = Math.min(ayahRange.end, ayahRange.start + 7);
    const total = clampedEnd - ayahRange.start + 1;
    setEvaluationResult(null);
    if (seqOffset + 1 < total) {
      setSeqOffset(o => o + 1);
    } else {
      // Finished all ayahs
      setIsSeqMode(false);
      setSeqOffset(0);
    }
  };

  const handleWordPress = (word) => {
    if (word.rule && word.rule !== 'none') {
      setSelectedWord({
        text: word.text,
        ruleKey: word.rule,
        ...TAJWEED_RULES[word.rule]
      });
    }
  };

  const currentPlayingAyahObj = activeAyahs[(currentAyah || 1) - 1] || activeAyahs[0];
  // All ayahs in the selected range (max 8) to display in the board
  const clampedEnd = Math.min(ayahRange.end, ayahRange.start + 7);
  const rangeAyahs = activeAyahs.slice(ayahRange.start - 1, clampedEnd);
  // In sequential mode show only the current ayah
  const displayAyahs = isSeqMode ? rangeAyahs.slice(seqOffset, seqOffset + 1) : rangeAyahs;
  const seqTotal = rangeAyahs.length;

  // Tafsir for current surah
  const currentTafsir = getTafsir(
    currentSurahObj.id, currentSurahObj.name,
    currentSurahObj.englishName, currentSurahObj.totalAyahs, currentSurahObj.type
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      
      {/* Header Selector Bar */}
      <View style={[styles.selectorBar, { backgroundColor: activeColors.surface, borderBottomColor: activeColors.border }]}>
        <TouchableOpacity style={styles.selectorItem} onPress={() => setIsSurahModalOpen(true)}>
          <Text style={[styles.selectorLabel, { color: activeColors.textSecondary }]}>السورة</Text>
          <View style={styles.selectorValueRow}>
            <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.primary} />
            <Text style={[styles.selectorValueText, { color: activeColors.text }]}>{currentSurahObj.name}</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.verticalDivider, { backgroundColor: activeColors.border }]} />

        <TouchableOpacity style={styles.selectorItem} onPress={() => setIsAyahRangeModalOpen(true)}>
          <Text style={[styles.selectorLabel, { color: activeColors.textSecondary }]}>الآيات</Text>
          <View style={styles.selectorValueRow}>
            <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.primary} />
            <Text style={[styles.selectorValueText, { color: activeColors.text }]}>{ayahRange.start} - {ayahRange.end}</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.verticalDivider, { backgroundColor: activeColors.border }]} />

        <TouchableOpacity style={styles.selectorItem} onPress={() => setIsQariModalOpen(true)}>
          <Text style={[styles.selectorLabel, { color: activeColors.textSecondary }]}>القارئ</Text>
          <View style={styles.selectorValueRow}>
            <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.primary} />
            <Text style={[styles.selectorValueText, { color: activeColors.text }]}>
              {ALL_QARIS.find(q => q.id === currentQari)?.name?.split(' ').slice(-1)[0] || currentQari}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tafsir quick link */}
      {navigation && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Tafsir', { surah: currentSurahObj })}
          style={[styles.tafsirLinkBar, { backgroundColor: COLORS.primary + '14', borderColor: COLORS.primary + '40' }]}
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={15} color={COLORS.primary} />
          <Text style={[styles.tafsirLinkText, { color: COLORS.primary }]}>
            اقرأ تفسير سورة {currentSurahObj.name}
          </Text>
          <MaterialCommunityIcons name="arrow-left" size={15} color={COLORS.primary} />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Playback Settings Ribbon */}
        <View style={[styles.settingsRibbon, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
          <View style={styles.ribbonItem}>
            <Text style={[styles.ribbonLabel, { color: activeColors.textSecondary }]}>تكرار المجموعة</Text>
            <View style={styles.numberControl}>
              <TouchableOpacity onPress={() => setRepetitionCount(Math.max(1, repetitionCount - 1))}>
                <MaterialCommunityIcons name="minus" size={16} color={activeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.numberValue, { color: activeColors.text }]}>{repetitionCount}x</Text>
              <TouchableOpacity onPress={() => setRepetitionCount(repetitionCount + 1)}>
                <MaterialCommunityIcons name="plus" size={16} color={activeColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.verticalDivider, { backgroundColor: activeColors.border }]} />

          <View style={styles.ribbonItem}>
            <Text style={[styles.ribbonLabel, { color: activeColors.textSecondary }]}>سرعة القراءة</Text>
            <View style={styles.numberControl}>
              <TouchableOpacity onPress={() => setSpeed(Math.max(0.8, playbackSpeed - 0.2))}>
                <MaterialCommunityIcons name="minus" size={16} color={activeColors.text} />
              </TouchableOpacity>
              <Text style={[styles.numberValue, { color: activeColors.text }]}>{playbackSpeed.toFixed(1)}x</Text>
              <TouchableOpacity onPress={() => setSpeed(Math.min(1.4, playbackSpeed + 0.2))}>
                <MaterialCommunityIcons name="plus" size={16} color={activeColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mode Selector Tabs with Premium Glass Borders */}
        <View style={[styles.tabBarContainer, { backgroundColor: activeColors.surfaceAlt, borderColor: activeColors.border }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'recite' && styles.activeTabBtn]} 
            onPress={() => {
              setActiveTab('recite');
              pauseSound();
              setEvaluationResult(null);
            }}
          >
            {activeTab === 'recite' ? (
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabBtnGradient}
              >
                <MaterialCommunityIcons name="microphone" size={18} color="#FFF" />
                <Text style={[styles.tabBtnText, { color: '#FFF', paddingVertical: 0 }]}>تسميع وتصحيح</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabBtnGradient}>
                <MaterialCommunityIcons name="microphone" size={18} color={activeColors.textSecondary} />
                <Text style={[styles.tabBtnText, { color: activeColors.textSecondary, paddingVertical: 0 }]}>تسميع وتصحيح</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'listen' && styles.activeTabBtn]}
            onPress={() => {
              setActiveTab('listen');
              setEvaluationResult(null);
            }}
          >
            {activeTab === 'listen' ? (
              <LinearGradient
                colors={COLORS.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabBtnGradient}
              >
                <MaterialCommunityIcons name="headphones" size={18} color="#FFF" />
                <Text style={[styles.tabBtnText, { color: '#FFF', paddingVertical: 0 }]}>استماع وتكرار</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabBtnGradient}>
                <MaterialCommunityIcons name="headphones" size={18} color={activeColors.textSecondary} />
                <Text style={[styles.tabBtnText, { color: activeColors.textSecondary, paddingVertical: 0 }]}>استماع وتكرار</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quran Display Board — shows all ayahs in the selected range */}
        <View style={[styles.quranBoard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          {isLoadingAyahs || rangeAyahs.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10, color: activeColors.textSecondary }}>جاري تحميل آيات السورة الكريمة...</Text>
            </View>
          ) : (
            <>
              {/* Board header */}
              <View style={styles.boardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {isPlaying && activeTab === 'listen' && (
                    <View style={[styles.groupRepBadge, { backgroundColor: COLORS.primary + '20' }]}>
                      <ActivityIndicator color={COLORS.primary} size="small" />
                      <Text style={[styles.groupRepText, { color: COLORS.primary }]}>
                        {groupRepetition}/{repetitionCount}
                      </Text>
                    </View>
                  )}
                  {isSeqMode && (
                    <View style={[styles.groupRepBadge, { backgroundColor: COLORS.primary + '20' }]}>
                      <Text style={[styles.groupRepText, { color: COLORS.primary }]}>
                        {seqOffset + 1}/{seqTotal}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.ayahIndicatorText, { color: activeColors.textSecondary }]}>
                  {isSeqMode
                    ? `الآية ${ayahRange.start + seqOffset} · تسميع متسلسل`
                    : `الآيات ${ayahRange.start}–${ayahRange.end} · ${rangeAyahs.length} آية`}
                </Text>
              </View>

              {/* Completed ayahs indicators in seq mode */}
              {isSeqMode && completedSeq.length > 0 && (
                <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {completedSeq.map((r, i) => (
                    <View key={i} style={{
                      paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
                      backgroundColor: r.hasErrors ? COLORS.error + '20' : COLORS.success + '20',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: r.hasErrors ? COLORS.error : COLORS.success }}>
                        {r.ayahNum} · {r.score}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Reveal mode: full circle grid overlay ── */}
              {isRevealMode ? (
                <View style={styles.revealGrid}>
                  {displayAyahs.map((ayahObj, aIdx) => {
                    const ayahNum   = isSeqMode ? ayahRange.start + seqOffset : ayahRange.start + aIdx;
                    const isActive  = aIdx === currentRevealIdx && isRevealListening;
                    const isDone    = revealedAyahs.has(aIdx);
                    const hasError  = errorAyahs.has(aIdx);
                    const isPending = !isDone && !hasError && aIdx !== currentRevealIdx;
                    const isNext    = !isRevealListening && aIdx === currentRevealIdx && !revealAllDone;

                    if (isDone || hasError) {
                      // Revealed: show actual text
                      return (
                        <View key={aIdx} style={[styles.revealAyahCard, {
                          borderColor: hasError ? COLORS.error + '80' : COLORS.success + '80',
                          backgroundColor: hasError ? COLORS.error + '10' : COLORS.success + '10',
                        }]}>
                          <View style={[styles.revealAyahNumBadge, {
                            backgroundColor: hasError ? COLORS.error : COLORS.success,
                          }]}>
                            <Text style={styles.revealAyahNumText}>{ayahNum}</Text>
                          </View>
                          <View style={styles.revealAyahTextWrapper}>
                            {ayahObj.words.map((w, i) => (
                              <Text key={i} style={[styles.revealAyahWord, { color: hasError ? COLORS.error : COLORS.success }]}>
                                {w.text}{' '}
                              </Text>
                            ))}
                          </View>
                          <MaterialCommunityIcons
                            name={hasError ? 'close-circle' : 'check-circle'}
                            size={18}
                            color={hasError ? COLORS.error : COLORS.success}
                            style={{ marginTop: 6 }}
                          />
                        </View>
                      );
                    }

                    // Hidden circle
                    return (
                      <View key={aIdx} style={[styles.revealCircleWrap, isActive && styles.revealCircleActive]}>
                        <View style={[styles.revealCircle, {
                          borderColor: isActive ? COLORS.primary : isNext ? COLORS.primary + '60' : (themeMode === 'dark' ? '#334' : '#ccd'),
                          backgroundColor: isActive
                            ? COLORS.primary + '25'
                            : isNext
                            ? COLORS.primary + '10'
                            : (themeMode === 'dark' ? '#1a2233' : '#f0f0f8'),
                          borderWidth: isActive ? 2.5 : 1.5,
                        }]}>
                          <Text style={[styles.revealCircleNum, {
                            color: isActive ? COLORS.primary : isNext ? COLORS.primary : (themeMode === 'dark' ? '#8899aa' : '#99aabb'),
                          }]}>
                            {ayahNum}
                          </Text>
                          {isActive && (
                            <View style={styles.revealCirclePulse} />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
              /* ── Normal ayah rendering ── */
              displayAyahs.map((ayahObj, aIdx) => {
                const ayahNum = isSeqMode ? ayahRange.start + seqOffset : ayahRange.start + aIdx;
                const isCurrentlyPlaying = currentAyah === ayahNum && isPlaying;
                const isCurrentAyah = currentAyah === ayahNum;

                return (
                  <View
                    key={ayahObj.id || ayahNum}
                    style={[
                      styles.ayahBlock,
                      {
                        backgroundColor: isCurrentlyPlaying
                          ? COLORS.primary + '12'
                          : isCurrentAyah
                          ? COLORS.primary + '07'
                          : 'transparent',
                        borderColor: isCurrentAyah ? COLORS.primary + '50' : activeColors.border,
                        borderWidth: isCurrentAyah ? 1.5 : 1,
                      },
                    ]}
                  >
                    {/* Ayah number badge */}
                    <View style={styles.ayahNumRow}>
                      <View style={[styles.ayahNumBadge, { backgroundColor: isCurrentAyah ? COLORS.primary : activeColors.surfaceAlt }]}>
                        <Text style={[styles.ayahNumBadgeText, { color: isCurrentAyah ? '#FFF' : activeColors.textMuted }]}>
                          {ayahNum}
                        </Text>
                      </View>
                      {isCurrentlyPlaying && (
                        <View style={[styles.nowPlayingDot, { backgroundColor: COLORS.primary }]} />
                      )}
                      <TouchableOpacity
                        style={{ marginRight: 'auto' }}
                        onPress={() => toggleMemorized(currentSurahObj.id, ayahNum)}
                      >
                        <MaterialCommunityIcons
                          name={isVerseMemorized(currentSurahObj.id, ayahNum) ? 'check-circle' : 'check-circle-outline'}
                          size={18}
                          color={isVerseMemorized(currentSurahObj.id, ayahNum) ? COLORS.primary : activeColors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Interactive word-level Quran text */}
                    <View style={[styles.quranWordsWrapper, {
                      backgroundColor: themeMode === 'dark' ? 'rgba(13,148,136,0.04)' : '#FAF9F6',
                    }]}>
                      {ayahObj.words.map((word, idx) => {
                        const ruleDetails = TAJWEED_RULES[word.rule] || TAJWEED_RULES.none;
                        const wordColor = themeMode === 'dark' ? ruleDetails.darkColor : ruleDetails.color;
                        const hasRule = word.rule !== 'none';
                        return (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={hasRule ? 0.6 : 1.0}
                            onPress={() => handleWordPress(word)}
                            style={[
                              styles.wordTouch,
                              hasRule && { borderBottomWidth: 2, borderBottomColor: wordColor, borderStyle: 'dashed' },
                            ]}
                          >
                            <Text style={[styles.quranWordText, { color: hasRule ? wordColor : activeColors.text }]}>
                              {word.text}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Translation — hide English, show ayah number only */}
                  </View>
                );
              })
              )}

              {/* Group playing indicator */}
              {isPlaying && activeTab === 'listen' && (
                <View style={[styles.repeatOverlay, { backgroundColor: COLORS.primary + '15' }]}>
                  <ActivityIndicator color={COLORS.primary} size="small" style={{ marginLeft: 8 }} />
                  <Text style={[styles.repeatOverlayText, { color: COLORS.primary }]}>
                    يتلو الشيخ · تكرار المجموعة {groupRepetition}/{repetitionCount}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Tafsir collapsible panel ── */}
        <TouchableOpacity
          onPress={() => { setShowTafsir(v => !v); if (!showTafsir) fetchAyahTafsir(); }}
          style={[styles.tafsirToggleBtn, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name={showTafsir ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.primary} />
          <Text style={[styles.tafsirToggleText, { color: COLORS.primary }]}>
            تفسير الآيات {ayahRange.start}–{clampedEnd}
          </Text>
          <MaterialCommunityIcons name="book-open-page-variant" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        {showTafsir && (
          <View style={[styles.tafsirPanel, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
            {/* Surah info header */}
            {currentTafsir && (
              <View style={styles.tafsirPanelHeader}>
                <View style={[styles.tafsirRevBadge, {
                  backgroundColor: currentTafsir.revelation === 'مكية' ? '#D97706' : '#0D9488'
                }]}>
                  <Text style={styles.tafsirRevText}>{currentTafsir.revelation}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  {(currentTafsir.themes || []).map((theme, i) => (
                    <View key={i} style={[styles.tafsirThemeChip, { backgroundColor: COLORS.primary + '18', borderColor: COLORS.primary + '40' }]}>
                      <Text style={[styles.tafsirThemeText, { color: COLORS.primary }]}>{theme}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Per-ayah tafsir */}
            {isLoadingTafsir ? (
              <View style={{ alignItems: 'center', padding: 16 }}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={[{ color: activeColors.textMuted, marginTop: 8, fontSize: 13 }]}>جاري تحميل التفسير...</Text>
              </View>
            ) : (
              rangeAyahs.map((ayahObj, aIdx) => {
                const ayahNum = ayahRange.start + aIdx;
                const tafsirText = ayahTafsir[ayahNum];
                return (
                  <View key={ayahNum} style={[styles.ayahTafsirBlock, { borderColor: activeColors.border }]}>
                    {/* Ayah text */}
                    <View style={styles.ayahTafsirHeader}>
                      <View style={[styles.ayahNumBadge, { backgroundColor: COLORS.primary }]}>
                        <Text style={[styles.ayahNumBadgeText, { color: '#FFF' }]}>{ayahNum}</Text>
                      </View>
                      <Text style={[styles.ayahTafsirArabic, { color: activeColors.text }]} numberOfLines={2}>
                        {ayahObj.text}
                      </Text>
                    </View>
                    {/* Tafsir text */}
                    {tafsirText ? (
                      <Text style={[styles.ayahTafsirText, { color: activeColors.textSecondary }]}>
                        {tafsirText}
                      </Text>
                    ) : (
                      <Text style={[styles.ayahTafsirText, { color: activeColors.textMuted }]}>
                        {currentTafsir?.summary || 'التفسير غير متاح حالياً'}
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ── Reveal Mode Panel (works in both tabs) ── */}
        {isRevealMode && (
          <View style={[styles.revealPanel, { backgroundColor: activeColors.surface, borderColor: COLORS.primary + '40' }]}>
            <View style={styles.revealHeader}>
              <TouchableOpacity onPress={resetRevealMode} style={styles.revealCloseBtn}>
                <MaterialCommunityIcons name="close" size={16} color={activeColors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.revealTitle, { color: activeColors.text }]}>وضع التسميع المخفي</Text>
              <MaterialCommunityIcons name="eye-off" size={18} color={COLORS.primary} />
            </View>

            {revealAllDone ? (
              <View style={{ alignItems: 'center', paddingVertical: 8, gap: 6 }}>
                <Text style={{ color: errorAyahs.size === 0 ? COLORS.success : COLORS.error, fontWeight: 'bold', fontSize: 15 }}>
                  {errorAyahs.size === 0 ? '🎉 ممتاز! جميع الآيات صحيحة' : `انتهى التسميع · ${errorAyahs.size} آية فيها خطأ`}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={[styles.revealStatBadge, { backgroundColor: COLORS.success + '20' }]}>
                    <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 13 }}>✓ {revealedAyahs.size}</Text>
                  </View>
                  <View style={[styles.revealStatBadge, { backgroundColor: COLORS.error + '20' }]}>
                    <Text style={{ color: COLORS.error, fontWeight: 'bold', fontSize: 13 }}>✗ {errorAyahs.size}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => startRevealListening(displayAyahs)}
                  style={[styles.revealStartBtn, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary }]}
                >
                  <MaterialCommunityIcons name="refresh" size={16} color={COLORS.primary} />
                  <Text style={[styles.revealStartBtnText, { color: COLORS.primary }]}>إعادة التسميع</Text>
                </TouchableOpacity>
              </View>
            ) : isRevealListening ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View style={styles.revealListeningRow}>
                  <View style={[styles.revealPulse, { backgroundColor: COLORS.error }]} />
                  <Text style={{ color: COLORS.error, fontWeight: 'bold', fontSize: 13 }}>
                    يستمع… اقرأ الآية {(isSeqMode ? ayahRange.start + seqOffset : ayahRange.start) + currentRevealIdx}
                  </Text>
                </View>
                <View style={styles.revealProgressRow}>
                  <Text style={{ color: activeColors.textSecondary, fontSize: 12 }}>
                    {currentRevealIdx} / {displayAyahs.length} آية
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={[styles.revealStatBadge, { backgroundColor: COLORS.success + '20' }]}>
                      <Text style={{ color: COLORS.success, fontWeight: 'bold', fontSize: 12 }}>✓ {revealedAyahs.size}</Text>
                    </View>
                    <View style={[styles.revealStatBadge, { backgroundColor: COLORS.error + '20' }]}>
                      <Text style={{ color: COLORS.error, fontWeight: 'bold', fontSize: 12 }}>✗ {errorAyahs.size}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={stopRevealListening}
                  style={[styles.revealStartBtn, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error }]}>
                  <MaterialCommunityIcons name="stop" size={16} color={COLORS.error} />
                  <Text style={[styles.revealStartBtnText, { color: COLORS.error }]}>إيقاف</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => startRevealListening(displayAyahs)}
                style={[styles.revealStartBtn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
              >
                <MaterialCommunityIcons name="microphone" size={16} color="#FFF" />
                <Text style={[styles.revealStartBtnText, { color: '#FFF' }]}>ابدأ التسميع</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Listen Mode Controls */}
        {activeTab === 'listen' && (
          <View style={styles.controlCenter}>

            {/* Reveal mode toggle */}
            <TouchableOpacity
              onPress={() => { setIsRevealMode(v => !v); if (isRevealMode) resetRevealMode(); }}
              style={[styles.revealToggleBtn, {
                backgroundColor: isRevealMode ? COLORS.primary + '15' : 'transparent',
                borderColor: isRevealMode ? COLORS.primary : activeColors.border,
              }]}
            >
              <MaterialCommunityIcons name={isRevealMode ? 'eye-off' : 'eye-off-outline'} size={16} color={isRevealMode ? COLORS.primary : activeColors.textSecondary} />
              <Text style={{ color: isRevealMode ? COLORS.primary : activeColors.textSecondary, fontSize: 12, fontWeight: 'bold' }}>
                {isRevealMode ? 'إلغاء وضع التسميع المخفي' : 'تسميع مخفي — اضغط للتفعيل'}
              </Text>
            </TouchableOpacity>
            <View style={styles.recitationControlsRow}>
              {/* Skip to previous ayah */}
              <TouchableOpacity
                style={[styles.sideControlBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surface }]}
                onPress={() => {
                  const current = currentAyah || ayahRange.start;
                  if (current > ayahRange.start) playAyah(currentSurahObj.id, current - 1);
                }}
                disabled={!currentAyah || currentAyah <= ayahRange.start}
              >
                <MaterialCommunityIcons
                  name="skip-next"
                  size={24}
                  color={(!currentAyah || currentAyah <= ayahRange.start) ? activeColors.textMuted : activeColors.text}
                />
              </TouchableOpacity>

              {/* Play / Pause whole group */}
              <TouchableOpacity
                onPress={() => {
                  if (isPlaying) {
                    pauseSound();
                  } else if (!currentAyah || currentSurah !== currentSurahObj.id) {
                    playGroup(currentSurahObj.id, ayahRange.start, ayahRange.end);
                  } else {
                    resumeSound();
                  }
                }}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={[styles.mainPlayBtn, SHADOWS.medium]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={36} color="#FFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Restart group from beginning */}
              <TouchableOpacity
                style={[styles.sideControlBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surface }]}
                onPress={() => playGroup(currentSurahObj.id, ayahRange.start, ayahRange.end)}
              >
                <MaterialCommunityIcons name="restart" size={24} color={activeColors.text} />
              </TouchableOpacity>
            </View>

            {/* Skip to next ayah (manual nav) */}
            <View style={styles.ayahSkipRow}>
              <TouchableOpacity
                style={[styles.ayahSkipBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surfaceAlt }]}
                onPress={() => {
                  const current = currentAyah || ayahRange.start;
                  if (current < ayahRange.end) playAyah(currentSurahObj.id, current + 1);
                }}
                disabled={currentAyah >= ayahRange.end}
              >
                <MaterialCommunityIcons name="chevron-right" size={16} color={currentAyah >= ayahRange.end ? activeColors.textMuted : activeColors.text} />
                <Text style={[styles.ayahSkipText, { color: currentAyah >= ayahRange.end ? activeColors.textMuted : activeColors.text }]}>
                  الآية التالية
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ayahSkipBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surfaceAlt }]}
                onPress={() => {
                  const current = currentAyah || ayahRange.start;
                  if (current > ayahRange.start) playAyah(currentSurahObj.id, current - 1);
                }}
                disabled={!currentAyah || currentAyah <= ayahRange.start}
              >
                <Text style={[styles.ayahSkipText, { color: (!currentAyah || currentAyah <= ayahRange.start) ? activeColors.textMuted : activeColors.text }]}>
                  الآية السابقة
                </Text>
                <MaterialCommunityIcons name="chevron-left" size={16} color={(!currentAyah || currentAyah <= ayahRange.start) ? activeColors.textMuted : activeColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recite & Correction Mode Controls */}
        {activeTab === 'recite' && (
          <View style={styles.voiceSection}>

            {/* ── Sequential mode toggle ── */}
            <TouchableOpacity
              onPress={() => { setIsSeqMode(v => !v); setSeqOffset(0); setCompletedSeq([]); setEvaluationResult(null); }}
              style={[styles.seqToggleBtn, {
                backgroundColor: isSeqMode ? COLORS.primary : COLORS.primary + '15',
                borderColor: COLORS.primary,
              }]}
            >
              <MaterialCommunityIcons
                name={isSeqMode ? 'format-list-numbered' : 'format-list-numbered'}
                size={16}
                color={isSeqMode ? '#FFF' : COLORS.primary}
              />
              <Text style={[styles.seqToggleText, { color: isSeqMode ? '#FFF' : COLORS.primary }]}>
                {isSeqMode ? `وضع التسميع آية بآية · ${seqOffset + 1}/${seqTotal}` : 'تسميع آية بآية'}
              </Text>
            </TouchableOpacity>

            {/* Recording State UI */}
            {isRecording ? (
              <View style={[styles.recordingCard, { backgroundColor: COLORS.error + '08', borderColor: COLORS.error + '30' }]}>
                <Text style={[styles.recTimerText, { color: COLORS.error }]}>
                  {Math.floor(durationSecs / 60)}:{(durationSecs % 60).toString().padStart(2, '0')}
                </Text>
                
                {/* Simulated Waveform Visualization */}
                <View style={styles.waveContainer}>
                  {waveAnims.map((anim, idx) => (
                    <Animated.View 
                      key={idx} 
                      style={[
                        styles.waveBar, 
                        { height: anim, backgroundColor: COLORS.error }
                      ]} 
                    />
                  ))}
                </View>
                
                <Text style={[styles.recInstruction, { color: activeColors.textSecondary }]}>اقرأ الآية بوضوح ورتل أحكامها</Text>
                
                <TouchableOpacity 
                  style={[styles.stopRecBtn, { backgroundColor: COLORS.error }]} 
                  onPress={handleStopRecordAndGrade}
                >
                  <MaterialCommunityIcons name="stop" size={20} color="#FFF" />
                  <Text style={styles.stopRecBtnText}>إيقاف وتحليل الصوت</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.recordStartWrapper}>
                {isEvaluating ? (
                  <View style={[styles.evaluatingCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={[styles.evaluatingText, { color: activeColors.text }]}>جاري تحليل تلاوتك ومطابقتها...</Text>
                    <Text style={[styles.evaluatingSubtext, { color: activeColors.textSecondary }]}>مقارنة مع آيات القرآن وتدقيق التشكيل</Text>
                  </View>
                ) : (
                  <View style={styles.micLayout}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <TouchableOpacity onPress={handleStartRecord}>
                        <LinearGradient
                          colors={COLORS.primaryGradient}
                          style={[styles.micBigCircle, SHADOWS.medium]}
                        >
                          <MaterialCommunityIcons name="microphone" size={42} color="#FFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                    <Text style={[styles.micBigInstruction, { color: activeColors.text }]}>اضغط للتسميع والتصحيح الذكي</Text>
                  </View>
                )}
              </View>
            )}

            {/* ── Evaluation Result Card ── */}
            {evaluationResult && !isRecording && !isEvaluating && (
              <View style={[styles.resultCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>

                {/* Score header */}
                <View style={styles.resultHeader}>
                  <View style={[styles.scoreBadge, {
                    backgroundColor: evaluationResult.score >= 90 ? COLORS.success + '20'
                      : evaluationResult.score >= 70 ? COLORS.warning + '20' : COLORS.error + '20'
                  }]}>
                    <Text style={[styles.scoreText, {
                      color: evaluationResult.score >= 90 ? COLORS.success
                        : evaluationResult.score >= 70 ? COLORS.secondary : COLORS.error
                    }]}>{evaluationResult.score}%</Text>
                  </View>
                  <Text style={[styles.resultTitle, { color: activeColors.text }]}>نتيجة التلاوة والتجويد</Text>
                </View>

                {/* Colour legend */}
                <View style={styles.legendRow}>
                  {[
                    { color: COLORS.success,   label: 'صحيح' },
                    { color: COLORS.error,     label: 'محذوف' },
                    { color: COLORS.secondary, label: 'خطأ تجويد' },
                    { color: COLORS.accent,    label: 'زائد' },
                  ].map(l => (
                    <View key={l.label} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                      <Text style={[styles.legendLabel, { color: activeColors.textSecondary }]}>{l.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Word-level diff with tajweed colours */}
                <View style={[styles.diffWrapper, {
                  backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderColor: activeColors.border,
                }]}>
                  {evaluationResult.words.map((item, idx) => {
                    const tajweedRule = TAJWEED_RULES[item.rule];
                    const ruleColor = tajweedRule && item.rule !== 'none'
                      ? (themeMode === 'dark' ? tajweedRule.darkColor : tajweedRule.color)
                      : null;

                    let wordColor, textDeco = 'none', bgColor = 'transparent', borderColor = 'transparent';

                    if (item.status === 'correct') {
                      wordColor = ruleColor || COLORS.success;
                    } else if (item.status === 'missing') {
                      wordColor = ruleColor || COLORS.error;
                      textDeco = 'line-through';
                      bgColor = (ruleColor || COLORS.error) + '18';
                      borderColor = (ruleColor || COLORS.error) + '60';
                    } else if (item.status === 'tajweed_error') {
                      wordColor = ruleColor || COLORS.secondary;
                      bgColor = (ruleColor || COLORS.secondary) + '18';
                      borderColor = (ruleColor || COLORS.secondary) + '80';
                    } else if (item.status === 'harakat_error') {
                      wordColor = COLORS.secondary;
                      bgColor = COLORS.secondary + '15';
                      borderColor = COLORS.secondary + '60';
                    } else if (item.status === 'extra') {
                      wordColor = COLORS.accent;
                      bgColor = COLORS.accent + '12';
                      borderColor = COLORS.accent + '50';
                    }

                    const hasError = item.status !== 'correct';

                    return (
                      <View key={idx} style={[styles.diffWordBox,
                        hasError && { backgroundColor: bgColor, borderColor, borderWidth: 1, borderRadius: 8, padding: 4 }
                      ]}>
                        <Text style={[styles.diffWordText, { color: wordColor, textDecorationLine: textDeco }]}>
                          {item.text}
                        </Text>
                        {/* Tajweed rule badge */}
                        {item.rule && item.rule !== 'none' && (item.status === 'missing' || item.status === 'tajweed_error') && (
                          <View style={[styles.ruleBadgeSmall, { backgroundColor: (ruleColor || COLORS.secondary) + '30' }]}>
                            <Text style={[styles.ruleBadgeSmallText, { color: ruleColor || COLORS.secondary }]}>
                              {tajweedRule?.name?.split(' ')[0]}
                            </Text>
                          </View>
                        )}
                        {item.status === 'extra' && (
                          <Text style={[styles.correctionExtraHint, { color: COLORS.accent }]}>زائد</Text>
                        )}
                        {item.status === 'harakat_error' && (
                          <Text style={[styles.correctionHarakatHint, { color: COLORS.secondary }]}>حركة</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* ── Tajweed errors panel (grouped by rule) ── */}
                {evaluationResult.tajweedErrors && evaluationResult.tajweedErrors.length > 0 && (() => {
                  // Group errors by rule
                  const grouped = {};
                  evaluationResult.tajweedErrors.forEach(err => {
                    if (!grouped[err.rule]) grouped[err.rule] = [];
                    grouped[err.rule].push(err.text);
                  });
                  const CORRECTION = {
                    qalqalah: 'اهتزاز الصوت عند السكون — حروف: ق ط ب ج د',
                    ghunnah:  'غنة الأنف بمقدار حركتين — على: نّ مّ',
                    ikhfa:    'إخفاء النون جزئياً مع الغنة',
                    idgham:   'إدغام النون في الحرف التالي',
                    iqlab:    'قلب النون ميماً عند حرف الباء',
                    izhar:    'إظهار التنوين/النون بوضوح بلا غنة',
                    madd:     'مد الصوت — حركتان طبيعي أو أكثر فرعي',
                    tafkheem: 'تغليظ الحرف حتى يمتلئ الفم بصداه',
                  };
                  return (
                    <>
                      <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                      <Text style={[styles.tajweedErrorsTitle, { color: activeColors.text }]}>
                        أخطاء التجويد المكتشفة
                      </Text>
                      {Object.entries(grouped).map(([ruleKey, words], i) => {
                        const rule = TAJWEED_RULES[ruleKey];
                        const ruleColor = rule ? (themeMode === 'dark' ? rule.darkColor : rule.color) : COLORS.secondary;
                        return (
                          <View key={i} style={[styles.tajweedGroupRow, { borderColor: ruleColor + '60', backgroundColor: ruleColor + '10' }]}>
                            {/* Rule badge */}
                            <View style={[styles.tajweedGroupBadge, { backgroundColor: ruleColor }]}>
                              <Text style={styles.tajweedGroupBadgeText}>{rule?.name?.split('(')[0]?.trim() || ruleKey}</Text>
                            </View>
                            {/* Words with this rule error */}
                            <View style={{ flex: 1 }}>
                              <View style={styles.tajweedGroupWords}>
                                {words.map((w, j) => (
                                  <View key={j} style={[styles.tajweedWordChip, { backgroundColor: ruleColor + '25', borderColor: ruleColor + '60' }]}>
                                    <Text style={[styles.tajweedWordChipText, { color: ruleColor }]}>{w}</Text>
                                  </View>
                                ))}
                              </View>
                              <Text style={[styles.tajweedGroupMsg, { color: activeColors.textSecondary }]}>
                                {CORRECTION[ruleKey] || 'راجع حكم هذا الحرف في مدرسة التجويد'}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </>
                  );
                })()}

                {/* legacy placeholder for old tajweedErrors panel — keep for compat */}
                {false && evaluationResult.tajweedErrors && evaluationResult.tajweedErrors.length > 0 && (
                  <>
                    <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                    <Text style={[styles.tajweedErrorsTitle, { color: activeColors.text }]}>
                      ⚠️ أخطاء التجويد المكتشفة:
                    </Text>
                    {evaluationResult.tajweedErrors.map((err, i) => {
                      const rule = TAJWEED_RULES[err.rule];
                      const ruleColor = rule ? (themeMode === 'dark' ? rule.darkColor : rule.color) : COLORS.secondary;
                      const correctionMsg = {
                        qalqalah: 'يجب اهتزاز الصوت عند السكون على حروف القلقلة (ق، ط، ب، ج، د)',
                        ghunnah:  'يجب إخراج صوت الغنة من الأنف بمقدار حركتين',
                        ikhfa:    'يجب إخفاء النون جزئياً مع إبقاء الغنة — لا إظهار ولا إدغام',
                        idgham:   'يجب إدغام النون في الحرف التالي حتى يصيرا حرفاً مشدداً',
                        iqlab:    'يجب قلب النون ميماً مطبقة مع إبقاء الغنة',
                        izhar:    'يجب إظهار النون بوضوح بلا غنة عند الحروف الحلقية',
                        madd:     'يجب مد الصوت بالمقدار الصحيح — حركتان طبيعي، أكثر للفرعي',
                        tafkheem: 'يجب تفخيم الحرف وتغليظه حتى يمتلئ الفم بصداه',
                      }[err.rule] || 'راجع حكم هذا الحرف في مدرسة التجويد';
                      return (
                        <View key={i} style={[styles.tajweedErrorRow, { borderColor: ruleColor + '50', backgroundColor: ruleColor + '0D' }]}>
                          <MaterialCommunityIcons name="alert-circle" size={18} color={ruleColor} style={{ marginLeft: 8 }} />
                          <View style={{ flex: 1, alignItems: 'flex-end' }}>
                            <View style={styles.tajweedErrorWordRow}>
                              <View style={[styles.rulePillSmall, { backgroundColor: ruleColor + '25' }]}>
                                <Text style={[styles.rulePillSmallText, { color: ruleColor }]}>
                                  {rule?.name?.split(' ')[0]}
                                </Text>
                              </View>
                              <Text style={[styles.tajweedErrorWord, { color: ruleColor }]}>{err.text}</Text>
                            </View>
                            <Text style={[styles.tajweedErrorMsg, { color: activeColors.textSecondary }]}>{correctionMsg}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </>
                )}

                <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                <Text style={[styles.resultFeedback, { color: activeColors.textSecondary }]}>
                  {evaluationResult.feedback}
                </Text>

                {/* Next ayah button in sequential mode */}
                {isSeqMode && (
                  <TouchableOpacity
                    onPress={handleSeqNext}
                    style={[styles.seqNextBtn, { backgroundColor: COLORS.primary }]}
                  >
                    <Text style={styles.seqNextBtnText}>
                      {seqOffset + 1 < seqTotal ? `التالية ← الآية ${ayahRange.start + seqOffset + 1}` : '✓ انتهى التسميع'}
                    </Text>
                    <MaterialCommunityIcons name="arrow-left" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}

                {/* Compare buttons */}
                <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                <View style={styles.compareVoiceRow}>
                  <TouchableOpacity
                    style={[styles.compareVoiceBtn, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}
                    onPress={playRecordedVoice}
                    disabled={isPlaybackUserVoice}
                  >
                    <MaterialCommunityIcons name={isPlaybackUserVoice ? 'volume-high' : 'volume-medium'} size={16} color={COLORS.primary} />
                    <Text style={[styles.compareVoiceBtnText, { color: COLORS.primary }]}>استمع لتلاوتك</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.compareVoiceBtn, { borderColor: activeColors.textSecondary, backgroundColor: activeColors.surfaceAlt }]}
                    onPress={() => playGroup(currentSurahObj.id, ayahRange.start, ayahRange.end)}
                  >
                    <MaterialCommunityIcons name="headphones" size={16} color={activeColors.text} />
                    <Text style={[styles.compareVoiceBtnText, { color: activeColors.text }]}>استمع للشيخ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Popover explaining Tajweed Rule */}
      <Modal
        visible={selectedWord !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableOpacity 
          style={styles.modalBg} 
          activeOpacity={1} 
          onPress={() => setSelectedWord(null)}
        >
          <View style={[styles.popoverCard, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
            <View style={styles.popoverHeader}>
              <MaterialCommunityIcons name="book-open-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.popoverTitle, { color: activeColors.text }]}>حكم التجويد في كلمة ({selectedWord?.text})</Text>
            </View>
            <Text style={[styles.popoverRuleName, { color: themeMode === 'dark' ? selectedWord?.darkColor : selectedWord?.color }]}>
              {selectedWord?.name}
            </Text>
            <Text style={[styles.popoverDesc, { color: activeColors.textSecondary }]}>
              {selectedWord?.description}
            </Text>
            <TouchableOpacity 
              style={[styles.popoverCloseBtn, { backgroundColor: COLORS.primary }]} 
              onPress={() => setSelectedWord(null)}
            >
              <Text style={styles.popoverCloseText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Surah List Modal — with search + juz filter */}
      <Modal
        visible={isSurahModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSurahModalOpen(false)}
      >
        <View style={styles.bottomSheetBg}>
          <View style={[styles.bottomSheetCard, { backgroundColor: activeColors.surface, maxHeight: '85%' }]}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => { setIsSurahModalOpen(false); setSurahSearch(''); setSelectedJuz(0); }}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>إغلاق</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: activeColors.text }]}>اختر السورة الكريمة</Text>
            </View>

            {/* Search input */}
            <View style={[styles.searchBox, { backgroundColor: activeColors.surfaceAlt || activeColors.background, borderColor: activeColors.border }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={activeColors.textSecondary} />
              <TextInput
                value={surahSearch}
                onChangeText={setSurahSearch}
                placeholder="ابحث باسم السورة أو رقمها..."
                placeholderTextColor={activeColors.textMuted}
                style={[styles.searchInput, { color: activeColors.text }]}
                textAlign="right"
              />
              {surahSearch.length > 0 && (
                <TouchableOpacity onPress={() => setSurahSearch('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={activeColors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Juz filter tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.juzScroll} contentContainerStyle={styles.juzScrollContent}>
              {[0, ...Array.from({length: 30}, (_, i) => i + 1)].map(juz => (
                <TouchableOpacity
                  key={juz}
                  style={[styles.juzTab, selectedJuz === juz && { backgroundColor: COLORS.primary }]}
                  onPress={() => setSelectedJuz(juz)}
                >
                  <Text style={[styles.juzTabText, { color: selectedJuz === juz ? '#FFF' : activeColors.textSecondary }]}>
                    {juz === 0 ? 'الكل' : `ج${juz}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Filtered surah list */}
            <ScrollView style={styles.sheetList}>
              {SURAHS
                .map((s, idx) => ({ ...s, idx }))
                .filter(s => {
                  const matchSearch = surahSearch === '' ||
                    s.name.includes(surahSearch) ||
                    s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
                    String(s.id).includes(surahSearch);
                  const matchJuz = selectedJuz === 0 || SURAH_JUZ[s.id] === selectedJuz;
                  return matchSearch && matchJuz;
                })
                .map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sheetItemRow, {
                      borderBottomColor: activeColors.border,
                      backgroundColor: s.idx === selectedSurahIndex ? COLORS.primary + '12' : 'transparent',
                    }]}
                    onPress={() => {
                      setSelectedSurahIndex(s.idx);
                      setIsSurahModalOpen(false);
                      setSurahSearch('');
                      setSelectedJuz(0);
                    }}
                  >
                    <View style={styles.sheetItemMeta}>
                      <Text style={[styles.sheetItemTextRight, { color: activeColors.textSecondary }]}>
                        {s.type === 'Meccan' ? 'مكية' : 'مدنية'} • {s.totalAyahs} آية
                      </Text>
                      <View style={[styles.juzBadge, { backgroundColor: COLORS.secondary + '20' }]}>
                        <Text style={[styles.juzBadgeText, { color: COLORS.secondary }]}>ج{SURAH_JUZ[s.id]}</Text>
                      </View>
                    </View>
                    <View style={styles.sheetItemMain}>
                      <Text style={[styles.sheetItemNum, { color: COLORS.primary }]}>{s.id}</Text>
                      <Text style={[styles.sheetItemTextLeft, { color: activeColors.text, fontWeight: s.idx === selectedSurahIndex ? 'bold' : 'normal' }]}>
                        {s.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Ayah Range Modal Selector */}
      <Modal
        visible={isAyahRangeModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAyahRangeModalOpen(false)}
      >
        <View style={styles.bottomSheetBg}>
          <View style={[styles.bottomSheetCard, { backgroundColor: activeColors.surface }]}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setIsAyahRangeModalOpen(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>إغلاق</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: activeColors.text }]}>تحديد نطاق الآيات</Text>
            </View>
            
            <Text style={{ textAlign: 'center', marginVertical: 8, color: activeColors.textSecondary }}>
              السورة تحتوي على {currentSurahObj.totalAyahs} آية
            </Text>
            <View style={[styles.rangeHintBox, { backgroundColor: COLORS.secondary + '18', borderColor: COLORS.secondary + '40' }]}>
              <MaterialCommunityIcons name="information-outline" size={14} color={COLORS.secondary} />
              <Text style={[styles.rangeHintText, { color: COLORS.secondary }]}>
                الحد الأقصى للعرض والتسميع: 8 آيات
              </Text>
            </View>

            <View style={styles.rangeSelectorColumns}>
              {/* End Ayah Column */}
              <View style={styles.rangeCol}>
                <Text style={[styles.rangeColLabel, { color: activeColors.text }]}>نهاية النطاق</Text>
                <ScrollView style={{ height: 160 }}>
                  {Array.from({ length: currentSurahObj.totalAyahs }).map((_, i) => {
                    const val = i + 1;
                    // Must be >= start and within 8-ayah window
                    if (val < ayahRange.start) return null;
                    if (val > ayahRange.start + 7) return null;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.rangeValItem, val === ayahRange.end && { backgroundColor: COLORS.primary + '20' }]}
                        onPress={() => setAyahRange(prev => ({ ...prev, end: val }))}
                      >
                        <Text style={{ color: val === ayahRange.end ? COLORS.primary : activeColors.text, fontWeight: val === ayahRange.end ? 'bold' : 'normal' }}>الآية {val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Start Ayah Column */}
              <View style={styles.rangeCol}>
                <Text style={[styles.rangeColLabel, { color: activeColors.text }]}>بداية النطاق</Text>
                <ScrollView style={{ height: 160 }}>
                  {Array.from({ length: currentSurahObj.totalAyahs }).map((_, i) => {
                    const val = i + 1;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.rangeValItem, val === ayahRange.start && { backgroundColor: COLORS.primary + '20' }]}
                        onPress={() => {
                          // Clamp end to start+7 when start changes
                          const newEnd = Math.min(Math.max(val, ayahRange.end), val + 7);
                          setAyahRange({ start: val, end: newEnd });
                        }}
                      >
                        <Text style={{ color: val === ayahRange.start ? COLORS.primary : activeColors.text, fontWeight: val === ayahRange.start ? 'bold' : 'normal' }}>الآية {val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Qari Modal — redesigned cards */}
      <Modal
        visible={isQariModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsQariModalOpen(false)}
      >
        <View style={styles.bottomSheetBg}>
          <View style={[styles.bottomSheetCard, { backgroundColor: activeColors.surface }]}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setIsQariModalOpen(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>إغلاق</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: activeColors.text }]}>اختر القارئ</Text>
            </View>
            <View style={{ padding: 12 }}>
              {ALL_QARIS.map(q => {
                const isActive = currentQari === q.id;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => { setCurrentQari(q.id); setIsQariModalOpen(false); }}
                  >
                    <LinearGradient
                      colors={isActive ? COLORS.primaryGradient : ['transparent', 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.qariCard, {
                        borderColor: isActive ? COLORS.primary : activeColors.border,
                        borderWidth: isActive ? 0 : 1,
                      }]}
                    >
                      <View style={[styles.qariIconCircle, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : COLORS.primary + '15' }]}>
                        <MaterialCommunityIcons name={q.icon} size={26} color={isActive ? '#FFF' : COLORS.primary} />
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={[styles.qariCardName, { color: isActive ? '#FFF' : activeColors.text }]}>{q.name}</Text>
                        <Text style={[styles.qariCardSub, { color: isActive ? 'rgba(255,255,255,0.8)' : activeColors.textSecondary }]}>{q.subtitle}</Text>
                      </View>
                      {isActive && <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tajweedGroupRow: {
    flexDirection: 'row-reverse',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginBottom: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  tajweedGroupBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  tajweedGroupBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tajweedGroupWords: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  tajweedWordChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tajweedWordChipText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  tajweedGroupMsg: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  ayahTafsirBlock: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  ayahTafsirHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ayahTafsirArabic: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    lineHeight: 24,
  },
  ayahTafsirText: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
  },
  tafsirToggleBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  tafsirToggleText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 'bold',
  },
  tafsirPanel: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  tafsirPanelHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tafsirRevBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tafsirRevText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  tafsirThemeChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  tafsirThemeText: { fontSize: 11, fontWeight: '600' },
  tafsirSummaryText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 10,
  },
  tafsirLessonsBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  tafsirLessonsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  tafsirLessonRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  tafsirLessonDot: {
    width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0,
  },
  tafsirLessonText: {
    flex: 1, fontSize: 13, lineHeight: 20, textAlign: 'right',
  },
  rangeHintBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  rangeHintText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tafsirLinkBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tafsirLinkText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  selectorBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  selectorItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 9,
    fontFamily: 'System',
    marginBottom: 2,
  },
  selectorValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorValueText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  verticalDivider: {
    width: 1,
    height: 32,
    alignSelf: 'center',
  },
  scrollContent: {
    padding: SIZES.md,
  },
  settingsRibbon: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.md,
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginBottom: SIZES.md,
  },
  ribbonItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  ribbonLabel: {
    fontSize: SIZES.fontXs - 1,
    marginLeft: 8,
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
  tabBarContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: SIZES.md,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabBtn: {
    ...SHADOWS.small,
  },
  tabBtnText: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    marginLeft: 6,
    textAlign: 'center',
  },
  quranBoard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
    position: 'relative',
  },
  boardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  favoriteBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favBtnText: {
    fontSize: SIZES.fontXs - 2,
    fontWeight: 'bold',
    marginRight: 4,
  },
  ayahIndicatorText: {
    fontSize: SIZES.fontXs - 1,
  },
  quranWordsWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  wordTouch: {
    marginHorizontal: 4,
    marginVertical: 6,
    paddingBottom: 2,
  },
  quranWordText: {
    fontSize: SIZES.fontQuran - 4,
    fontFamily: 'System',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  translationTextText: {
    fontSize: SIZES.fontXs + 1,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  repeatOverlay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    marginTop: 12,
  },
  repeatOverlayText: {
    fontSize: SIZES.fontXs - 1,
    fontWeight: 'bold',
  },
  controlCenter: {
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  recitationControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahSkipRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  ayahSkipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  ayahSkipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ayahBlock: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  ayahNumRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ayahNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayahNumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  nowPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  groupRepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  groupRepText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  mainPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    ...SHADOWS.medium,
  },
  sideControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceSection: {
    marginTop: SIZES.sm,
  },
  recordingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    alignItems: 'center',
  },
  recTimerText: {
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: SIZES.sm,
  },
  waveContainer: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 2.5,
  },
  recInstruction: {
    fontSize: SIZES.fontXs,
    marginBottom: SIZES.md,
  },
  stopRecBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  stopRecBtnText: {
    color: '#FFF',
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  recordStartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  evaluatingCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.xl,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  evaluatingText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginTop: 16,
  },
  evaluatingSubtext: {
    fontSize: SIZES.fontXs,
    marginTop: 4,
  },
  micLayout: {
    alignItems: 'center',
  },
  micBigCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  micBigInstruction: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    marginTop: SIZES.md,
    ...SHADOWS.medium,
  },
  resultHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  resultTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  scoreBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  diffWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  diffWordBox: {
    alignItems: 'center',
    marginHorizontal: 3,
    marginVertical: 4,
  },
  diffWordText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  correctionHarakatHint: {
    fontSize: 8,
    marginTop: 1,
    fontWeight: 'bold',
  },
  correctionExtraHint: {
    fontSize: 8,
    marginTop: 1,
    fontWeight: 'bold',
  },

  // Colour legend
  legendRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 4,
  },
  legendLabel: {
    fontSize: 10,
  },

  // Tajweed error detail panel
  tajweedErrorsTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  tajweedErrorRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  tajweedErrorWordRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  tajweedErrorWord: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  tajweedErrorMsg: {
    fontSize: SIZES.fontXs - 1,
    textAlign: 'right',
    lineHeight: 17,
  },
  rulePillSmall: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  rulePillSmallText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ruleBadgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'center',
  },
  ruleBadgeSmallText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  resultFeedback: {
    fontSize: SIZES.fontXs,
    lineHeight: 18,
    textAlign: 'right',
    marginVertical: 8,
  },
  compareVoiceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  compareVoiceBtn: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  compareVoiceBtnText: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    marginRight: 6,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverCard: {
    width: width * 0.85,
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.large,
  },
  popoverHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  popoverTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginRight: 8,
  },
  popoverRuleName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: 8,
  },
  popoverDesc: {
    fontSize: SIZES.fontXs,
    lineHeight: 20,
    textAlign: 'right',
    marginBottom: 16,
  },
  popoverCloseBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  popoverCloseText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: SIZES.fontSm,
  },
  bottomSheetBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    padding: SIZES.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  sheetList: {
    marginTop: SIZES.sm,
  },
  sheetItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetItemTextLeft: {
    fontSize: SIZES.fontSm,
  },
  sheetItemTextRight: {
    fontSize: SIZES.fontXs,
  },
  rangeSelectorColumns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rangeCol: {
    flex: 1,
    alignItems: 'center',
  },
  rangeColLabel: {
    fontWeight: 'bold',
    fontSize: SIZES.fontSm,
    marginBottom: 8,
  },
  rangeValItem: {
    width: width * 0.4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  qariRowItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    marginVertical: 6,
    alignItems: 'flex-end',
  },
  qariRowText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },

  // Search & Juz filter
  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.fontSm,
    marginRight: 8,
  },
  juzScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  juzScrollContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  juzTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 3,
    backgroundColor: 'rgba(13,148,136,0.1)',
  },
  juzTabText: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  sheetItemMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sheetItemMain: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  sheetItemNum: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    width: 22,
    textAlign: 'center',
  },
  juzBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  juzBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Reveal mode styles
  revealToggleBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    alignSelf: 'center',
  },
  revealPanel: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  revealHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  revealTitle: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'right',
  },
  revealCloseBtn: {
    padding: 4,
  },
  revealStartBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 6,
  },
  revealStartBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  revealListeningRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  revealPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.9,
  },
  revealProgressRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  revealStatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  // Reveal grid styles
  revealGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 10,
  },
  revealCircleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  revealCircleActive: {
    transform: [{ scale: 1.15 }],
  },
  revealCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  revealCircleNum: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  revealCirclePulse: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#0d9488',
    opacity: 0.4,
  },
  revealAyahCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 2,
    marginVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  revealAyahNumBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  revealAyahNumText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  revealAyahTextWrapper: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  revealAyahWord: {
    fontSize: 18,
    fontFamily: 'System',
    lineHeight: 32,
    textAlign: 'center',
  },

  hiddenWordBlock: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(150,150,150,0.15)',
    marginHorizontal: 3,
    marginVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  hiddenWordDots: {
    fontSize: 10,
    color: '#999',
    letterSpacing: 2,
  },
  errorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginTop: 2,
  },

  // Sequential mode
  seqToggleBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  seqToggleText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  seqNextBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  seqNextBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Qari cards
  qariCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginVertical: 6,
    ...SHADOWS.small,
  },
  qariIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  qariCardName: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  qariCardSub: {
    fontSize: SIZES.fontXs - 1,
    marginTop: 2,
  },
});
