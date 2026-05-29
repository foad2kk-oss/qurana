import React, { useContext, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { TAJWEED_RULES } from '../services/QuranData';
import { transcribeAudio, analyzeTajweedCorrections, getMockCorrection } from '../services/SpeechService';

// ─── Rules Data ────────────────────────────────────────────────────────────────

const RULES_DATA = [
  {
    id: 'qalqalah',
    name: 'القلقلة (Qalqalah)',
    letters: 'قُطْبُ جَدّ (ق، ط، ب، ج، د)',
    description: 'اضطراب الصوت عند النطق بالحرف الساكن حتى يسمع له نبرة قوية. وتنقسم إلى قلقلة صغرى (في وسط الكلمة) وكبرى (في آخرها عند الوقف).',
    tip: 'تخيل أن الحرف يرتد كالكرة عند لفظه ساكناً.',
    examples: [
      { text: 'أَحَدٌ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112001.mp3', transliteration: 'Ahad — القلقلة على الدال' },
      { text: 'يَلِدْ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112003.mp3', transliteration: 'Yalid — قلقلة كبرى على الدال' },
    ],
    quiz: [
      { ayah: 'قُلْ هُوَ اللَّهُ أَحَدٌ', words: ['قُلْ', 'هُوَ', 'اللَّهُ', 'أَحَدٌ'], answer: 'قُلْ', rule: 'qalqalah', hint: 'ابحث عن حرف القاف الساكن' },
      { ayah: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', words: ['لَمْ', 'يَلِدْ', 'وَلَمْ', 'يُولَدْ'], answer: 'يَلِدْ', rule: 'qalqalah', hint: 'ابحث عن حرف الدال الساكنة في نهاية الكلمة' },
    ],
  },
  {
    id: 'ghunnah',
    name: 'الغنة (Ghunnah)',
    letters: 'الميم والنون المشددتان (مّ، نّ)',
    description: 'صوت يخرج من الخيشوم (الأنف) بمقدار حركتين عند النطق بالنون أو الميم المشددتين.',
    tip: 'أغلق فمك وانطق الحرف — يجب أن تشعر بالاهتزاز في أنفك.',
    examples: [
      { text: 'إِنَّا', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/108001.mp3', transliteration: "Inna — غنة على النون المشددة" },
      { text: 'الناسِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/114001.mp3', transliteration: "An-Nas — غنة على النون" },
    ],
    quiz: [
      { ayah: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', words: ['إِنَّا', 'أَعْطَيْنَاكَ', 'الْكَوْثَرَ'], answer: 'إِنَّا', rule: 'ghunnah', hint: 'ابحث عن النون المشددة' },
      { ayah: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', words: ['إِنَّ', 'شَانِئَكَ', 'هُوَ', 'الْأَبْتَرُ'], answer: 'إِنَّ', rule: 'ghunnah', hint: 'ابحث عن النون المشددة في أول الآية' },
    ],
  },
  {
    id: 'ikhfa',
    name: 'الإخفاء (Ikhfa)',
    letters: '١٥ حرفاً: ص ذ ث ك ج ش ق س د ط ز ف ت ض ظ',
    description: 'نطق النون الساكنة أو التنوين بحالة وسط بين الإظهار والإدغام، مع بقاء الغنة وإخفاء النون جزئياً.',
    tip: 'لا تُظهر النون بوضوح ولا تُدمجها — أخفِها مع الحفاظ على صوت الأنف.',
    examples: [
      { text: 'مِن شَرِّ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/114004.mp3', transliteration: 'Min sharri — إخفاء النون عند الشين' },
      { text: 'الْإِنسَانَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/103002.mp3', transliteration: 'Al-Insan — إخفاء النون عند السين' },
    ],
    quiz: [
      { ayah: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', words: ['إِنَّ', 'الْإِنسَانَ', 'لَفِي', 'خُسْرٍ'], answer: 'الْإِنسَانَ', rule: 'ikhfa', hint: 'ابحث عن نون ساكنة قبل السين' },
    ],
  },
  {
    id: 'idgham',
    name: 'الإدغام (Idgham)',
    letters: 'يرملون (ي، ر، م، ل، و، ن)',
    description: 'إدخال حرف النون الساكنة أو التنوين في الحرف التالي حتى يصيرا حرفاً واحداً مشدداً. بغنة مع (ي، ن، م، و) وبغير غنة مع (ل، ر).',
    tip: 'تخيل أن النون تختفي وتندمج في الحرف التالي تماماً.',
    examples: [
      { text: 'يَكُن لَّهُ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112004.mp3', transliteration: 'Yakun lahu — إدغام بغير غنة' },
    ],
    quiz: [
      { ayah: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', words: ['وَلَمْ', 'يَكُن', 'لَّهُ', 'كُفُوًا', 'أَحَدٌ'], answer: 'لَّهُ', rule: 'idgham', hint: 'ابحث عن حرف اللام المشددة بعد نون ساكنة' },
    ],
  },
  {
    id: 'iqlab',
    name: 'الإقلاب (Iqlab)',
    letters: 'حرف واحد فقط: الباء (ب)',
    description: 'قلب النون الساكنة أو التنوين ميماً مخفاة عند مجيء حرف الباء بعدها، مع إطباق الشفتين وإبقاء الغنة.',
    tip: 'اضغط شفتيك معاً وأخرج صوتاً أنفياً — النون تتحول إلى ميم.',
    examples: [
      { text: 'مِن بَعْدِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/002106.mp3', transliteration: 'Min baʿdi — إقلاب النون ميماً' },
      { text: 'أَنبِياءَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/002246.mp3', transliteration: "Anbiyā' — إقلاب النون ميماً" },
    ],
    quiz: [
      { ayah: 'مِن بَعْدِ مَا جَاءَكُمُ', words: ['مِن', 'بَعْدِ', 'مَا', 'جَاءَكُمُ'], answer: 'مِن', rule: 'iqlab', hint: 'ابحث عن النون قبل الباء' },
    ],
  },
  {
    id: 'izhar',
    name: 'الإظهار (Izhar)',
    letters: 'الحروف الحلقية: أ هـ ع ح غ خ',
    description: 'إظهار النون الساكنة أو التنوين واضحة خالصة بلا غنة عند مجيء أحد الحروف الحلقية الستة بعدها.',
    tip: 'انطق النون بوضوح تام — لا إخفاء ولا إدغام ولا غنة.',
    examples: [
      { text: 'مَنْ آمَنَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/002062.mp3', transliteration: "Man āmana — إظهار النون عند الهمزة" },
      { text: 'عَلِيمٌ حَكِيمٌ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/002032.mp3', transliteration: "ʿAlīmun Ḥakīm — إظهار التنوين عند الحاء" },
    ],
    quiz: [
      { ayah: 'مَنْ آمَنَ بِاللَّهِ', words: ['مَنْ', 'آمَنَ', 'بِاللَّهِ'], answer: 'مَنْ', rule: 'izhar', hint: 'ابحث عن نون ساكنة قبل حرف حلقي' },
    ],
  },
  {
    id: 'madd',
    name: 'المد (Madd)',
    letters: 'حروف المد: أ (ألف) — و (واو) — ي (ياء)',
    description: 'إطالة الصوت بحرف من حروف المد. المد الطبيعي حركتان، والمد الفرعي (عند الهمز أو السكون) من 4 إلى 6 حركات.',
    tip: 'عدّ بأصابعك: حركتان للمد الطبيعي، 4 أو 6 للمد اللازم.',
    examples: [
      { text: 'الرَّحِيمِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3', transliteration: 'Ar-Raheem — مد طبيعي على الياء' },
      { text: 'الْعَالَمِينَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001002.mp3', transliteration: 'Al-Alameen — مد طبيعي على الياء' },
    ],
    quiz: [
      { ayah: 'الرَّحْمَٰنِ الرَّحِيمِ', words: ['الرَّحْمَٰنِ', 'الرَّحِيمِ'], answer: 'الرَّحِيمِ', rule: 'madd', hint: 'ابحث عن حرف الياء الممدود' },
    ],
  },
  {
    id: 'tafkheem',
    name: 'التفخيم (Tafkheem)',
    letters: 'خص ضغط قظ (خ، ص، ض، غ، ط، ق، ظ) + لام الجلالة أحياناً',
    description: 'تسمين الحرف وتغليظه عند النطق به بحيث يمتلئ الفم بصدى الحرف. ويقابله الترقيق (النطق الرفيع).',
    tip: 'افتح فمك أكثر وأصدر الصوت من عمق الحلق.',
    examples: [
      { text: 'الصِّرَاطَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001006.mp3', transliteration: 'As-Sirat — تفخيم الصاد' },
      { text: 'الْمَغْضُوبِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001007.mp3', transliteration: 'Al-Maghdoob — تفخيم الغين والضاد' },
    ],
    quiz: [
      { ayah: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', words: ['اهْدِنَا', 'الصِّرَاطَ', 'الْمُسْتَقِيمَ'], answer: 'الصِّرَاطَ', rule: 'tafkheem', hint: 'ابحث عن حرف الصاد المفخم' },
    ],
  },
];

// ─── Tajweed Correction Panel ─────────────────────────────────────────────────

function CorrectionPanel({ result, ruleColor, themeMode }) {
  const activeColors = COLORS[themeMode];
  if (!result) return null;

  const { score, feedback, tajweedCorrections } = result;
  const scoreColor = score >= 85 ? COLORS.success : score >= 60 ? COLORS.secondary : COLORS.error;

  return (
    <View style={[cpStyles.container, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
      {/* Score row */}
      <View style={cpStyles.scoreRow}>
        <MaterialCommunityIcons
          name={score >= 85 ? 'check-decagram' : score >= 60 ? 'alert-circle' : 'close-circle'}
          size={28}
          color={scoreColor}
        />
        <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 10 }}>
          <Text style={[cpStyles.scoreText, { color: scoreColor }]}>درجة التلاوة: {score}%</Text>
          <Text style={[cpStyles.feedbackText, { color: activeColors.textSecondary }]}>{feedback}</Text>
        </View>
      </View>

      {/* Tajweed corrections */}
      {tajweedCorrections && tajweedCorrections.length > 0 && (
        <>
          <View style={[cpStyles.divider, { backgroundColor: activeColors.border }]} />
          <Text style={[cpStyles.sectionTitle, { color: activeColors.text }]}>تصحيح أحكام التجويد:</Text>
          {tajweedCorrections.map((item, idx) => (
            <View key={idx} style={[cpStyles.correctionRow, { borderColor: item.status === 'needs_attention' ? COLORS.error + '60' : COLORS.success + '60' }]}>
              <MaterialCommunityIcons
                name={item.status === 'needs_attention' ? 'alert' : 'check'}
                size={18}
                color={item.status === 'needs_attention' ? COLORS.error : COLORS.success}
              />
              <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 8 }}>
                <View style={cpStyles.wordRuleRow}>
                  <View style={[cpStyles.rulePill, { backgroundColor: (TAJWEED_RULES[item.rule]?.color || COLORS.primary) + '25' }]}>
                    <Text style={[cpStyles.rulePillText, { color: TAJWEED_RULES[item.rule]?.color || COLORS.primary }]}>
                      {TAJWEED_RULES[item.rule]?.name?.split(' ')[0] || item.rule}
                    </Text>
                  </View>
                  <Text style={[cpStyles.wordText, { color: activeColors.text }]}>{item.word}</Text>
                </View>
                {item.message && (
                  <Text style={[cpStyles.messageText, { color: COLORS.error }]}>{item.message}</Text>
                )}
                {item.status === 'ok' && (
                  <Text style={[cpStyles.messageText, { color: COLORS.success }]}>أحسنت! طُبِّق الحكم بشكل صحيح</Text>
                )}
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const cpStyles = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: SIZES.md, marginTop: SIZES.md, ...SHADOWS.small },
  scoreRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  scoreText: { fontSize: SIZES.fontSm + 1, fontWeight: 'bold' },
  feedbackText: { fontSize: SIZES.fontXs, marginTop: 3, textAlign: 'right', lineHeight: 18 },
  divider: { height: 1, marginVertical: 12 },
  sectionTitle: { fontSize: SIZES.fontSm, fontWeight: 'bold', textAlign: 'right', marginBottom: 8 },
  correctionRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', padding: 8, borderWidth: 1, borderRadius: 10, marginBottom: 8 },
  wordRuleRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 4 },
  rulePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 },
  rulePillText: { fontSize: SIZES.fontXs - 2, fontWeight: 'bold' },
  wordText: { fontSize: SIZES.fontMd, fontWeight: 'bold' },
  messageText: { fontSize: SIZES.fontXs - 1, textAlign: 'right', lineHeight: 17 },
});

// ─── Quiz Mode Component ──────────────────────────────────────────────────────

function QuizCard({ quizItem, ruleId, ruleColor, themeMode, onNext }) {
  const activeColors = COLORS[themeMode];
  const [selected, setSelected] = useState(null);

  const handleSelect = (word) => {
    if (selected) return;
    setSelected(word);
  };

  const isAnswered = selected !== null;
  const isCorrect = selected === quizItem.answer;

  return (
    <View style={[qStyles.container, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
      <Text style={[qStyles.instruction, { color: activeColors.textSecondary }]}>
        حدّد الكلمة التي تحتوي على حكم{' '}
        <Text style={{ color: ruleColor, fontWeight: 'bold' }}>{TAJWEED_RULES[ruleId]?.name?.split(' ')[0]}</Text>
      </Text>

      <View style={[qStyles.ayahBox, { backgroundColor: activeColors.background, borderColor: activeColors.border }]}>
        <View style={qStyles.wordsRow}>
          {quizItem.words.map((word, idx) => {
            let bgColor = 'transparent';
            let borderColor = activeColors.border;
            if (isAnswered) {
              if (word === quizItem.answer) { bgColor = COLORS.success + '25'; borderColor = COLORS.success; }
              else if (word === selected) { bgColor = COLORS.error + '15'; borderColor = COLORS.error; }
            }
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelect(word)}
                style={[qStyles.wordBtn, { backgroundColor: bgColor, borderColor, borderWidth: 1.5 }]}
                disabled={isAnswered}
              >
                <Text style={[qStyles.wordText, { color: activeColors.text }]}>{word}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isAnswered && (
        <View style={[qStyles.resultBox, { backgroundColor: isCorrect ? COLORS.success + '15' : COLORS.error + '10' }]}>
          <MaterialCommunityIcons name={isCorrect ? 'check-circle' : 'close-circle'} size={22} color={isCorrect ? COLORS.success : COLORS.error} />
          <Text style={[qStyles.resultText, { color: isCorrect ? COLORS.success : COLORS.error }]}>
            {isCorrect ? 'أحسنت! إجابة صحيحة!' : `الإجابة الصحيحة: ${quizItem.answer}`}
          </Text>
        </View>
      )}

      {!isAnswered && (
        <Text style={[qStyles.hintText, { color: activeColors.textMuted || activeColors.textSecondary }]}>
          💡 {quizItem.hint}
        </Text>
      )}

      {isAnswered && (
        <TouchableOpacity style={[qStyles.nextBtn, { backgroundColor: ruleColor + '20', borderColor: ruleColor }]} onPress={onNext}>
          <Text style={[qStyles.nextBtnText, { color: ruleColor }]}>سؤال تالٍ ←</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const qStyles = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: SIZES.md, ...SHADOWS.small, marginBottom: SIZES.md },
  instruction: { fontSize: SIZES.fontXs + 1, textAlign: 'right', marginBottom: 12, lineHeight: 20 },
  ayahBox: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 12 },
  wordsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  wordBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, margin: 4 },
  wordText: { fontSize: SIZES.fontLg, fontWeight: 'bold' },
  resultBox: { flexDirection: 'row-reverse', alignItems: 'center', padding: 10, borderRadius: 10, marginBottom: 8 },
  resultText: { fontSize: SIZES.fontXs + 1, fontWeight: 'bold', marginRight: 8 },
  hintText: { fontSize: SIZES.fontXs, textAlign: 'right', fontStyle: 'italic' },
  nextBtn: { borderWidth: 1, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, alignSelf: 'flex-end', marginTop: 8 },
  nextBtnText: { fontWeight: 'bold', fontSize: SIZES.fontXs },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function TajweedSchoolScreen() {
  const { themeMode, apiKey, isOfflineGraderMode } = useContext(ProgressContext);
  const { startRecording, stopRecording, isRecording } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  const [activeRuleId, setActiveRuleId] = useState('qalqalah');
  const [activeTab, setActiveTab] = useState('learn'); // 'learn' | 'quiz' | 'practice'

  const demoSoundRef = useRef(null);
  const [demoPlayingUrl, setDemoPlayingUrl] = useState(null);

  const [practiceWord, setPracticeWord] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [correctionResult, setCorrectionResult] = useState(null);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const activeRule = RULES_DATA.find(r => r.id === activeRuleId);
  const ruleColor = TAJWEED_RULES[activeRuleId]?.color || COLORS.primary;

  const handleRuleChange = (ruleId) => {
    setActiveRuleId(ruleId);
    setActiveTab('learn');
    setCorrectionResult(null);
    setPracticeWord(null);
    setQuizIndex(0);
    setQuizScore({ correct: 0, total: 0 });
    stopDemo();
  };

  // ── Demo audio ──────────────────────────────────────────────────────────────

  const handlePlayDemo = async (url) => {
    if (demoPlayingUrl === url) { stopDemo(); return; }
    stopDemo();
    setDemoPlayingUrl(url);
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => { if (status.didJustFinish) setDemoPlayingUrl(null); }
      );
      demoSoundRef.current = sound;
    } catch (e) {
      setDemoPlayingUrl(null);
    }
  };

  const stopDemo = async () => {
    if (demoSoundRef.current) {
      try { await demoSoundRef.current.unloadAsync(); } catch (e) {}
      demoSoundRef.current = null;
    }
    setDemoPlayingUrl(null);
  };

  // ── Practice recording ──────────────────────────────────────────────────────

  const startPractice = async (word) => {
    setPracticeWord(word);
    setCorrectionResult(null);
    await startRecording();
  };

  const stopPractice = async () => {
    const uri = await stopRecording();
    if (!uri) return;

    setIsEvaluating(true);
    try {
      let result;
      const wordObjs = activeRule.examples.map(e => ({ text: e.text, rule: activeRuleId }));

      if (!isOfflineGraderMode && apiKey) {
        const transcribed = await transcribeAudio(uri, apiKey);
        result = analyzeTajweedCorrections(wordObjs, transcribed);
      } else {
        // Offline mock — build a result based on the active rule's example words
        const mockBase = getMockCorrection(practiceWord || activeRule.examples[0].text, Math.floor(Math.random() * 3));
        result = {
          ...mockBase,
          tajweedCorrections: wordObjs.map((w, i) => ({
            word: w.text,
            rule: w.rule,
            status: mockBase.score >= 85 ? 'ok' : i === 0 ? 'needs_attention' : 'ok',
            message: mockBase.score < 85 && i === 0
              ? `انتبه: ${TAJWEED_RULES[activeRuleId]?.description || ''}`
              : null,
          })),
        };
      }
      setCorrectionResult(result);
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التقييم. تأكد من مفتاح API أو فعّل وضع التصحيح دون إنترنت.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // ── Quiz ────────────────────────────────────────────────────────────────────

  const currentQuizItem = activeRule.quiz[quizIndex % activeRule.quiz.length];

  const handleQuizNext = () => {
    const next = quizIndex + 1;
    if (next >= activeRule.quiz.length) {
      setQuizIndex(0);
    } else {
      setQuizIndex(next);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      {/* Rule tabs */}
      <View style={[styles.categoryBar, { backgroundColor: activeColors.surface, borderBottomColor: activeColors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {RULES_DATA.map(rule => {
            const rc = TAJWEED_RULES[rule.id]?.color || COLORS.primary;
            const isActive = activeRuleId === rule.id;
            return (
              <TouchableOpacity
                key={rule.id}
                style={[styles.categoryTab, isActive && { borderBottomColor: rc, borderBottomWidth: 3 }]}
                onPress={() => handleRuleChange(rule.id)}
              >
                <Text style={[styles.categoryTabText, { color: isActive ? activeColors.text : activeColors.textSecondary }]}>
                  {TAJWEED_RULES[rule.id]?.name?.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Mode tabs */}
      <View style={[styles.modeBar, { backgroundColor: activeColors.surface, borderBottomColor: activeColors.border }]}>
        {[
          { id: 'learn', label: 'تعلّم', icon: 'book-open-page-variant' },
          { id: 'quiz',  label: 'اختبر نفسك', icon: 'help-circle' },
          { id: 'practice', label: 'تدرّب وسجّل', icon: 'microphone' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.modeTab, activeTab === tab.id && { backgroundColor: ruleColor + '20', borderColor: ruleColor, borderWidth: 1 }]}
            onPress={() => { setActiveTab(tab.id); setCorrectionResult(null); }}
          >
            <MaterialCommunityIcons name={tab.icon} size={16} color={activeTab === tab.id ? ruleColor : activeColors.textSecondary} />
            <Text style={[styles.modeTabText, { color: activeTab === tab.id ? ruleColor : activeColors.textSecondary }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── LEARN TAB ── */}
        {activeTab === 'learn' && (
          <View style={[styles.ruleCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.ruleDot, { backgroundColor: ruleColor }]} />
              <Text style={[styles.ruleName, { color: activeColors.text }]}>{activeRule.name}</Text>
            </View>

            <View style={[styles.lettersBox, { backgroundColor: themeMode === 'dark' ? 'rgba(13,148,136,0.07)' : '#F1F5F9', borderColor: activeColors.border }]}>
              <Text style={[styles.lettersLabel, { color: activeColors.textSecondary }]}>أحرف الحكم:</Text>
              <Text style={[styles.lettersText, { color: ruleColor }]}>{activeRule.letters}</Text>
            </View>

            <Text style={[styles.ruleDesc, { color: activeColors.textSecondary }]}>{activeRule.description}</Text>

            {activeRule.tip && (
              <View style={[styles.tipBox, { backgroundColor: ruleColor + '12', borderColor: ruleColor + '40' }]}>
                <MaterialCommunityIcons name="lightbulb-on" size={16} color={ruleColor} style={{ marginLeft: 8 }} />
                <Text style={[styles.tipText, { color: activeColors.text }]}>{activeRule.tip}</Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: activeColors.border }]} />
            <Text style={[styles.subTitle, { color: activeColors.text }]}>أمثلة توضيحية مسجلة:</Text>

            {activeRule.examples.map((ex, idx) => (
              <View key={idx} style={[styles.exampleRow, { borderBottomColor: activeColors.border }]}>
                <TouchableOpacity
                  style={[styles.playDemoBtn, { backgroundColor: demoPlayingUrl === ex.audioUrl ? ruleColor : ruleColor + '18' }]}
                  onPress={() => handlePlayDemo(ex.audioUrl)}
                >
                  <MaterialCommunityIcons
                    name={demoPlayingUrl === ex.audioUrl ? 'stop' : 'volume-high'}
                    size={20}
                    color={demoPlayingUrl === ex.audioUrl ? '#FFF' : ruleColor}
                  />
                </TouchableOpacity>
                <View style={styles.exampleTextInfo}>
                  <Text style={[styles.exampleQuranText, { color: themeMode === 'dark' ? TAJWEED_RULES[activeRuleId]?.darkColor : ruleColor }]}>
                    {ex.text}
                  </Text>
                  <Text style={[styles.transliterationText, { color: activeColors.textSecondary }]}>{ex.transliteration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── QUIZ TAB ── */}
        {activeTab === 'quiz' && (
          <>
            <View style={[styles.quizHeader, { backgroundColor: ruleColor + '15', borderColor: ruleColor + '40' }]}>
              <Text style={[styles.quizHeaderText, { color: ruleColor }]}>
                اختبر فهمك لحكم {TAJWEED_RULES[activeRuleId]?.name?.split(' ')[0]}
              </Text>
              <Text style={[styles.quizSubText, { color: activeColors.textSecondary }]}>
                اضغط على الكلمة التي يُطبَّق فيها الحكم
              </Text>
            </View>

            <QuizCard
              key={`${activeRuleId}-${quizIndex}`}
              quizItem={currentQuizItem}
              ruleId={activeRuleId}
              ruleColor={ruleColor}
              themeMode={themeMode}
              onNext={handleQuizNext}
            />
          </>
        )}

        {/* ── PRACTICE TAB ── */}
        {activeTab === 'practice' && (
          <>
            <View style={[styles.practiceCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
              <Text style={[styles.practiceTitle, { color: activeColors.text }]}>
                تدرّب على تطبيق: {TAJWEED_RULES[activeRuleId]?.name?.split(' ')[0]}
              </Text>
              <Text style={[styles.practiceSubtitle, { color: activeColors.textSecondary }]}>
                اختر كلمة ثم سجّل صوتك — سيتحقق التطبيق من تطبيق الحكم في تلاوتك
              </Text>

              <View style={styles.practiceWordsRow}>
                {activeRule.examples.map((ex, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.practiceWordBtn, { borderColor: ruleColor }, practiceWord === ex.text && { backgroundColor: ruleColor + '18' }]}
                    onPress={() => { setPracticeWord(ex.text); setCorrectionResult(null); }}
                  >
                    <Text style={[styles.practiceWordBtnText, { color: activeColors.text }]}>{ex.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {practiceWord && (
                <Text style={[styles.selectedWordLabel, { color: activeColors.textSecondary }]}>
                  الكلمة المختارة: <Text style={{ color: ruleColor, fontWeight: 'bold' }}>{practiceWord}</Text>
                </Text>
              )}

              {isRecording ? (
                <View style={styles.recordingSection}>
                  <ActivityIndicator color={COLORS.error} size="small" style={{ marginBottom: 6 }} />
                  <Text style={[styles.recordingHint, { color: COLORS.error }]}>جاري الاستماع...</Text>
                  <TouchableOpacity style={[styles.micStopBtn, { backgroundColor: COLORS.error }]} onPress={stopPractice}>
                    <MaterialCommunityIcons name="stop" size={18} color="#FFF" />
                    <Text style={styles.micStopText}>تحقق الآن</Text>
                  </TouchableOpacity>
                </View>
              ) : isEvaluating ? (
                <View style={styles.recordingSection}>
                  <ActivityIndicator color={ruleColor} size="small" style={{ marginBottom: 6 }} />
                  <Text style={[styles.recordingHint, { color: activeColors.text }]}>جاري تحليل أحكام التجويد...</Text>
                </View>
              ) : (
                <View style={styles.micPracticeRow}>
                  <TouchableOpacity onPress={() => startPractice(practiceWord || activeRule.examples[0].text)} disabled={!practiceWord}>
                    <LinearGradient
                      colors={practiceWord ? COLORS.primaryGradient : ['#94a3b8', '#94a3b8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.micPracticeBtn, SHADOWS.small]}
                    >
                      <MaterialCommunityIcons name="microphone" size={24} color="#FFF" />
                      <Text style={styles.micPracticeText}>
                        {practiceWord ? 'اضغط وانطق الكلمة' : 'اختر كلمة أولاً'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Correction result */}
            {correctionResult && (
              <CorrectionPanel result={correctionResult} ruleColor={ruleColor} themeMode={themeMode} />
            )}

            {/* API key hint */}
            {isOfflineGraderMode && (
              <View style={[styles.offlineNote, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}>
                <MaterialCommunityIcons name="information-outline" size={16} color={activeColors.textSecondary} />
                <Text style={[styles.offlineNoteText, { color: activeColors.textSecondary }]}>
                  وضع التقييم التجريبي مفعّل. لتحليل حقيقي، أضف مفتاح OpenAI في الإعدادات وعطّل الوضع التجريبي.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryBar: { borderBottomWidth: 1, ...SHADOWS.small },
  categoryScroll: { paddingHorizontal: SIZES.md, height: 48, alignItems: 'center', flexDirection: 'row-reverse' },
  categoryTab: { paddingHorizontal: SIZES.md, paddingVertical: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  categoryTabText: { fontSize: SIZES.fontXs + 1, fontWeight: 'bold' },
  modeBar: { flexDirection: 'row-reverse', borderBottomWidth: 1, paddingHorizontal: SIZES.sm, paddingVertical: 8 },
  modeTab: { flexDirection: 'row-reverse', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginHorizontal: 4 },
  modeTabText: { fontSize: SIZES.fontXs, fontWeight: 'bold', marginRight: 4 },
  scrollContent: { padding: SIZES.md },
  ruleCard: { borderRadius: 16, borderWidth: 1, padding: SIZES.md, ...SHADOWS.small, marginBottom: SIZES.lg },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: SIZES.md },
  ruleDot: { width: 14, height: 14, borderRadius: 7, marginLeft: 8 },
  ruleName: { fontSize: SIZES.fontMd, fontWeight: 'bold' },
  lettersBox: { borderRadius: 8, padding: SIZES.sm, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md, borderWidth: 1 },
  lettersLabel: { fontSize: SIZES.fontXs, fontWeight: 'bold' },
  lettersText: { fontSize: SIZES.fontSm, fontWeight: 'bold', flex: 1, textAlign: 'right', marginRight: 8 },
  ruleDesc: { fontSize: SIZES.fontXs + 1, lineHeight: 22, textAlign: 'right' },
  tipBox: { flexDirection: 'row-reverse', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 12 },
  tipText: { fontSize: SIZES.fontXs, flex: 1, textAlign: 'right', lineHeight: 18 },
  divider: { height: 1, marginVertical: 14 },
  subTitle: { fontSize: SIZES.fontSm, fontWeight: 'bold', textAlign: 'right', marginBottom: SIZES.sm },
  exampleRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  playDemoBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  exampleTextInfo: { alignItems: 'flex-end' },
  exampleQuranText: { fontSize: SIZES.fontLg, fontWeight: 'bold' },
  transliterationText: { fontSize: SIZES.fontXs - 2, marginTop: 2 },
  quizHeader: { borderRadius: 14, borderWidth: 1, padding: SIZES.md, marginBottom: SIZES.md },
  quizHeaderText: { fontSize: SIZES.fontSm + 1, fontWeight: 'bold', textAlign: 'right' },
  quizSubText: { fontSize: SIZES.fontXs, textAlign: 'right', marginTop: 4 },
  practiceCard: { borderRadius: 16, borderWidth: 1, padding: SIZES.md, ...SHADOWS.small },
  practiceTitle: { fontSize: SIZES.fontSm, fontWeight: 'bold', textAlign: 'right' },
  practiceSubtitle: { fontSize: SIZES.fontXs - 1, textAlign: 'right', marginTop: 4, marginBottom: SIZES.md, lineHeight: 18 },
  practiceWordsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', marginBottom: SIZES.sm },
  practiceWordBtn: { paddingVertical: 8, paddingHorizontal: 20, borderWidth: 1, borderRadius: 12, margin: 6 },
  practiceWordBtnText: { fontSize: SIZES.fontMd, fontWeight: 'bold' },
  selectedWordLabel: { fontSize: SIZES.fontXs, textAlign: 'center', marginBottom: SIZES.md },
  micPracticeRow: { alignItems: 'center', marginTop: 8 },
  micPracticeBtn: { flexDirection: 'row-reverse', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 24, alignItems: 'center', ...SHADOWS.small },
  micPracticeText: { color: '#FFF', fontSize: SIZES.fontXs + 1, fontWeight: 'bold', marginRight: 8 },
  recordingSection: { alignItems: 'center', paddingVertical: 8 },
  recordingHint: { fontSize: SIZES.fontXs, marginBottom: 8 },
  micStopBtn: { flexDirection: 'row-reverse', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignItems: 'center' },
  micStopText: { color: '#FFF', fontWeight: 'bold', fontSize: SIZES.fontXs, marginRight: 6 },
  offlineNote: { flexDirection: 'row-reverse', alignItems: 'flex-start', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: SIZES.md },
  offlineNoteText: { fontSize: SIZES.fontXs - 1, flex: 1, textAlign: 'right', marginRight: 8, lineHeight: 17 },
});
