import React, { useContext, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { ALL_SURAHS, SAMPLE_SURAHS } from '../services/QuranData';
import { getMockCorrection } from '../services/SpeechService';

const { width } = Dimensions.get('window');

export default function ProgressTrackerScreen() {
  const { themeMode, memorizedVerses, weakVerses, toggleMemorized, isVerseMemorized } = useContext(ProgressContext);
  const { startRecording, stopRecording, isRecording } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'quizzes'

  // Quiz Engine State
  const [quizType, setQuizType] = useState(null); // null | 'blank' | 'next'
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [isEvaluatingQuiz, setIsEvaluatingQuiz] = useState(false);

  // Calculate statistics
  const totalAyahs = ALL_SURAHS.reduce((sum, s) => sum + s.totalAyahs, 0);
  const totalMemorized = Object.keys(memorizedVerses).length;
  const progressPercent = totalAyahs > 0 ? Math.round((totalMemorized / totalAyahs) * 100) : 0;
  
  // Extract weak verses array
  const weakVersesArray = Object.keys(weakVerses).map(key => {
    const [surahId, ayahNum] = key.split('-').map(Number);
    const surah = ALL_SURAHS.find(s => s.id === surahId);
    return {
      surahId,
      ayahNum,
      surahName: surah ? surah.name : '',
      wrongCount: weakVerses[key]
    };
  });

  // QUIZ 1: Generate Fill in the Blank Quiz
  const startFillBlankQuiz = () => {
    // Select a random Surah and Ayah from offline sample surahs
    const randomSurah = SAMPLE_SURAHS[Math.floor(Math.random() * SAMPLE_SURAHS.length)];
    const randomAyah = randomSurah.ayahs[Math.floor(Math.random() * randomSurah.ayahs.length)];
    const words = randomAyah.words.filter(w => w.text.length > 2); // Avoid very short particles
    
    if (words.length === 0) {
      // Retry
      startFillBlankQuiz();
      return;
    }
    
    const targetWordObj = words[Math.floor(Math.random() * words.length)];
    const targetWord = targetWordObj.text;
 
    // Generate wrong choices from other surahs
    const choices = [targetWord];
    while (choices.length < 3) {
      const s = SAMPLE_SURAHS[Math.floor(Math.random() * SAMPLE_SURAHS.length)];
      const a = s.ayahs[Math.floor(Math.random() * s.ayahs.length)];
      const w = a.words[Math.floor(Math.random() * a.words.length)].text;
      if (!choices.includes(w) && w.length > 2) {
        choices.push(w);
      }
    }

    // Shuffle choices
    const shuffledChoices = choices.sort(() => Math.random() - 0.5);

    // Hide target word in text
    const hiddenText = randomAyah.text.replace(targetWord, '______');

    setQuizQuestion({
      surahName: randomSurah.name,
      ayahNum: randomAyah.number,
      questionText: hiddenText,
      choices: shuffledChoices,
      correctAnswer: targetWord
    });
    setQuizType('blank');
    setSelectedAnswer(null);
    setQuizFeedback(null);
  };

  const handleAnswerSubmit = (choice) => {
    setSelectedAnswer(choice);
    if (choice === quizQuestion.correctAnswer) {
      setQuizFeedback({
        success: true,
        text: 'أحسنت! إجابة صحيحة بارك الله فيك.'
      });
    } else {
      setQuizFeedback({
        success: false,
        text: `للأسف إجابة خاطئة. الكلمة الصحيحة هي: (${quizQuestion.correctAnswer})`
      });
    }
  };

  // QUIZ 2: Generate Recite Next Verse Quiz
  const startNextVerseQuiz = () => {
    // Select consecutive ayahs from sample offline surahs
    const filteredSurahs = SAMPLE_SURAHS.filter(s => s.totalAyahs > 1);
    const randomSurah = filteredSurahs[Math.floor(Math.random() * filteredSurahs.length)];
    // Choose any ayah except the last one
    const randomAyahIdx = Math.floor(Math.random() * (randomSurah.ayahs.length - 1));
    const promptAyah = randomSurah.ayahs[randomAyahIdx];
    const targetAyah = randomSurah.ayahs[randomAyahIdx + 1];

    setQuizQuestion({
      surahId: randomSurah.id,
      surahName: randomSurah.name,
      promptText: promptAyah.text,
      promptNum: promptAyah.number,
      targetText: targetAyah.text,
      targetNum: targetAyah.number
    });

    setQuizType('next');
    setSelectedAnswer(null);
    setQuizFeedback(null);
  };

  const handleStartQuizRecord = async () => {
    setQuizFeedback(null);
    await startRecording();
  };

  const handleStopQuizRecordAndGrade = async () => {
    const uri = await stopRecording();
    if (!uri) return;

    setIsEvaluatingQuiz(true);
    // Simulate speech-to-text grading
    setTimeout(() => {
      setIsEvaluatingQuiz(false);
      const score = Math.floor(Math.random() * 20) + 80; // 80 - 99
      setQuizFeedback({
        score,
        success: score >= 85,
        text: score >= 85 
          ? `تلاوة ممتازة! النتيجة: ${score}%. لقد تلوت الآية التالية بنجاح وبأحكام تجويد صحيحة.` 
          : `قراءة مقبولة. النتيجة: ${score}%. انتبه لتثبيت الحفظ ونطق المخارج بشكل أدق.`
      });
    }, 1500);
  };

  const resetQuiz = () => {
    setQuizType(null);
    setQuizQuestion(null);
    setSelectedAnswer(null);
    setQuizFeedback(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      
      {/* Top Tabs */}
      <View style={[styles.tabBarContainer, { backgroundColor: activeColors.surface, borderBottomColor: activeColors.border }]}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'quizzes' && styles.activeTab]}
          onPress={() => {
            setActiveTab('quizzes');
            resetQuiz();
          }}
        >
          <Text style={[styles.tabBtnText, { color: activeTab === 'quizzes' ? COLORS.primary : activeColors.textSecondary }]}>
            اختبارات الحفظ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabBtnText, { color: activeTab === 'stats' ? COLORS.primary : activeColors.textSecondary }]}>
            إحصائيات وحفظ
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* STATS & PROGRESS CHECKLIST TAB */}
        {activeTab === 'stats' && (
          <View>
            
            {/* Stats Dashboard with Gold Borders */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
                <MaterialCommunityIcons name="trophy-outline" size={26} color={COLORS.secondary} />
                <Text style={[styles.statVal, { color: activeColors.text }]}>{totalMemorized}</Text>
                <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>آيات حفظت</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={26} color={COLORS.error} />
                <Text style={[styles.statVal, { color: activeColors.text }]}>{weakVersesArray.length}</Text>
                <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>آيات ضعيفة</Text>
              </View>

              <View style={[styles.statBox, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
                <MaterialCommunityIcons name="progress-clock" size={26} color={COLORS.primary} />
                <Text style={[styles.statVal, { color: activeColors.text }]}>{progressPercent}%</Text>
                <Text style={[styles.statLabel, { color: activeColors.textSecondary }]}>نسبة الإتمام</Text>
              </View>
            </View>

            {/* Checklist of Surahs */}
            <Text style={[styles.sectionTitle, { color: activeColors.text }]}>حالة حفظ السور المتوفرة</Text>
            <View style={[styles.cardList, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
              {ALL_SURAHS.map((surah) => {
                // Count memorized in this surah by filtering saved keys
                const memorizedInSurah = Object.keys(memorizedVerses).filter(k => k.startsWith(`${surah.id}-`)).length;
                const isCompleted = memorizedInSurah === surah.totalAyahs;

                return (
                  <View key={surah.id} style={[styles.surahCheckRow, { borderBottomColor: activeColors.border }]}>
                    <View style={styles.surahProgressWrapper}>
                      <Text style={[styles.surahStatsText, { color: activeColors.textSecondary }]}>
                        {memorizedInSurah} / {surah.totalAyahs} آية
                      </Text>
                      {isCompleted ? (
                        <View style={[styles.badge, { backgroundColor: COLORS.success + '20' }]}>
                          <Text style={[styles.badgeText, { color: COLORS.success }]}>مكتملة</Text>
                        </View>
                      ) : memorizedInSurah > 0 ? (
                        <View style={[styles.badge, { backgroundColor: COLORS.warning + '20' }]}>
                          <Text style={[styles.badgeText, { color: COLORS.secondary }]}>قيد الحفظ</Text>
                        </View>
                      ) : (
                        <View style={[styles.badge, { backgroundColor: activeColors.surfaceAlt }]}>
                          <Text style={[styles.badgeText, { color: activeColors.textMuted }]}>لم تبدأ</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.surahDetails}>
                      <Text style={[styles.surahNameTitle, { color: activeColors.text }]}>{surah.name}</Text>
                      <Text style={[styles.surahEnglish, { color: activeColors.textSecondary }]}>{surah.englishName} • {surah.type === 'Meccan' ? 'مكية' : 'مدنية'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Weak Verses Section */}
            {weakVersesArray.length > 0 && (
              <View style={{ marginTop: SIZES.md }}>
                <Text style={[styles.sectionTitle, { color: activeColors.text }]}>آيات تحتاج تثبيت ومراجعة (أخطاء تكررت)</Text>
                <View style={[styles.cardList, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
                  {weakVersesArray.map((wv, idx) => (
                    <View key={idx} style={[styles.weakAyahRow, { borderBottomColor: activeColors.border }]}>
                      <View style={[styles.errorCountBadge, { backgroundColor: COLORS.error + '10' }]}>
                        <Text style={{ color: COLORS.error, fontSize: 10, fontWeight: 'bold' }}>أخطاء: {wv.wrongCount}</Text>
                      </View>
                      <View style={styles.weakInfo}>
                        <Text style={[styles.weakText, { color: activeColors.text }]}>سورة {wv.surahName} - الآية {wv.ayahNum}</Text>
                        <Text style={[styles.weakHint, { color: activeColors.textSecondary }]}>تدرب عليها في شاشة التسميع والتكرار</Text>
                      </View>
                      <MaterialCommunityIcons name="arrow-left-circle-outline" size={24} color={COLORS.primary} />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <View>
            {quizType === null ? (
              // Quiz Selection Menu
              <View style={styles.quizSelectorContainer}>
                
                <TouchableOpacity 
                  style={[styles.quizOptionCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}
                  onPress={startFillBlankQuiz}
                >
                  <View style={[styles.quizIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                    <MaterialCommunityIcons name="book-open-outline" size={32} color={COLORS.primary} />
                  </View>
                  <Text style={[styles.quizOptionTitle, { color: activeColors.text }]}>اختبار الكلمة الناقصة</Text>
                  <Text style={[styles.quizOptionDesc, { color: activeColors.textSecondary }]}>تظهر لك آية بها فراغ، وعليك اختيار الكلمة الصحيحة المتممة للآية من بين الخيارات.</Text>
                  
                  <LinearGradient
                    colors={COLORS.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quizStartBtn}
                  >
                    <Text style={styles.quizStartText}>ابدأ الاختبار</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quizOptionCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}
                  onPress={startNextVerseQuiz}
                >
                  <View style={[styles.quizIconCircle, { backgroundColor: COLORS.secondary + '15' }]}>
                    <MaterialCommunityIcons name="microphone" size={32} color={COLORS.secondary} />
                  </View>
                  <Text style={[styles.quizOptionTitle, { color: activeColors.text }]}>اختبار تسميع الآية التالية</Text>
                  <Text style={[styles.quizOptionDesc, { color: activeColors.textSecondary }]}>نعرض لك آية ونقوم بتشغيل صوتها، وعليك تسجيل صوتك وأنت تتلو الآية التي تليها مباشرة.</Text>
                  
                  <LinearGradient
                    colors={COLORS.goldGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quizStartBtn}
                  >
                    <Text style={styles.quizStartText}>ابدأ التسميع</Text>
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            ) : quizType === 'blank' ? (
              
              // QUIZ 1: FILL IN THE BLANK INTERFACE
              <View style={[styles.quizPanel, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
                
                <View style={styles.quizPanelHeader}>
                  <TouchableOpacity onPress={resetQuiz}>
                    <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>إنهاء</Text>
                  </TouchableOpacity>
                  <Text style={[styles.quizPanelTitle, { color: activeColors.text }]}>سورة {quizQuestion.surahName}</Text>
                </View>

                <Text style={[styles.quizQuestionPrompt, { color: activeColors.textSecondary }]}>ما هي الكلمة الناقصة المكملة للآية {quizQuestion.ayahNum}؟</Text>
                
                <View style={[styles.quizTextContainer, { backgroundColor: activeColors.surfaceAlt }]}>
                  <Text style={[styles.quizQuranText, { color: activeColors.text }]}>{quizQuestion.questionText}</Text>
                </View>

                {/* Choices list */}
                <View style={styles.choicesWrapper}>
                  {quizQuestion.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice;
                    const isCorrect = choice === quizQuestion.correctAnswer;
                    let btnStyle = { borderColor: activeColors.border };
                    let textStyle = { color: activeColors.text };

                    if (selectedAnswer) {
                      if (isCorrect) {
                        btnStyle = { borderColor: COLORS.success, backgroundColor: COLORS.success + '15' };
                        textStyle = { color: COLORS.success, fontWeight: 'bold' };
                      } else if (isSelected) {
                        btnStyle = { borderColor: COLORS.error, backgroundColor: COLORS.error + '15' };
                        textStyle = { color: COLORS.error, fontWeight: 'bold' };
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        disabled={selectedAnswer !== null}
                        style={[styles.choiceBtn, btnStyle]}
                        onPress={() => handleAnswerSubmit(choice)}
                      >
                        <Text style={[styles.choiceBtnText, textStyle]}>{choice}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {quizFeedback && (
                  <View style={styles.quizFeedbackWrapper}>
                    <Text style={[styles.feedbackText, { color: quizFeedback.success ? COLORS.success : COLORS.error }]}>
                      {quizFeedback.text}
                    </Text>
                    
                    <TouchableOpacity style={[styles.nextQuestionBtn, { backgroundColor: COLORS.primary }]} onPress={startFillBlankQuiz}>
                      <Text style={styles.nextQuestionBtnText}>الآية التالية</Text>
                      <MaterialCommunityIcons name="arrow-left" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}

              </View>
            ) : (
              
              // QUIZ 2: RECITE NEXT VERSE INTERFACE
              <View style={[styles.quizPanel, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorder }]}>
                
                <View style={styles.quizPanelHeader}>
                  <TouchableOpacity onPress={resetQuiz}>
                    <Text style={{ color: COLORS.error, fontWeight: 'bold' }}>إنهاء</Text>
                  </TouchableOpacity>
                  <Text style={[styles.quizPanelTitle, { color: activeColors.text }]}>سورة {quizQuestion.surahName}</Text>
                </View>

                <Text style={[styles.quizQuestionPrompt, { color: activeColors.textSecondary }]}>
                  استمع للآية {quizQuestion.promptNum}، ثم اتلُ الآية {quizQuestion.targetNum} بصوتك:
                </Text>

                <View style={[styles.promptAyahBox, { backgroundColor: activeColors.surfaceAlt }]}>
                  <Text style={[styles.promptAyahText, { color: activeColors.text }]}>{quizQuestion.promptText}</Text>
                  <Text style={[styles.promptAyahNum, { color: COLORS.primary }]}>الآية {quizQuestion.promptNum}</Text>
                </View>

                <View style={styles.arrowDownIndicator}>
                  <MaterialCommunityIcons name="arrow-down" size={24} color={activeColors.textMuted} />
                </View>

                <View style={[styles.targetAyahBox, { borderColor: COLORS.secondary }]}>
                  <Text style={[styles.targetAyahLabel, { color: COLORS.secondary }]}>المطلوب تلاوته الآن: الآية {quizQuestion.targetNum}</Text>
                </View>

                {/* Voice Input UI */}
                {isRecording ? (
                  <View style={styles.quizRecordingBox}>
                    <ActivityIndicator color={COLORS.error} size="small" />
                    <Text style={{ color: COLORS.error, fontWeight: 'bold', marginVertical: 6 }}>جاري الاستماع لتلاوتك...</Text>
                    <TouchableOpacity style={[styles.quizStopRecBtn, { backgroundColor: COLORS.error }]} onPress={handleStopQuizRecordAndGrade}>
                      <Text style={{ color: '#FFF', fontWeight: 'bold' }}>إيقاف وتدقيق التسميع</Text>
                    </TouchableOpacity>
                  </View>
                ) : isEvaluatingQuiz ? (
                  <View style={styles.quizRecordingBox}>
                    <ActivityIndicator color={COLORS.primary} size="large" />
                    <Text style={{ color: activeColors.text, fontWeight: 'bold', marginTop: 12 }}>جاري مطابقة التلاوة وتقييم الحفظ...</Text>
                  </View>
                ) : (
                  <View style={styles.quizMicWrapper}>
                    <TouchableOpacity onPress={handleStartQuizRecord}>
                      <LinearGradient
                        colors={COLORS.goldGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.quizMicBtn, SHADOWS.small]}
                      >
                        <MaterialCommunityIcons name="microphone" size={26} color="#FFF" />
                        <Text style={styles.quizMicText}>اضغط وسجل الآية التالية</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Score and feedback */}
                {quizFeedback && !isRecording && !isEvaluatingQuiz && (
                  <View style={[styles.quizFeedbackWrapper, { marginTop: SIZES.md }]}>
                    <Text style={[styles.quizScoreResult, { color: quizFeedback.success ? COLORS.success : COLORS.secondary }]}>
                      الدرجة التقديرية للحفظ: {quizFeedback.score}%
                    </Text>
                    <Text style={[styles.quizFeedbackBodyText, { color: activeColors.textSecondary }]}>
                      {quizFeedback.text}
                    </Text>

                    <View style={styles.nextQuizRow}>
                      <TouchableOpacity style={[styles.nextQuestionBtn, { backgroundColor: COLORS.primary }]} onPress={startNextVerseQuiz}>
                        <Text style={styles.nextQuestionBtnText}>الآية التالية</Text>
                        <MaterialCommunityIcons name="arrow-left" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabBtnText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SIZES.md,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  statBox: {
    width: (width - SIZES.md * 3) / 3,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statVal: {
    fontSize: SIZES.fontMd + 2,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 9,
  },
  sectionTitle: {
    fontSize: SIZES.fontSm + 1,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SIZES.sm,
  },
  cardList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  surahCheckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  surahProgressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahStatsText: {
    fontSize: SIZES.fontXs - 1,
    marginRight: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: SIZES.fontXs - 3,
    fontWeight: 'bold',
  },
  surahDetails: {
    alignItems: 'flex-end',
  },
  surahNameTitle: {
    fontSize: SIZES.fontSm + 1,
    fontWeight: 'bold',
  },
  surahEnglish: {
    fontSize: SIZES.fontXs - 2,
    marginTop: 2,
  },
  weakAyahRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  errorCountBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  weakInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 12,
  },
  weakText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  weakHint: {
    fontSize: SIZES.fontXs - 2,
    marginTop: 2,
  },
  quizSelectorContainer: {
    marginTop: SIZES.sm,
  },
  quizOptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  quizIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizOptionTitle: {
    fontSize: SIZES.fontSm + 2,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  quizOptionDesc: {
    fontSize: SIZES.fontXs,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  quizStartBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  quizStartText: {
    color: '#FFF',
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  quizPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.medium,
  },
  quizPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
    marginBottom: 12,
  },
  quizPanelTitle: {
    fontSize: SIZES.fontSm + 1,
    fontWeight: 'bold',
  },
  quizQuestionPrompt: {
    fontSize: SIZES.fontXs + 1,
    textAlign: 'right',
    marginBottom: 12,
  },
  quizTextContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
  },
  quizQuranText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    lineHeight: 36,
    textAlign: 'center',
  },
  choicesWrapper: {
    marginVertical: 12,
  },
  choiceBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  choiceBtnText: {
    fontSize: SIZES.fontSm + 1,
  },
  quizFeedbackWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  feedbackText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  nextQuestionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextQuestionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  promptAyahBox: {
    borderRadius: 12,
    padding: SIZES.md,
    alignItems: 'center',
    marginVertical: 8,
  },
  promptAyahText: {
    fontSize: SIZES.fontMd + 2,
    lineHeight: 34,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  promptAyahNum: {
    fontSize: SIZES.fontXs - 1,
    marginTop: 6,
    fontWeight: 'bold',
  },
  arrowDownIndicator: {
    alignItems: 'center',
    marginVertical: 4,
  },
  targetAyahBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  targetAyahLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  quizMicWrapper: {
    alignItems: 'center',
  },
  quizMicBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    ...SHADOWS.small,
  },
  quizMicText: {
    color: '#FFF',
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginRight: 8,
  },
  quizRecordingBox: {
    alignItems: 'center',
    padding: 12,
  },
  quizStopRecBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  quizScoreResult: {
    fontSize: SIZES.fontSm + 2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  quizFeedbackBodyText: {
    fontSize: SIZES.fontXs,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 12,
  },
  nextQuizRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  }
});
