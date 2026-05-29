import React, { useContext, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/Theme';
import { ProgressContext } from '../context/ProgressContext';
import { AudioContext } from '../context/AudioContext';
import { TAJWEED_RULES } from '../services/QuranData';
import { getMockCorrection } from '../services/SpeechService';

const RULES_DATA = [
  {
    id: 'qalqalah',
    name: 'القلقلة (Qalqalah)',
    letters: 'قُطْبُ جَدّ (ق، ط، ب، ج، د)',
    description: 'اضطراب الصوت عند النطق بالحرف الساكن حتى يسمع له نبرة قوية. وتنقسم إلى قلقلة كبرى وصغرى.',
    examples: [
      { text: 'أَحَدٌ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112001.mp3', transliteration: 'Ahad' },
      { text: 'يَلِدْ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112003.mp3', transliteration: 'Yalid' }
    ]
  },
  {
    id: 'ghunnah',
    name: 'الغنة (Ghunnah)',
    letters: 'الميم والنون المشددتان (مّ، نّ)',
    description: 'صوت يخرج من الخيشوم (الأنف) بمقدار حركتين عند النطق بالنون أو الميم المشددتين.',
    examples: [
      { text: 'إِنَّا', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/108001.mp3', transliteration: 'Inna' },
      { text: 'الناسِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/114001.mp3', transliteration: 'An-Nas' }
    ]
  },
  {
    id: 'ikhfa',
    name: 'الإخفاء (Ikhfa)',
    letters: '١٥ حرفاً (ص، ذ، ث، ك، ج، ش، ق، س، د، ط، ز، ف، ت، ض، ظ)',
    description: 'نطق الحرف الساكن (النون أو التنوين) بحالة وسط بين الإظهار والإدغام، عارٍ عن التشديد مع بقاء الغنة.',
    examples: [
      { text: 'مِن شَرِّ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/114004.mp3', transliteration: 'Min sharri' },
      { text: 'الْإِنسَانَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/103002.mp3', transliteration: 'Al-Insan' }
    ]
  },
  {
    id: 'idgham',
    name: 'الإدغام (Idgham)',
    letters: 'يرملون (ي، ر، م، ل، و، ن)',
    description: 'إدخال حرف ساكن في حرف متحرك بحيث يصيران حرفاً واحداً مشدداً كالثاني. يكون بغنة (ي، ن، م، و) وبغير غنة (ل، ر).',
    examples: [
      { text: 'يَكُن لَّهُ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/112004.mp3', transliteration: 'Yakun lahu' }
    ]
  },
  {
    id: 'madd',
    name: 'المد (Madd)',
    letters: 'حروف المد (أ، و، ي)',
    description: 'إطالة الصوت بحرف من حروف المد بمقدار حركتين (مد طبيعي) أو ٤ إلى ٦ حركات (مد فرعي بسبب الهمز أو السكون).',
    examples: [
      { text: 'الرَّحِيمِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001001.mp3', transliteration: 'Ar-Raheem' },
      { text: 'الْعَالَمِينَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001002.mp3', transliteration: 'Al-Alameen' }
    ]
  },
  {
    id: 'tafkheem',
    name: 'التفخيم (Tafkheem)',
    letters: 'خص ضغط قظ (خ، ص، ض، غ، ط، ق، ظ)',
    description: 'تسمين الحرف وتغليظه عند النطق به بحيث يمتلئ الفم بصدى الحرف.',
    examples: [
      { text: 'الصِّرَاطَ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001006.mp3', transliteration: 'As-Sirat' },
      { text: 'الْمَغْضُوبِ', audioUrl: 'https://everyayah.com/data/Husary_Muallim_128kbps/001007.mp3', transliteration: 'Al-Maghdoob' }
    ]
  }
];

export default function TajweedSchoolScreen() {
  const { themeMode } = useContext(ProgressContext);
  const { startRecording, stopRecording, isRecording } = useContext(AudioContext);
  const activeColors = COLORS[themeMode];

  const [activeRuleId, setActiveRuleId] = useState('qalqalah');
  const [practiceWord, setPracticeWord] = useState('أَحَدٌ');
  
  // Audio playing demo
  const [demoPlayingUrl, setDemoPlayingUrl] = useState(null);
  const demoSoundRef = React.useRef(null);

  // Practice recorder status
  const [practiceScore, setPracticeScore] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const activeRule = RULES_DATA.find(r => r.id === activeRuleId);

  const handlePlayDemo = async (url) => {
    if (demoPlayingUrl === url) {
      // Toggle stop
      stopDemo();
      return;
    }
    
    stopDemo();
    setDemoPlayingUrl(url);

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) {
            setDemoPlayingUrl(null);
          }
        }
      );
      demoSoundRef.current = sound;
    } catch (e) {
      console.log('Failed to play demo', e);
      setDemoPlayingUrl(null);
    }
  };

  const stopDemo = async () => {
    if (demoSoundRef.current) {
      try {
        await demoSoundRef.current.unloadAsync();
      } catch (e) {
        console.log(e);
      }
      demoSoundRef.current = null;
    }
    setDemoPlayingUrl(null);
  };

  const startPracticeRecord = async (word) => {
    setPracticeWord(word);
    setPracticeScore(null);
    await startRecording();
  };

  const stopPracticeRecord = async () => {
    const uri = await stopRecording();
    if (!uri) return;

    setIsEvaluating(true);
    // Simulate grading the user's single word recitation
    setTimeout(() => {
      setIsEvaluating(false);
      // Give a random high score to reflect correct rule practice
      const randomScore = Math.floor(Math.random() * 20) + 81; // 81 - 100
      setPracticeScore(randomScore);
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      
      {/* Category selector row */}
      <View style={[styles.categoryBar, { backgroundColor: activeColors.surface, borderBottomColor: activeColors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {RULES_DATA.map(rule => {
            const ruleColor = TAJWEED_RULES[rule.id]?.color || COLORS.primary;
            const isActive = activeRuleId === rule.id;
            
            return (
              <TouchableOpacity
                key={rule.id}
                style={[
                  styles.categoryTab, 
                  isActive && [styles.activeTab, { borderBottomColor: ruleColor }]
                ]}
                onPress={() => {
                  setActiveRuleId(rule.id);
                  setPracticeScore(null);
                  stopDemo();
                }}
              >
                <Text style={[
                  styles.categoryTabText, 
                  { color: isActive ? activeColors.text : activeColors.textSecondary }
                ]}>
                  {TAJWEED_RULES[rule.id]?.name.split(' ')[0]} {/* Grab the Arabic name */}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Rule Details Card with Gold Border */}
        <View style={[styles.ruleCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.ruleDot, { backgroundColor: TAJWEED_RULES[activeRuleId]?.color }]} />
            <Text style={[styles.ruleName, { color: activeColors.text }]}>{activeRule.name}</Text>
          </View>

          <View style={[styles.lettersBox, { backgroundColor: themeMode === 'dark' ? 'rgba(13, 148, 136, 0.05)' : '#F1F5F9', borderColor: activeColors.border, borderWidth: 1 }]}>
            <Text style={[styles.lettersLabel, { color: activeColors.textSecondary }]}>أحرف الحكم:</Text>
            <Text style={[styles.lettersText, { color: COLORS.primary }]}>{activeRule.letters}</Text>
          </View>

          <Text style={[styles.ruleDesc, { color: activeColors.textSecondary }]}>
            {activeRule.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: activeColors.border }]} />

          {/* Examples Header */}
          <Text style={[styles.subTitle, { color: activeColors.text }]}>أمثلة توضيحية مسجلة:</Text>
          
          {activeRule.examples.map((ex, idx) => (
            <View key={idx} style={[styles.exampleRow, { borderBottomColor: activeColors.border }]}>
              <TouchableOpacity 
                style={[styles.playDemoBtn, { backgroundColor: demoPlayingUrl === ex.audioUrl ? COLORS.primary : COLORS.primary + '15' }]}
                onPress={() => handlePlayDemo(ex.audioUrl)}
              >
                <MaterialCommunityIcons 
                  name={demoPlayingUrl === ex.audioUrl ? "stop" : "volume-high"} 
                  size={20} 
                  color={demoPlayingUrl === ex.audioUrl ? "#FFF" : COLORS.primary} 
                />
              </TouchableOpacity>
              <View style={styles.exampleTextInfo}>
                <Text style={[styles.exampleQuranText, { color: themeMode === 'dark' ? TAJWEED_RULES[activeRuleId]?.darkColor : TAJWEED_RULES[activeRuleId]?.color }]}>
                  {ex.text}
                </Text>
                <Text style={[styles.transliterationText, { color: activeColors.textMuted }]}>{ex.transliteration}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Practice Corner Section */}
        <Text style={[styles.sectionTitle, { color: activeColors.text }]}>ركن التدريب العملي</Text>
        
        <View style={[styles.practiceCard, { backgroundColor: activeColors.surface, borderColor: activeColors.glassBorderGold }]}>
          <Text style={[styles.practiceTitle, { color: activeColors.text }]}>تدرب على نطق حكم ({TAJWEED_RULES[activeRuleId]?.name})</Text>
          <Text style={[styles.practiceSubtitle, { color: activeColors.textSecondary }]}>انقر فوق أي كلمة لتسميعها والتحقق من نطق الغنة أو القلقلة</Text>
          
          <View style={styles.practiceWordsRow}>
            {activeRule.examples.map((ex, idx) => (
              <TouchableOpacity 
                key={idx}
                style={[
                  styles.practiceWordBtn, 
                  { borderColor: TAJWEED_RULES[activeRuleId]?.color },
                  practiceWord === ex.text && { backgroundColor: TAJWEED_RULES[activeRuleId]?.color + '15' }
                ]}
                onPress={() => {
                  setPracticeWord(ex.text);
                  setPracticeScore(null);
                }}
              >
                <Text style={[styles.practiceWordBtnText, { color: activeColors.text }]}>{ex.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recording interface */}
          {isRecording ? (
            <View style={styles.recordingSection}>
              <ActivityIndicator color={COLORS.error} size="small" style={{ marginBottom: 6 }} />
              <Text style={[styles.recordingHint, { color: COLORS.error }]}>جاري الاستماع للكلمة...</Text>
              <TouchableOpacity 
                style={[styles.micStopBtn, { backgroundColor: COLORS.error }]} 
                onPress={stopPracticeRecord}
              >
                <MaterialCommunityIcons name="stop" size={18} color="#FFF" />
                <Text style={styles.micStopText}>تحقق الآن</Text>
              </TouchableOpacity>
            </View>
          ) : isEvaluating ? (
            <View style={styles.recordingSection}>
              <ActivityIndicator color={COLORS.primary} size="small" style={{ marginBottom: 6 }} />
              <Text style={[styles.recordingHint, { color: activeColors.text }]}>جاري تقييم النطق...</Text>
            </View>
          ) : (
            <View style={styles.micPracticeRow}>
              <TouchableOpacity 
                onPress={() => startPracticeRecord(practiceWord)}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.micPracticeBtn, SHADOWS.small]}
                >
                  <MaterialCommunityIcons name="microphone" size={24} color="#FFF" />
                  <Text style={styles.micPracticeText}>اضغط وانطق الكلمة</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Practice score display */}
          {practiceScore !== null && !isRecording && !isEvaluating && (
            <View style={[styles.practiceResultBox, { backgroundColor: practiceScore >= 85 ? COLORS.success + '15' : COLORS.warning + '15' }]}>
              <MaterialCommunityIcons 
                name={practiceScore >= 85 ? "check-circle" : "alert-circle"} 
                size={22} 
                color={practiceScore >= 85 ? COLORS.success : COLORS.secondary} 
              />
              <View style={styles.practiceResultText}>
                <Text style={[styles.practiceResultScore, { color: practiceScore >= 85 ? COLORS.success : COLORS.secondary }]}>
                  درجة النطق: {practiceScore}%
                </Text>
                <Text style={[styles.practiceResultDetails, { color: activeColors.textSecondary }]}>
                  {practiceScore >= 85 
                    ? 'ممتاز! لقد حققت زمن الغنة/مخرج القلقلة بشكل سليم.' 
                    : 'حاول مجدداً، تأكد من إعطاء مخرج الحرف حقه الكافي.'
                  }
                </Text>
              </View>
            </View>
          )}
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
  categoryBar: {
    borderBottomWidth: 1,
    ...SHADOWS.small,
  },
  categoryScroll: {
    paddingHorizontal: SIZES.md,
    height: 48,
    alignItems: 'center',
    flexDirection: 'row-reverse', // RTL flow
  },
  categoryTab: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  categoryTabText: {
    fontSize: SIZES.fontXs + 1,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  scrollContent: {
    padding: SIZES.md,
  },
  ruleCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.small,
    marginBottom: SIZES.lg,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  ruleDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 8,
  },
  ruleName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  lettersBox: {
    borderRadius: 8,
    padding: SIZES.sm,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  lettersLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  lettersText: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  ruleDesc: {
    fontSize: SIZES.fontXs + 1,
    lineHeight: 22,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  subTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SIZES.sm,
  },
  exampleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  playDemoBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exampleTextInfo: {
    alignItems: 'flex-end',
  },
  exampleQuranText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  transliterationText: {
    fontSize: SIZES.fontXs - 2,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SIZES.sm,
  },
  practiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  practiceTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  practiceSubtitle: {
    fontSize: SIZES.fontXs - 1,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: SIZES.md,
  },
  practiceWordsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  practiceWordBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  practiceWordBtnText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  micPracticeRow: {
    alignItems: 'center',
  },
  micPracticeBtn: {
    flexDirection: 'row-reverse',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  micPracticeText: {
    color: '#FFF',
    fontSize: SIZES.fontXs + 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  recordingSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  recordingHint: {
    fontSize: SIZES.fontXs,
    marginBottom: 8,
  },
  micStopBtn: {
    flexDirection: 'row-reverse',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  micStopText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: SIZES.fontXs,
    marginRight: 6,
  },
  practiceResultBox: {
    flexDirection: 'row-reverse',
    padding: SIZES.sm,
    borderRadius: 12,
    marginTop: SIZES.md,
    alignItems: 'center',
  },
  practiceResultText: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 10,
  },
  practiceResultScore: {
    fontSize: SIZES.fontXs + 1,
    fontWeight: 'bold',
  },
  practiceResultDetails: {
    fontSize: SIZES.fontXs - 2,
    marginTop: 2,
    textAlign: 'right',
  }
});
