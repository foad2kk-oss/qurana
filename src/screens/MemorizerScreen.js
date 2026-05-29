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
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { AudioContext } from '../context/AudioContext';
import { ProgressContext } from '../context/ProgressContext';
import { ALL_SURAHS, TAJWEED_RULES, loadSurahAyahs } from '../services/QuranData';

const SURAHS = ALL_SURAHS;
import { evaluateRecitation, transcribeAudio, getMockCorrection } from '../services/SpeechService';

const { width } = Dimensions.get('window');

export default function MemorizerScreen() {
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
    currentRepetition,
    playbackSpeed,
    setSpeed,
    isLoading,
    playAyah,
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

  // Recitation evaluation state
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [durationSecs, setDurationSecs] = useState(0);
  const timerRef = useRef(null);

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
        setAyahRange({ start: 1, end: currentSurahObj.totalAyahs });
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
      const activeIdx = (currentAyah || 1) - 1;
      const targetAyahObj = activeAyahs[activeIdx] || activeAyahs[0];

      if (isOfflineGraderMode) {
        // Run Simulated evaluation
        await new Promise(resolve => setTimeout(resolve, 1500)); // fake delay
        recitationReport = getMockCorrection(targetAyahObj.text, currentAyah);
      } else {
        // Run OpenAI Whisper voice check
        const transcription = await transcribeAudio(uri, apiKey);
        recitationReport = evaluateRecitation(targetAyahObj.words, transcription);
      }

      setEvaluationResult(recitationReport);
      
      // Save result to History log
      addHistoryLog(currentSurahObj.id, currentAyah || 1, recitationReport.score, recitationReport.feedback);
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
              {currentQari === 'husary' ? 'الحصري' : currentQari === 'minshawi' ? 'المنشاوي' : 'العفاسي'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Playback Settings Ribbon */}
        <View style={[styles.settingsRibbon, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
          <View style={styles.ribbonItem}>
            <Text style={[styles.ribbonLabel, { color: activeColors.textSecondary }]}>التكرار للآية</Text>
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

        {/* Quran Display Board with Gold Border Frame */}
        <View style={[styles.quranBoard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          {isLoadingAyahs || !currentPlayingAyahObj ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10, color: activeColors.textSecondary, fontFamily: 'System' }}>جاري تحميل آيات السورة الكريمة...</Text>
            </View>
          ) : (
            <>
              <View style={styles.boardHeader}>
                <TouchableOpacity 
                  style={[styles.favoriteBtn, { backgroundColor: isVerseMemorized(currentSurahObj.id, currentAyah || 1) ? COLORS.primary + '20' : 'transparent' }]}
                  onPress={() => toggleMemorized(currentSurahObj.id, currentAyah || 1)}
                >
                  <MaterialCommunityIcons 
                    name={isVerseMemorized(currentSurahObj.id, currentAyah || 1) ? "check-circle" : "check-circle-outline"} 
                    size={22} 
                    color={isVerseMemorized(currentSurahObj.id, currentAyah || 1) ? COLORS.primary : activeColors.textMuted} 
                  />
                  <Text style={[styles.favBtnText, { color: isVerseMemorized(currentSurahObj.id, currentAyah || 1) ? COLORS.primary : activeColors.textSecondary }]}>حفظت الآية</Text>
                </TouchableOpacity>
                
                <Text style={[styles.ayahIndicatorText, { color: activeColors.textSecondary }]}>
                  الآية {currentAyah || 1} من {currentSurahObj.totalAyahs}
                </Text>
              </View>

              {/* Interactive Word Level Quran Rendering */}
              <View style={[styles.quranWordsWrapper, { backgroundColor: themeMode === 'dark' ? 'rgba(13, 148, 136, 0.04)' : '#FAF9F6', borderColor: activeColors.border, borderWidth: 1, borderRadius: 12, padding: 12 }]}>
                {currentPlayingAyahObj.words.map((word, idx) => {
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
                        hasRule && { borderBottomWidth: 2, borderBottomColor: wordColor, borderStyle: 'dashed' }
                      ]}
                    >
                      <Text style={[styles.quranWordText, { color: hasRule ? wordColor : activeColors.text }]}>
                        {word.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Translation */}
              <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
              <Text style={[styles.translationTextText, { color: activeColors.textSecondary }]}>
                {currentPlayingAyahObj.translation}
              </Text>

              {/* Playback Repeat Indicator (Active in Listen Mode) */}
              {isPlaying && activeTab === 'listen' && (
                <View style={[styles.repeatOverlay, { backgroundColor: COLORS.primary + '15' }]}>
                  <ActivityIndicator color={COLORS.primary} size="small" style={{ marginLeft: 8 }} />
                  <Text style={[styles.repeatOverlayText, { color: COLORS.primary }]}>
                    جاري التلاوة - التكرار الحالي: ({currentRepetition} / {repetitionCount})
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Listen Mode Controls */}
        {activeTab === 'listen' && (
          <View style={styles.controlCenter}>
            <View style={styles.recitationControlsRow}>
              <TouchableOpacity 
                style={[styles.sideControlBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surface }]}
                onPress={() => {
                  const current = currentAyah || 1;
                  if (current < ayahRange.end) {
                    playAyah(currentSurahObj.id, current + 1);
                  }
                }}
                disabled={currentAyah >= ayahRange.end}
              >
                <MaterialCommunityIcons name="skip-previous" size={24} color={currentAyah >= ayahRange.end ? activeColors.textMuted : activeColors.text} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => {
                  if (isPlaying) {
                    pauseSound();
                  } else {
                    if (!currentAyah || currentSurah !== currentSurahObj.id) {
                      playAyah(currentSurahObj.id, ayahRange.start);
                    } else {
                      resumeSound();
                    }
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
                    <MaterialCommunityIcons name={isPlaying ? "pause" : "play"} size={36} color="#FFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sideControlBtn, { borderColor: activeColors.border, backgroundColor: activeColors.surface }]}
                onPress={() => {
                  const current = currentAyah || 1;
                  if (current > ayahRange.start) {
                    playAyah(currentSurahObj.id, current - 1);
                  }
                }}
                disabled={currentAyah <= ayahRange.start}
              >
                <MaterialCommunityIcons name="skip-next" size={24} color={currentAyah <= ayahRange.start ? activeColors.textMuted : activeColors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recite & Correction Mode Controls */}
        {activeTab === 'recite' && (
          <View style={styles.voiceSection}>
            
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

            {/* Evaluation Results Card with Gold Glassmorphic frame */}
            {evaluationResult && !isRecording && !isEvaluating && (
              <View style={[styles.resultCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.scoreBadge, { backgroundColor: evaluationResult.score >= 90 ? COLORS.success + '20' : evaluationResult.score >= 70 ? COLORS.warning + '20' : COLORS.error + '20' }]}>
                    <Text style={[styles.scoreText, { color: evaluationResult.score >= 90 ? COLORS.success : evaluationResult.score >= 70 ? COLORS.secondary : COLORS.error }]}>
                      {evaluationResult.score}%
                    </Text>
                  </View>
                  <Text style={[styles.resultTitle, { color: activeColors.text }]}>نتيجة التلاوة والتحليل</Text>
                </View>

                {/* Diff highlights wrapper */}
                <View style={[styles.diffWrapper, { backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: activeColors.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }]}>
                  {evaluationResult.words.map((item, idx) => {
                    let wordColor = activeColors.text;
                    let textDeco = 'none';
                    
                    if (item.status === 'correct') {
                      wordColor = COLORS.success;
                    } else if (item.status === 'missing') {
                      wordColor = COLORS.error;
                      textDeco = 'line-through';
                    } else if (item.status === 'harakat_error') {
                      wordColor = COLORS.secondary; // Orange
                    } else if (item.status === 'extra') {
                      wordColor = COLORS.accent; // Purple
                    }

                    return (
                      <View key={idx} style={styles.diffWordBox}>
                        <Text style={[styles.diffWordText, { color: wordColor, textDecorationLine: textDeco }]}>
                          {item.text}
                        </Text>
                        {item.status === 'harakat_error' && (
                          <Text style={styles.correctionHarakatHint}>[حركة]</Text>
                        )}
                        {item.status === 'extra' && (
                          <Text style={styles.correctionExtraHint}>[زائد]</Text>
                        )}
                      </View>
                    );
                  })}
                </View>

                <Text style={[styles.resultFeedback, { color: activeColors.textSecondary }]}>
                  {evaluationResult.feedback}
                </Text>

                {/* Compare Recitation Tools */}
                <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
                <View style={styles.compareVoiceRow}>
                  <TouchableOpacity 
                    style={[styles.compareVoiceBtn, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}
                    onPress={playRecordedVoice}
                    disabled={isPlaybackUserVoice}
                  >
                    <MaterialCommunityIcons name={isPlaybackUserVoice ? "volume-high" : "volume-medium"} size={16} color={COLORS.primary} />
                    <Text style={[styles.compareVoiceBtnText, { color: COLORS.primary }]}>استمع لتلاوتك</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.compareVoiceBtn, { borderColor: activeColors.textSecondary, backgroundColor: activeColors.surfaceAlt }]}
                    onPress={() => playAyah(currentSurahObj.id, currentAyah || 1, currentQari, true)}
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

      {/* Surah List Modal Selector */}
      <Modal
        visible={isSurahModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSurahModalOpen(false)}
      >
        <View style={styles.bottomSheetBg}>
          <View style={[styles.bottomSheetCard, { backgroundColor: activeColors.surface }]}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity onPress={() => setIsSurahModalOpen(false)}>
                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>إغلاق</Text>
              </TouchableOpacity>
              <Text style={[styles.sheetTitle, { color: activeColors.text }]}>اختر السورة الكريمة</Text>
            </View>
            
            <ScrollView style={styles.sheetList}>
              {SURAHS.map((s, idx) => (
                <TouchableOpacity 
                  key={s.id} 
                  style={[styles.sheetItemRow, { borderBottomColor: activeColors.border }]}
                  onPress={() => {
                    setSelectedSurahIndex(idx);
                    setIsSurahModalOpen(false);
                  }}
                >
                  <Text style={[styles.sheetItemTextRight, { color: activeColors.textSecondary }]}>{s.type === 'Meccan' ? 'مكية' : 'مدنية'} • {s.totalAyahs} آيات</Text>
                  <Text style={[styles.sheetItemTextLeft, { color: activeColors.text, fontWeight: idx === selectedSurahIndex ? 'bold' : 'normal' }]}>{s.name} ({s.englishName})</Text>
                </TouchableOpacity>
              ))}
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
            
            <Text style={{ textAlign: 'center', marginVertical: 12, color: activeColors.textSecondary }}>
              السورة تحتوي على {currentSurahObj.totalAyahs} آية
            </Text>

            <View style={styles.rangeSelectorColumns}>
              {/* End Ayah Column */}
              <View style={styles.rangeCol}>
                <Text style={[styles.rangeColLabel, { color: activeColors.text }]}>نهاية النطاق</Text>
                <ScrollView style={{ height: 160 }}>
                  {Array.from({ length: currentSurahObj.totalAyahs }).map((_, i) => {
                    const val = i + 1;
                    if (val < ayahRange.start) return null;
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
                          setAyahRange({ start: val, end: Math.max(val, ayahRange.end) });
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

      {/* Qari Modal Selector */}
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
              <Text style={[styles.sheetTitle, { color: activeColors.text }]}>اختر القارئ المفضل</Text>
            </View>
            <View style={{ padding: 12 }}>
              <TouchableOpacity 
                style={[styles.qariRowItem, currentQari === 'husary' && { borderColor: COLORS.primary }]}
                onPress={() => {
                  setCurrentQari('husary');
                  setIsQariModalOpen(false);
                }}
              >
                <Text style={[styles.qariRowText, { color: activeColors.text }]}>الشيخ محمود خليل الحصري (معلم)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.qariRowItem, currentQari === 'minshawi' && { borderColor: COLORS.primary }]}
                onPress={() => {
                  setCurrentQari('minshawi');
                  setIsQariModalOpen(false);
                }}
              >
                <Text style={[styles.qariRowText, { color: activeColors.text }]}>الشيخ محمد صديق المنشاوي (معلم)</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.qariRowItem, currentQari === 'alafasy' && { borderColor: COLORS.primary }]}
                onPress={() => {
                  setCurrentQari('alafasy');
                  setIsQariModalOpen(false);
                }}
              >
                <Text style={[styles.qariRowText, { color: activeColors.text }]}>الشيخ مشاري بن راشد العفاسي</Text>
              </TouchableOpacity>
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
    color: COLORS.secondary,
    marginTop: 1,
  },
  correctionExtraHint: {
    fontSize: 8,
    color: COLORS.accent,
    marginTop: 1,
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
  }
});
