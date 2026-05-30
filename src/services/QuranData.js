import AsyncStorage from '@react-native-async-storage/async-storage';

export const QARIS = [
  { id: 'husary', name: 'Ø§Ù„Ø´ÙŠØ® Ø§Ù„Ø­ØµØ±ÙŠ (Ù…Ø¹Ù„Ù…)', englishName: 'Sheikh Al-Husary (Teacher)', folder: 'Husary_Muallim_128kbps' },
  { id: 'minshawi', name: 'Ø§Ù„Ø´ÙŠØ® Ø§Ù„Ù…Ù†Ø´Ø§ÙˆÙŠ (Ù…Ø¹Ù„Ù…)', englishName: 'Sheikh Al-Minshawi (Teacher)', folder: 'Minshawi_Muallim_128kbps' },
  { id: 'alafasy', name: 'Ø§Ù„Ø´ÙŠØ® Ù…Ø´Ø§Ø±ÙŠ Ø§Ù„Ø¹ÙØ§Ø³ÙŠ', englishName: 'Sheikh Mishary Alafasy', folder: 'Alafasy_128kbps' },
];

export const TAJWEED_RULES = {
  none: { name: 'Normal', color: '#FFFFFF', darkColor: '#E2E8F0', description: 'Standard pronunciation' },
  qalqalah: { name: 'Ù‚Ù„Ù‚Ù„Ø© (Qalqalah)', color: '#F59E0B', darkColor: '#FBBF24', description: 'Vibrating or echoing sound on letters (Ù‚ØŒ Ø·ØŒ Ø¨ØŒ Ø¬ØŒ Ø¯) when silent.' },
  ghunnah: { name: 'ØºÙ†Ø© (Ghunnah)', color: '#10B981', darkColor: '#34D399', description: 'Nasalization sound of 2 beats on Meem and Noon with Shaddah.' },
  ikhfa: { name: 'Ø¥Ø®ÙØ§Ø¡ (Ikhfa)', color: '#3B82F6', darkColor: '#60A5FA', description: 'Hiding the Noon Sakinah or Tanween when followed by specific letters.' },
  idgham: { name: 'Ø¥Ø¯ØºØ§Ù… (Idgham)', color: '#8B5CF6', darkColor: '#A78BFA', description: 'Merging Noon Sakinah or Tanween into the next letter with or without Ghunnah.' },
  iqlab: { name: 'Ø¥Ù‚Ù„Ø§Ø¨ (Iqlab)', color: '#EC4899', darkColor: '#F472B6', description: 'Converting Noon Sakinah or Tanween into a Meem when followed by Baa.' },
  izhar: { name: 'Ø¥Ø¸Ù‡Ø§Ø± (Izhar)', color: '#14B8A6', darkColor: '#2DD4BF', description: 'Clear pronunciation of Noon Sakinah or Tanween before the six throat letters.' },
  madd: { name: 'Ù…Ø¯ (Madd)', color: '#EF4444', darkColor: '#F87171', description: 'Prolongation of vowel sounds (Alif, Waw, Yaa) for 2 to 6 beats.' },
  tafkheem: { name: 'ØªÙØ®ÙŠÙ… (Tafkheem)', color: '#06B6D4', darkColor: '#22D3EE', description: 'Heavy/thick pronunciation of specific letters.' }
};

// Surah â†’ primary Juz mapping
export const SURAH_JUZ = {
  1:1,2:1,3:3,4:4,5:6,6:7,7:8,8:9,9:10,10:11,
  11:11,12:12,13:13,14:13,15:14,16:14,17:15,18:15,19:16,20:16,
  21:17,22:17,23:18,24:18,25:18,26:19,27:19,28:20,29:20,30:21,
  31:21,32:21,33:21,34:22,35:22,36:22,37:23,38:23,39:23,40:24,
  41:24,42:25,43:25,44:25,45:25,46:26,47:26,48:26,49:26,50:26,
  51:26,52:27,53:27,54:27,55:27,56:27,57:27,58:28,59:28,60:28,
  61:28,62:28,63:28,64:28,65:28,66:28,67:29,68:29,69:29,70:29,
  71:29,72:29,73:29,74:29,75:29,76:29,77:29,78:30,79:30,80:30,
  81:30,82:30,83:30,84:30,85:30,86:30,87:30,88:30,89:30,90:30,
  91:30,92:30,93:30,94:30,95:30,96:30,97:30,98:30,99:30,100:30,
  101:30,102:30,103:30,104:30,105:30,106:30,107:30,108:30,109:30,
  110:30,111:30,112:30,113:30,114:30
};

// Additional reciters
export const ALL_QARIS = [
  { id: 'husary',   name: 'Ø§Ù„Ø´ÙŠØ® Ù…Ø­Ù…ÙˆØ¯ Ø®Ù„ÙŠÙ„ Ø§Ù„Ø­ØµØ±ÙŠ',    subtitle: 'Ø±ÙˆØ§ÙŠØ© Ø­ÙØµ â€” Ù…Ø¹Ù„Ù… Ù…Ø±ØªÙ‘Ù„',  folder: 'Husary_Muallim_128kbps',   icon: 'account-music' },
  { id: 'minshawi', name: 'Ø§Ù„Ø´ÙŠØ® Ù…Ø­Ù…Ø¯ ØµØ¯ÙŠÙ‚ Ø§Ù„Ù…Ù†Ø´Ø§ÙˆÙŠ',   subtitle: 'Ø±ÙˆØ§ÙŠØ© Ø­ÙØµ â€” Ù…Ø¹Ù„Ù… Ù…Ø±ØªÙ‘Ù„',  folder: 'Minshawi_Muallim_128kbps', icon: 'account-music-outline' },
  { id: 'alafasy',  name: 'Ø§Ù„Ø´ÙŠØ® Ù…Ø´Ø§Ø±ÙŠ Ø¨Ù† Ø±Ø§Ø´Ø¯ Ø§Ù„Ø¹ÙØ§Ø³ÙŠ',subtitle: 'Ø±ÙˆØ§ÙŠØ© Ø­ÙØµ â€” ØªÙ„Ø§ÙˆØ© Ø¹Ø§Ø¯ÙŠØ©', folder: 'Alafasy_128kbps',           icon: 'microphone-variant' },
];

// 114 Surahs Metadata List
export const ALL_SURAHS = [
  { id: 1, name: 'Ø§Ù„ÙØ§ØªØ­Ø©', englishName: 'Al-Fatihah', englishTranslation: 'The Opening', totalAyahs: 7, type: 'Meccan' },
  { id: 2, name: 'Ø§Ù„Ø¨Ù‚Ø±Ø©', englishName: 'Al-Baqarah', englishTranslation: 'The Cow', totalAyahs: 286, type: 'Medinan' },
  { id: 3, name: 'Ø¢Ù„ Ø¹Ù…Ø±Ø§Ù†', englishName: 'Ali \'Imran', englishTranslation: 'Family of Imran', totalAyahs: 200, type: 'Medinan' },
  { id: 4, name: 'Ø§Ù„Ù†Ø³Ø§Ø¡', englishName: 'An-Nisa', englishTranslation: 'The Women', totalAyahs: 176, type: 'Medinan' },
  { id: 5, name: 'Ø§Ù„Ù…Ø§Ø¦Ø¯Ø©', englishName: 'Al-Ma\'idah', englishTranslation: 'The Table Spread', totalAyahs: 120, type: 'Medinan' },
  { id: 6, name: 'Ø§Ù„Ø£Ù†Ø¹Ø§Ù…', englishName: 'Al-An\'am', englishTranslation: 'The Cattle', totalAyahs: 165, type: 'Meccan' },
  { id: 7, name: 'Ø§Ù„Ø£Ø¹Ø±Ø§Ù', englishName: 'Al-A\'raf', englishTranslation: 'The Heights', totalAyahs: 206, type: 'Meccan' },
  { id: 8, name: 'Ø§Ù„Ø£Ù†ÙØ§Ù„', englishName: 'Al-Anfal', englishTranslation: 'The Spoils of War', totalAyahs: 75, type: 'Medinan' },
  { id: 9, name: 'Ø§Ù„ØªÙˆØ¨Ø©', englishName: 'At-Tawbah', englishTranslation: 'The Repentance', totalAyahs: 129, type: 'Medinan' },
  { id: 10, name: 'ÙŠÙˆÙ†Ø³', englishName: 'Yunus', englishTranslation: 'Jonah', totalAyahs: 109, type: 'Meccan' },
  { id: 11, name: 'Ù‡ÙˆØ¯', englishName: 'Hud', englishTranslation: 'Hud', totalAyahs: 123, type: 'Meccan' },
  { id: 12, name: 'ÙŠÙˆØ³Ù', englishName: 'Yusuf', englishTranslation: 'Joseph', totalAyahs: 111, type: 'Meccan' },
  { id: 13, name: 'Ø§Ù„Ø±Ø¹Ø¯', englishName: 'Ar-Ra\'d', englishTranslation: 'The Thunder', totalAyahs: 43, type: 'Medinan' },
  { id: 14, name: 'Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ…', englishName: 'Ibrahim', englishTranslation: 'Abraham', totalAyahs: 52, type: 'Meccan' },
  { id: 15, name: 'Ø§Ù„Ø­Ø¬Ø±', englishName: 'Al-Hijr', englishTranslation: 'The Rocky Tract', totalAyahs: 99, type: 'Meccan' },
  { id: 16, name: 'Ø§Ù„Ù†Ø­Ù„', englishName: 'An-Nahl', englishTranslation: 'The Bee', totalAyahs: 128, type: 'Meccan' },
  { id: 17, name: 'Ø§Ù„Ø¥Ø³Ø±Ø§Ø¡', englishName: 'Al-Isra', englishTranslation: 'The Night Journey', totalAyahs: 111, type: 'Meccan' },
  { id: 18, name: 'Ø§Ù„ÙƒÙ‡Ù', englishName: 'Al-Kahf', englishTranslation: 'The Cave', totalAyahs: 110, type: 'Meccan' },
  { id: 19, name: 'Ù…Ø±ÙŠÙ…', englishName: 'Maryam', englishTranslation: 'Mary', totalAyahs: 98, type: 'Meccan' },
  { id: 20, name: 'Ø·Ù‡', englishName: 'Taha', englishTranslation: 'Ta-Ha', totalAyahs: 135, type: 'Meccan' },
  { id: 21, name: 'Ø§Ù„Ø£Ù†Ø¨ÙŠØ§Ø¡', englishName: 'Al-Anbiya', englishTranslation: 'The Prophets', totalAyahs: 112, type: 'Meccan' },
  { id: 22, name: 'Ø§Ù„Ø­Ø¬', englishName: 'Al-Hajj', englishTranslation: 'The Pilgrimage', totalAyahs: 78, type: 'Medinan' },
  { id: 23, name: 'Ø§Ù„Ù…Ø¤Ù…Ù†ÙˆÙ†', englishName: 'Al-Mu\'minun', englishTranslation: 'The Believers', totalAyahs: 118, type: 'Meccan' },
  { id: 24, name: 'Ø§Ù„Ù†ÙˆØ±', englishName: 'An-Nur', englishTranslation: 'The Light', totalAyahs: 64, type: 'Medinan' },
  { id: 25, name: 'Ø§Ù„ÙØ±Ù‚Ø§Ù†', englishName: 'Al-Furqan', englishTranslation: 'The Criterion', totalAyahs: 77, type: 'Meccan' },
  { id: 26, name: 'Ø§Ù„Ø´Ø¹Ø±Ø§Ø¡', englishName: 'Ash-Shu\'ara', englishTranslation: 'The Poets', totalAyahs: 227, type: 'Meccan' },
  { id: 27, name: 'Ø§Ù„Ù†Ù…Ù„', englishName: 'An-Naml', englishTranslation: 'The Ant', totalAyahs: 93, type: 'Meccan' },
  { id: 28, name: 'Ø§Ù„Ù‚ØµØµ', englishName: 'Al-Qasas', englishTranslation: 'The Stories', totalAyahs: 88, type: 'Meccan' },
  { id: 29, name: 'Ø§Ù„Ø¹Ù†ÙƒØ¨ÙˆØª', englishName: 'Al-Ankabut', englishTranslation: 'The Spider', totalAyahs: 69, type: 'Meccan' },
  { id: 30, name: 'Ø§Ù„Ø±ÙˆÙ…', englishName: 'Ar-Rum', englishTranslation: 'The Romans', totalAyahs: 60, type: 'Meccan' },
  { id: 31, name: 'Ù„Ù‚Ù…Ø§Ù†', englishName: 'Luqman', englishTranslation: 'Luqman', totalAyahs: 34, type: 'Meccan' },
  { id: 32, name: 'Ø§Ù„Ø³Ø¬Ø¯Ø©', englishName: 'As-Sajdah', englishTranslation: 'The Prostration', totalAyahs: 30, type: 'Meccan' },
  { id: 33, name: 'Ø§Ù„Ø£Ø­Ø²Ø§Ø¨', englishName: 'Al-Ahzab', englishTranslation: 'The Combined Forces', totalAyahs: 73, type: 'Medinan' },
  { id: 34, name: 'Ø³Ø¨Ø£', englishName: 'Saba', englishTranslation: 'Sheba', totalAyahs: 54, type: 'Meccan' },
  { id: 35, name: 'ÙØ§Ø·Ø±', englishName: 'Fatir', englishTranslation: 'Originator', totalAyahs: 45, type: 'Meccan' },
  { id: 36, name: 'ÙŠØ³', englishName: 'Ya-Sin', englishTranslation: 'Ya Sin', totalAyahs: 83, type: 'Meccan' },
  { id: 37, name: 'Ø§Ù„ØµØ§ÙØ§Øª', englishName: 'As-Saffat', englishTranslation: 'Those who set the Ranks', totalAyahs: 182, type: 'Meccan' },
  { id: 38, name: 'Øµ', englishName: 'Sad', englishTranslation: 'The Letter Sad', totalAyahs: 88, type: 'Meccan' },
  { id: 39, name: 'Ø§Ù„Ø²Ù…Ø±', englishName: 'Az-Zumar', englishTranslation: 'The Troops', totalAyahs: 75, type: 'Meccan' },
  { id: 40, name: 'ØºØ§ÙØ±', englishName: 'Ghafir', englishTranslation: 'The Forgiver', totalAyahs: 85, type: 'Meccan' },
  { id: 41, name: 'ÙØµÙ„Øª', englishName: 'Fussilat', englishTranslation: 'Explained in Detail', totalAyahs: 54, type: 'Meccan' },
  { id: 42, name: 'Ø§Ù„Ø´ÙˆØ±Ù‰', englishName: 'Ash-Shura', englishTranslation: 'The Consultation', totalAyahs: 53, type: 'Meccan' },
  { id: 43, name: 'Ø§Ù„Ø²Ø®Ø±Ù', englishName: 'Az-Zukhruf', englishTranslation: 'The Ornaments of Gold', totalAyahs: 89, type: 'Meccan' },
  { id: 44, name: 'Ø§Ù„Ø¯Ø®Ø§Ù†', englishName: 'Ad-Dukhan', englishTranslation: 'The Smoke', totalAyahs: 59, type: 'Meccan' },
  { id: 45, name: 'Ø§Ù„Ø¬Ø§Ø«ÙŠØ©', englishName: 'Al-Jathiyah', englishTranslation: 'The Crouching', totalAyahs: 37, type: 'Meccan' },
  { id: 46, name: 'Ø§Ù„Ø£Ø­Ù‚Ø§Ù', englishName: 'Al-Ahqaf', englishTranslation: 'The Wind-Curved Sandhills', totalAyahs: 35, type: 'Meccan' },
  { id: 47, name: 'Ù…Ø­Ù…Ø¯', englishName: 'Muhammad', englishTranslation: 'Muhammad', totalAyahs: 38, type: 'Medinan' },
  { id: 48, name: 'Ø§Ù„ÙØªØ­', englishName: 'Al-Fath', englishTranslation: 'The Victory', totalAyahs: 29, type: 'Medinan' },
  { id: 49, name: 'Ø§Ù„Ø­Ø¬Ø±Ø§Øª', englishName: 'Al-Hujurat', englishTranslation: 'The Rooms', totalAyahs: 18, type: 'Medinan' },
  { id: 50, name: 'Ù‚', englishName: 'Qaf', englishTranslation: 'The Letter Qaf', totalAyahs: 45, type: 'Meccan' },
  { id: 51, name: 'Ø§Ù„Ø°Ø§Ø±ÙŠØ§Øª', englishName: 'Adh-Dhariyat', englishTranslation: 'The Winnowing Winds', totalAyahs: 60, type: 'Meccan' },
  { id: 52, name: 'Ø§Ù„Ø·ÙˆØ±', englishName: 'At-Tur', englishTranslation: 'The Mount', totalAyahs: 49, type: 'Meccan' },
  { id: 53, name: 'Ø§Ù„Ù†Ø¬Ù…', englishName: 'An-Najm', englishTranslation: 'The Star', totalAyahs: 62, type: 'Meccan' },
  { id: 54, name: 'Ø§Ù„Ù‚Ù…Ø±', englishName: 'Al-Qamar', englishTranslation: 'The Moon', totalAyahs: 55, type: 'Meccan' },
  { id: 55, name: 'Ø§Ù„Ø±Ø­Ù…Ù†', englishName: 'Ar-Rahman', englishTranslation: 'The Beneficent', totalAyahs: 78, type: 'Medinan' },
  { id: 56, name: 'Ø§Ù„ÙˆØ§Ù‚Ø¹Ø©', englishName: 'Al-Waqi\'ah', englishTranslation: 'The Inevitable', totalAyahs: 96, type: 'Meccan' },
  { id: 57, name: 'Ø§Ù„Ø­Ø¯ÙŠØ¯', englishName: 'Al-Hadid', englishTranslation: 'The Iron', totalAyahs: 29, type: 'Medinan' },
  { id: 58, name: 'Ø§Ù„Ù…Ø¬Ø§Ø¯Ù„Ø©', englishName: 'Al-Mujadilah', englishTranslation: 'The Pleading Woman', totalAyahs: 22, type: 'Medinan' },
  { id: 59, name: 'Ø§Ù„Ø­Ø´Ø±', englishName: 'Al-Hashr', englishTranslation: 'The Exile', totalAyahs: 24, type: 'Medinan' },
  { id: 60, name: 'Ø§Ù„Ù…Ù…ØªØ­Ù†Ø©', englishName: 'Al-Mumtahanah', englishTranslation: 'She that is to be examined', totalAyahs: 13, type: 'Medinan' },
  { id: 61, name: 'Ø§Ù„ØµÙ', englishName: 'As-Saff', englishTranslation: 'The Ranks', totalAyahs: 14, type: 'Medinan' },
  { id: 62, name: 'Ø§Ù„Ø¬Ù…Ø¹Ø©', englishName: 'Al-Jumu\'ah', englishTranslation: 'The Congregation', totalAyahs: 11, type: 'Medinan' },
  { id: 63, name: 'Ø§Ù„Ù…Ù†Ø§ÙÙ‚ÙˆÙ†', englishName: 'Al-Munafiqun', englishTranslation: 'The Hypocrites', totalAyahs: 11, type: 'Medinan' },
  { id: 64, name: 'Ø§Ù„ØªØºØ§Ø¨Ù†', englishName: 'At-Taghabun', englishTranslation: 'Mutual Disillusion', totalAyahs: 18, type: 'Medinan' },
  { id: 65, name: 'Ø§Ù„Ø·Ù„Ø§Ù‚', englishName: 'At-Talaq', englishTranslation: 'The Divorce', totalAyahs: 12, type: 'Medinan' },
  { id: 66, name: 'Ø§Ù„ØªØ­Ø±ÙŠÙ…', englishName: 'At-Tahrim', englishTranslation: 'The Banning', totalAyahs: 12, type: 'Medinan' },
  { id: 67, name: 'Ø§Ù„Ù…Ù„Ùƒ', englishName: 'Al-Mulk', englishTranslation: 'The Sovereignty', totalAyahs: 30, type: 'Meccan' },
  { id: 68, name: 'Ø§Ù„Ù‚Ù„Ù…', englishName: 'Al-Qalam', englishTranslation: 'The Pen', totalAyahs: 52, type: 'Meccan' },
  { id: 69, name: 'Ø§Ù„Ø­Ø§Ù‚Ø©', englishName: 'Al-Haqqah', englishTranslation: 'The Reality', totalAyahs: 52, type: 'Meccan' },
  { id: 70, name: 'Ø§Ù„Ù…Ø¹Ø§Ø±Ø¬', englishName: 'Al-Ma\'arij', englishTranslation: 'The Ascending Stairways', totalAyahs: 44, type: 'Meccan' },
  { id: 71, name: 'Ù†ÙˆØ­', englishName: 'Nuh', englishTranslation: 'Noah', totalAyahs: 28, type: 'Meccan' },
  { id: 72, name: 'Ø§Ù„Ø¬Ù†', englishName: 'Al-Jinn', englishTranslation: 'The Jinn', totalAyahs: 28, type: 'Meccan' },
  { id: 73, name: 'Ø§Ù„Ù…Ø²Ù…Ù„', englishName: 'Al-Muzzammil', englishTranslation: 'The Enshrouded One', totalAyahs: 20, type: 'Meccan' },
  { id: 74, name: 'Ø§Ù„Ù…Ø¯Ø«Ø±', englishName: 'Al-Muddaththir', englishTranslation: 'The Cloaked One', totalAyahs: 56, type: 'Meccan' },
  { id: 75, name: 'Ø§Ù„Ù‚ÙŠØ§Ù…Ø©', englishName: 'Al-Qiyamah', englishTranslation: 'The Rising of the Dead', totalAyahs: 40, type: 'Meccan' },
  { id: 76, name: 'Ø§Ù„Ø¥Ù†Ø³Ø§Ù†', englishName: 'Al-Insan', englishTranslation: 'Man', totalAyahs: 31, type: 'Medinan' },
  { id: 77, name: 'Ø§Ù„Ù…Ø±Ø³Ù„Ø§Øª', englishName: 'Al-Mursalat', englishTranslation: 'The Emissaries', totalAyahs: 50, type: 'Meccan' },
  { id: 78, name: 'Ø§Ù„Ù†Ø¨Ø£', englishName: 'An-Naba', englishTranslation: 'The Tidings', totalAyahs: 40, type: 'Meccan' },
  { id: 79, name: 'Ø§Ù„Ù†Ø§Ø²Ø¹Ø§Øª', englishName: 'An-Nazi\'at', englishTranslation: 'Those who drag forth', totalAyahs: 46, type: 'Meccan' },
  { id: 80, name: 'Ø¹Ø¨Ø³', englishName: 'Abasa', englishTranslation: 'He Frowned', totalAyahs: 42, type: 'Meccan' },
  { id: 81, name: 'Ø§Ù„ØªÙƒÙˆÙŠØ±', englishName: 'At-Takwir', englishTranslation: 'The Overthrowing', totalAyahs: 29, type: 'Meccan' },
  { id: 82, name: 'Ø§Ù„Ø§Ù†ÙØ·Ø§Ø±', englishName: 'Al-Infitar', englishTranslation: 'The Cleaving', totalAyahs: 19, type: 'Meccan' },
  { id: 83, name: 'Ø§Ù„Ù…Ø·ÙÙÙŠÙ†', englishName: 'Al-Mutaffifin', englishTranslation: 'Defrauding', totalAyahs: 36, type: 'Meccan' },
  { id: 84, name: 'Ø§Ù„Ø§Ù†Ø´Ù‚Ø§Ù‚', englishName: 'Al-Inshiqaq', englishTranslation: 'The Sundering', totalAyahs: 25, type: 'Meccan' },
  { id: 85, name: 'Ø§Ù„Ø¨Ø±ÙˆØ¬', englishName: 'Al-Buruj', englishTranslation: 'The Mansions of the Stars', totalAyahs: 22, type: 'Meccan' },
  { id: 86, name: 'Ø§Ù„Ø·Ø§Ø±Ù‚', englishName: 'At-Tariq', englishTranslation: 'The Morning Star', totalAyahs: 17, type: 'Meccan' },
  { id: 87, name: 'Ø§Ù„Ø£Ø¹Ù„Ù‰', englishName: 'Al-A\'la', englishTranslation: 'The Most High', totalAyahs: 19, type: 'Meccan' },
  { id: 88, name: 'Ø§Ù„ØºØ§Ø´ÙŠØ©', englishName: 'Al-Ghashiyah', englishTranslation: 'The Overwhelming', totalAyahs: 26, type: 'Meccan' },
  { id: 89, name: 'Ø§Ù„ÙØ¬Ø±', englishName: 'Al-Fajr', englishTranslation: 'The Dawn', totalAyahs: 30, type: 'Meccan' },
  { id: 90, name: 'Ø§Ù„Ø¨Ù„Ø¯', englishName: 'Al-Balad', englishTranslation: 'The City', totalAyahs: 20, type: 'Meccan' },
  { id: 91, name: 'Ø§Ù„Ø´Ù…Ø³', englishName: 'Ash-Shams', englishTranslation: 'The Sun', totalAyahs: 15, type: 'Meccan' },
  { id: 92, name: 'Ø§Ù„Ù„ÙŠÙ„', englishName: 'Al-Layl', englishTranslation: 'The Night', totalAyahs: 21, type: 'Meccan' },
  { id: 93, name: 'Ø§Ù„Ø¶Ø­Ù‰', englishName: 'Ad-Duha', englishTranslation: 'The Morning Hours', totalAyahs: 11, type: 'Meccan' },
  { id: 94, name: 'Ø§Ù„Ø´Ø±Ø­', englishName: 'Ash-Sharh', englishTranslation: 'The Consolation', totalAyahs: 8, type: 'Meccan' },
  { id: 95, name: 'Ø§Ù„ØªÙŠÙ†', englishName: 'At-Tin', englishTranslation: 'The Fig', totalAyahs: 8, type: 'Meccan' },
  { id: 96, name: 'Ø§Ù„Ø¹Ù„Ù‚', englishName: 'Al-Alaq', englishTranslation: 'The Clot', totalAyahs: 19, type: 'Meccan' },
  { id: 97, name: 'Ø§Ù„Ù‚Ø¯Ø±', englishName: 'Al-Qadr', englishTranslation: 'The Power', totalAyahs: 5, type: 'Meccan' },
  { id: 98, name: 'Ø§Ù„Ø¨ÙŠÙ†Ø©', englishName: 'Al-Bayyinah', englishTranslation: 'The Clear Proof', totalAyahs: 8, type: 'Medinan' },
  { id: 99, name: 'Ø§Ù„Ø²Ù„Ø²Ù„Ø©', englishName: 'Az-Zalzalah', englishTranslation: 'The Earthquake', totalAyahs: 8, type: 'Medinan' },
  { id: 100, name: 'Ø§Ù„Ø¹Ø§Ø¯ÙŠØ§Øª', englishName: 'Al-Adiyat', englishTranslation: 'The Chargers', totalAyahs: 11, type: 'Meccan' },
  { id: 101, name: 'Ø§Ù„Ù‚Ø§Ø±Ø¹Ø©', englishName: 'Al-Qari\'ah', englishTranslation: 'The Calamity', totalAyahs: 11, type: 'Meccan' },
  { id: 102, name: 'Ø§Ù„ØªÙƒØ§Ø«Ø±', englishName: 'At-Takathur', englishTranslation: 'Competition in Increase', totalAyahs: 8, type: 'Meccan' },
  { id: 103, name: 'Ø§Ù„Ø¹ØµØ±', englishName: 'Al-Asr', englishTranslation: 'The Declining Day', totalAyahs: 3, type: 'Meccan' },
  { id: 104, name: 'Ø§Ù„Ù‡Ù…Ø²Ø©', englishName: 'Al-Humazah', englishTranslation: 'The Slanderer', totalAyahs: 9, type: 'Meccan' },
  { id: 105, name: 'Ø§Ù„ÙÙŠÙ„', englishName: 'Al-Fil', englishTranslation: 'The Elephant', totalAyahs: 5, type: 'Meccan' },
  { id: 106, name: 'Ù‚Ø±ÙŠØ´', englishName: 'Quraysh', englishTranslation: 'Quraysh', totalAyahs: 4, type: 'Meccan' },
  { id: 107, name: 'Ø§Ù„Ù…Ø§Ø¹ÙˆÙ†', englishName: 'Al-Ma\'un', englishTranslation: 'Neighborly Assistance', totalAyahs: 7, type: 'Meccan' },
  { id: 108, name: 'Ø§Ù„ÙƒÙˆØ«Ø±', englishName: 'Al-Kawthar', englishTranslation: 'The Abundance', totalAyahs: 3, type: 'Meccan' },
  { id: 109, name: 'Ø§Ù„ÙƒØ§ÙØ±ÙˆÙ†', englishName: 'Al-Kafirun', englishTranslation: 'The Disbelievers', totalAyahs: 6, type: 'Meccan' },
  { id: 110, name: 'Ø§Ù„Ù†ØµØ±', englishName: 'An-Nasr', englishTranslation: 'Divine Support', totalAyahs: 3, type: 'Medinan' },
  { id: 111, name: 'Ø§Ù„Ù…Ø³Ø¯', englishName: 'Al-Masad', englishTranslation: 'Palm Fibre', totalAyahs: 5, type: 'Meccan' },
  { id: 112, name: 'Ø§Ù„Ø¥Ø®Ù„Ø§Øµ', englishName: 'Al-Ikhlas', englishTranslation: 'The Sincerity', totalAyahs: 4, type: 'Meccan' },
  { id: 113, name: 'Ø§Ù„ÙÙ„Ù‚', englishName: 'Al-Falaq', englishTranslation: 'The Daybreak', totalAyahs: 5, type: 'Meccan' },
  { id: 114, name: 'Ø§Ù„Ù†Ø§Ø³', englishName: 'An-Nas', englishTranslation: 'Mankind', totalAyahs: 6, type: 'Meccan' }
];

// High-fidelity preloaded sample surahs (1, 103, 108, 112, 114)
export const SAMPLE_SURAHS = [
  {
    id: 1,
    name: 'Ø§Ù„ÙØ§ØªØ­Ø©',
    englishName: 'Al-Fatihah',
    englishTranslation: 'The Opening',
    totalAyahs: 7,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "Ø¨ÙØ³Ù’Ù…Ù Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù Ø§Ù„Ø±Ù‘ÙŽØ­Ù’Ù…ÙŽÙ°Ù†Ù Ø§Ù„Ø±Ù‘ÙŽØ­ÙÙŠÙ…Ù",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        words: [
          { text: "Ø¨ÙØ³Ù’Ù…Ù", rule: "none" },
          { text: "Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù", rule: "none" },
          { text: "Ø§Ù„Ø±Ù‘ÙŽØ­Ù’Ù…ÙŽÙ°Ù†Ù", rule: "none" },
          { text: "Ø§Ù„Ø±Ù‘ÙŽØ­ÙÙŠÙ…Ù", rule: "madd" }
        ]
      },
      {
        number: 2,
        text: "Ø§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù Ù„ÙÙ„Ù‘ÙŽÙ‡Ù Ø±ÙŽØ¨Ù‘Ù Ø§Ù„Ù’Ø¹ÙŽØ§Ù„ÙŽÙ…ÙÙŠÙ†ÙŽ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
        words: [
          { text: "Ø§Ù„Ù’Ø­ÙŽÙ…Ù’Ø¯Ù", rule: "none" },
          { text: "Ù„ÙÙ„Ù‘ÙŽÙ‡Ù", rule: "none" },
          { text: "Ø±ÙŽØ¨Ù‘Ù", rule: "none" },
          { text: "Ø§Ù„Ù’Ø¹ÙŽØ§Ù„ÙŽÙ…ÙÙŠÙ†ÙŽ", rule: "madd" }
        ]
      },
      {
        number: 3,
        text: "Ø§Ù„Ø±Ù‘ÙŽØ­Ù’Ù…ÙŽÙ°Ù†Ù Ø§Ù„Ø±Ù‘ÙŽØ­ÙÙŠÙ…Ù",
        translation: "The Entirely Merciful, the Especially Merciful,",
        words: [
          { text: "Ø§Ù„Ø±Ù‘ÙŽØ­Ù’Ù…ÙŽÙ°Ù†Ù", rule: "none" },
          { text: "Ø§Ù„Ø±Ù‘ÙŽØ­ÙÙŠÙ…Ù", rule: "madd" }
        ]
      },
      {
        number: 4,
        text: "Ù…ÙŽØ§Ù„ÙÙƒÙ ÙŠÙŽÙˆÙ’Ù…Ù Ø§Ù„Ø¯Ù‘ÙÙŠÙ†Ù",
        translation: "Sovereign of the Day of Recompense.",
        words: [
          { text: "Ù…ÙŽØ§Ù„ÙÙƒÙ", rule: "none" },
          { text: "ÙŠÙŽÙˆÙ’Ù…Ù", rule: "none" },
          { text: "Ø§Ù„Ø¯Ù‘ÙÙŠÙ†Ù", rule: "madd" }
        ]
      },
      {
        number: 5,
        text: "Ø¥ÙÙŠÙ‘ÙŽØ§ÙƒÙŽ Ù†ÙŽØ¹Ù’Ø¨ÙØ¯Ù ÙˆÙŽØ¥ÙÙŠÙ‘ÙŽØ§ÙƒÙŽ Ù†ÙŽØ³Ù’ØªÙŽØ¹ÙÙŠÙ†Ù",
        translation: "It is You we worship and You we ask for help.",
        words: [
          { text: "Ø¥ÙÙŠÙ‘ÙŽØ§ÙƒÙŽ", rule: "none" },
          { text: "Ù†ÙŽØ¹Ù’Ø¨ÙØ¯Ù", rule: "none" },
          { text: "ÙˆÙŽØ¥ÙÙŠÙ‘ÙŽØ§ÙƒÙŽ", rule: "none" },
          { text: "Ù†ÙŽØ³Ù’ØªÙŽØ¹ÙÙŠÙ†Ù", rule: "madd" }
        ]
      },
      {
        number: 6,
        text: "Ø§Ù‡Ù’Ø¯ÙÙ†ÙŽØ§ Ø§Ù„ØµÙ‘ÙØ±ÙŽØ§Ø·ÙŽ Ø§Ù„Ù’Ù…ÙØ³Ù’ØªÙŽÙ‚ÙÙŠÙ…ÙŽ",
        translation: "Guide us to the straight path -",
        words: [
          { text: "Ø§Ù‡Ù’Ø¯ÙÙ†ÙŽØ§", rule: "none" },
          { text: "Ø§Ù„ØµÙ‘ÙØ±ÙŽØ§Ø·ÙŽ", rule: "tafkheem" },
          { text: "Ø§Ù„Ù’Ù…ÙØ³Ù’ØªÙŽÙ‚ÙÙŠÙ…ÙŽ", rule: "madd" }
        ]
      },
      {
        number: 7,
        text: "ØµÙØ±ÙŽØ§Ø·ÙŽ Ø§Ù„Ù‘ÙŽØ°ÙÙŠÙ†ÙŽ Ø£ÙŽÙ†Ù’Ø¹ÙŽÙ…Ù’ØªÙŽ Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡ÙÙ…Ù’ ØºÙŽÙŠÙ’Ø±Ù Ø§Ù„Ù’Ù…ÙŽØºÙ’Ø¶ÙÙˆØ¨Ù Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡ÙÙ…Ù’ ÙˆÙŽÙ„ÙŽØ§ Ø§Ù„Ø¶Ù‘ÙŽØ§Ù„Ù‘ÙÙŠÙ†ÙŽ",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        words: [
          { text: "ØµÙØ±ÙŽØ§Ø·ÙŽ", rule: "tafkheem" },
          { text: "Ø§Ù„Ù‘ÙŽØ°ÙÙŠÙ†ÙŽ", rule: "none" },
          { text: "Ø£ÙŽÙ†Ù’Ø¹ÙŽÙ…Ù’ØªÙŽ", rule: "none" },
          { text: "Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡ÙÙ…Ù’", rule: "none" },
          { text: "ØºÙŽÙŠÙ’Ø±Ù", rule: "tafkheem" },
          { text: "Ø§Ù„Ù’Ù…ÙŽØºÙ’Ø¶ÙÙˆØ¨Ù", rule: "tafkheem" },
          { text: "Ø¹ÙŽÙ„ÙŽÙŠÙ’Ù‡ÙÙ…Ù’", rule: "none" },
          { text: "ÙˆÙŽÙ„ÙŽØ§", rule: "none" },
          { text: "Ø§Ù„Ø¶Ù‘ÙŽØ§Ù„Ù‘ÙÙŠÙ†ÙŽ", rule: "madd" }
        ]
      }
    ]
  },
  {
    id: 108,
    name: 'Ø§Ù„ÙƒÙˆØ«Ø±',
    englishName: 'Al-Kawthar',
    englishTranslation: 'The Abundance',
    totalAyahs: 3,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "Ø¥ÙÙ†Ù‘ÙŽØ§ Ø£ÙŽØ¹Ù’Ø·ÙŽÙŠÙ’Ù†ÙŽØ§ÙƒÙŽ Ø§Ù„Ù’ÙƒÙŽÙˆÙ’Ø«ÙŽØ±ÙŽ",
        translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar.",
        words: [
          { text: "Ø¥ÙÙ†Ù‘ÙŽØ§", rule: "ghunnah" },
          { text: "Ø£ÙŽØ¹Ù’Ø·ÙŽÙŠÙ’Ù†ÙŽØ§ÙƒÙŽ", rule: "tafkheem" },
          { text: "Ø§Ù„Ù’ÙƒÙŽÙˆÙ’Ø«ÙŽØ±ÙŽ", rule: "tafkheem" }
        ]
      },
      {
        number: 2,
        text: "ÙÙŽØµÙŽÙ„Ù‘Ù Ù„ÙØ±ÙŽØ¨Ù‘ÙÙƒÙŽ ÙˆÙŽØ§Ù†Ù’Ø­ÙŽØ±Ù’",
        translation: "So pray to your Lord and sacrifice [to Him alone].",
        words: [
          { text: "ÙÙŽØµÙŽÙ„Ù‘Ù", rule: "tafkheem" },
          { text: "Ù„ÙØ±ÙŽØ¨Ù‘ÙÙƒÙŽ", rule: "none" },
          { text: "ÙˆÙŽØ§Ù†Ù’Ø­ÙŽØ±Ù’", rule: "tafkheem" }
        ]
      },
      {
        number: 3,
        text: "Ø¥ÙÙ†Ù‘ÙŽ Ø´ÙŽØ§Ù†ÙØ¦ÙŽÙƒÙŽ Ù‡ÙÙˆÙŽ Ø§Ù„Ù’Ø£ÙŽØ¨Ù’ØªÙŽØ±Ù",
        translation: "Indeed, your enemy is the one cut off.",
        words: [
          { text: "Ø¥ÙÙ†Ù‘ÙŽ", rule: "ghunnah" },
          { text: "Ø´ÙŽØ§Ù†ÙØ¦ÙŽÙƒÙŽ", rule: "none" },
          { text: "Ù‡ÙÙˆÙŽ", rule: "none" },
          { text: "Ø§Ù„Ù’Ø£ÙŽØ¨Ù’ØªÙŽØ±Ù", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 103,
    name: 'Ø§Ù„Ø¹ØµØ±',
    englishName: 'Al-Asr',
    englishTranslation: 'The Declining Day',
    totalAyahs: 3,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "ÙˆÙŽØ§Ù„Ù’Ø¹ÙŽØµÙ’Ø±Ù",
        translation: "By time,",
        words: [
          { text: "ÙˆÙŽØ§Ù„Ù’Ø¹ÙŽØµÙ’Ø±Ù", rule: "tafkheem" }
        ]
      },
      {
        number: 2,
        text: "Ø¥ÙÙ†Ù‘ÙŽ Ø§Ù„Ù’Ø¥ÙÙ†Ø³ÙŽØ§Ù†ÙŽ Ù„ÙŽÙÙÙŠ Ø®ÙØ³Ù’Ø±Ù",
        translation: "Indeed, mankind is in loss,",
        words: [
          { text: "Ø¥ÙÙ†Ù‘ÙŽ", rule: "ghunnah" },
          { text: "Ø§Ù„Ù’Ø¥ÙÙ†Ø³ÙŽØ§Ù†ÙŽ", rule: "ikhfa" },
          { text: "Ù„ÙŽÙÙÙŠ", rule: "none" },
          { text: "Ø®ÙØ³Ù’Ø±Ù", rule: "tafkheem" }
        ]
      },
      {
        number: 3,
        text: "Ø¥ÙÙ„Ù‘ÙŽØ§ Ø§Ù„Ù‘ÙŽØ°ÙÙŠÙ†ÙŽ Ø¢Ù…ÙŽÙ†ÙÙˆØ§ ÙˆÙŽØ¹ÙŽÙ…ÙÙ„ÙÙˆØ§ Ø§Ù„ØµÙ‘ÙŽØ§Ù„ÙØ­ÙŽØ§ØªÙ ÙˆÙŽØªÙŽÙˆÙŽØ§ØµÙŽÙˆÙ’Ø§ Ø¨ÙØ§Ù„Ù’Ø­ÙŽÙ‚Ù‘Ù ÙˆÙŽØªÙŽÙˆÙŽØ§ØµÙŽÙˆÙ’Ø§ Ø¨ÙØ§Ù„ØµÙ‘ÙŽØ¨Ù’Ø±Ù",
        translation: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
        words: [
          { text: "Ø¥ÙÙ„Ù‘ÙŽØ§", rule: "none" },
          { text: "Ø§Ù„Ù‘ÙŽØ°ÙÙŠÙ†ÙŽ", rule: "none" },
          { text: "Ø¢Ù…ÙŽÙ†ÙÙˆØ§", rule: "none" },
          { text: "ÙˆÙŽØ¹ÙŽÙ…ÙÙ„ÙÙˆØ§", rule: "none" },
          { text: "Ø§Ù„ØµÙ‘ÙŽØ§Ù„ÙØ­ÙŽØ§ØªÙ", rule: "tafkheem" },
          { text: "ÙˆÙŽØªÙŽÙˆÙŽØ§ØµÙŽÙˆÙ’Ø§", rule: "none" },
          { text: "Ø¨ÙØ§Ù„Ù’Ø­ÙŽÙ‚Ù‘Ù", rule: "tafkheem" },
          { text: "ÙˆÙŽØªÙŽÙˆÙŽØ§ØµÙŽÙˆÙ’Ø§", rule: "none" },
          { text: "Ø¨ÙØ§Ù„ØµÙ‘ÙŽØ¨Ù’Ø±Ù", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 112,
    name: 'Ø§Ù„Ø¥Ø®Ù„Ø§Øµ',
    englishName: 'Al-Ikhlas',
    englishTranslation: 'The Sincerity',
    totalAyahs: 4,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "Ù‚ÙÙ„Ù’ Ù‡ÙÙˆÙŽ Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù Ø£ÙŽØ­ÙŽØ¯ÙŒ",
        translation: "Say, \"He is Allah, [who is] One,",
        words: [
          { text: "Ù‚ÙÙ„Ù’", rule: "tafkheem" },
          { text: "Ù‡ÙÙˆÙŽ", rule: "none" },
          { text: "Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù", rule: "none" },
          { text: "Ø£ÙŽØ­ÙŽØ¯ÙŒ", rule: "qalqalah" }
        ]
      },
      {
        number: 2,
        text: "Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù Ø§Ù„ØµÙ‘ÙŽÙ…ÙŽØ¯Ù",
        translation: "Allah, the Eternal Refuge.",
        words: [
          { text: "Ø§Ù„Ù„Ù‘ÙŽÙ‡Ù", rule: "none" },
          { text: "Ø§Ù„ØµÙ‘ÙŽÙ…ÙŽØ¯Ù", rule: "qalqalah" }
        ]
      },
      {
        number: 3,
        text: "Ù„ÙŽÙ…Ù’ ÙŠÙŽÙ„ÙØ¯Ù’ ÙˆÙŽÙ„ÙŽÙ…Ù’ ÙŠÙÙˆÙ„ÙŽØ¯Ù’",
        translation: "He neither begets nor is born,",
        words: [
          { text: "Ù„ÙŽÙ…Ù’", rule: "none" },
          { text: "ÙŠÙŽÙ„ÙØ¯Ù’", rule: "qalqalah" },
          { text: "ÙˆÙŽÙ„ÙŽÙ…Ù’", rule: "none" },
          { text: "ÙŠÙÙˆÙ„ÙŽØ¯Ù’", rule: "qalqalah" }
        ]
      },
      {
        number: 4,
        text: "ÙˆÙŽÙ„ÙŽÙ…Ù’ ÙŠÙŽÙƒÙÙ† Ù„Ù‘ÙŽÙ‡Ù ÙƒÙÙÙÙˆÙ‹Ø§ Ø£ÙŽØ­ÙŽØ¯ÙŒ",
        translation: "And there is none co-equal or comparable unto Him.\"",
        words: [
          { text: "ÙˆÙŽÙ„ÙŽÙ…Ù’", rule: "none" },
          { text: "ÙŠÙŽÙƒÙÙ†", rule: "none" },
          { text: "Ù„Ù‘ÙŽÙ‡Ù", rule: "idgham" },
          { text: "ÙƒÙÙÙÙˆÙ‹Ø§", rule: "none" },
          { text: "Ø£ÙŽØ­ÙŽØ¯ÙŒ", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 114,
    name: 'Ø§Ù„Ù†Ø§Ø³',
    englishName: 'An-Nas',
    englishTranslation: 'Mankind',
    totalAyahs: 6,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "Ù‚ÙÙ„Ù’ Ø£ÙŽØ¹ÙÙˆØ°Ù Ø¨ÙØ±ÙŽØ¨Ù‘Ù Ø§Ù„Ù†Ø§Ø³Ù",
        translation: "Say, \"I seek refuge in the Lord of mankind,",
        words: [
          { text: "Ù‚ÙÙ„Ù’", rule: "tafkheem" },
          { text: "Ø£ÙŽØ¹ÙÙˆØ°Ù", rule: "none" },
          { text: "Ø¨ÙØ±ÙŽØ¨Ù‘Ù", rule: "none" },
          { text: "Ø§Ù„Ù†Ø§Ø³Ù", rule: "ghunnah" }
        ]
      },
      {
        number: 2,
        text: "Ù…ÙŽÙ„ÙÙƒÙ Ø§Ù„Ù†Ø§Ø³Ù",
        translation: "The Sovereign of mankind,",
        words: [
          { text: "Ù…ÙŽÙ„ÙÙƒÙ", rule: "none" },
          { text: "Ø§Ù„Ù†Ø§Ø³Ù", rule: "ghunnah" }
        ]
      },
      {
        number: 3,
        text: "Ø¥ÙÙ„ÙŽÙ°Ù‡Ù Ø§Ù„Ù†Ø§Ø³Ù",
        translation: "The God of mankind,",
        words: [
          { text: "Ø¥ÙÙ„ÙŽÙ°Ù‡Ù", rule: "none" },
          { text: "Ø§Ù„Ù†Ø§Ø³Ù", rule: "ghunnah" }
        ]
      },
      {
        number: 4,
        text: "Ù…ÙÙ† Ø´ÙŽØ±Ù‘Ù Ø§Ù„Ù’ÙˆÙŽØ³Ù’ÙˆÙŽØ§Ø³Ù Ø§Ù„Ù’Ø®ÙŽÙ†Ù‘ÙŽØ§Ø³Ù",
        translation: "From the evil of the retreating whisperer -",
        words: [
          { text: "Ù…ÙÙ†", rule: "none" },
          { text: "Ø´ÙŽØ±Ù‘Ù", rule: "ikhfa" },
          { text: "Ø§Ù„Ù’ÙˆÙŽØ³Ù’ÙˆÙŽØ§Ø³Ù", rule: "none" },
          { text: "Ø§Ù„Ù’Ø®ÙŽÙ†Ù‘ÙŽØ§Ø³Ù", rule: "ghunnah" }
        ]
      },
      {
        number: 5,
        text: "Ø§Ù„Ù‘ÙŽØ°ÙÙŠ ÙŠÙÙˆÙŽØ³Ù’ÙˆÙØ³Ù ÙÙÙŠ ØµÙØ¯ÙÙˆØ±Ù Ø§Ù„Ù†Ø§Ø³Ù",
        translation: "Who whispers [evil] into the breasts of mankind -",
        words: [
          { text: "Ø§Ù„Ù‘ÙŽØ°ÙÙŠ", rule: "none" },
          { text: "ÙŠÙÙˆÙŽØ³Ù’ÙˆÙØ³Ù", rule: "none" },
          { text: "ÙÙÙŠ", rule: "none" },
          { text: "ØµÙØ¯ÙÙˆØ±Ù", rule: "tafkheem" },
          { text: "Ø§Ù„Ù†Ø§Ø³Ù", rule: "ghunnah" }
        ]
      },
      {
        number: 6,
        text: "Ù…ÙÙ†ÙŽ Ø§Ù„Ù’Ø¬ÙÙ†Ù‘ÙŽØ©Ù ÙˆÙŽØ§Ù„Ù†Ø§Ø³Ù",
        translation: "From among the jinn and mankind.\"",
        words: [
          { text: "Ù…ÙÙ†ÙŽ", rule: "none" },
          { text: "Ø§Ù„Ù’Ø¬ÙÙ†Ù‘ÙŽØ©Ù", rule: "ghunnah" },
          { text: "ÙˆÙŽØ§Ù„Ù†Ø§Ø³Ù", rule: "ghunnah" }
        ]
      }
    ]
  }
];

// Helper to check if a word has a Tajweed rule dynamically
function parseTajweedWord(word) {
  const w = word;
  let rule = 'none';

  // 1. Ghunnah: shadda on noon (U+0646) or meem (U+0645)
  if (/[نم]ّ/.test(w)) {
    rule = 'ghunnah';

  // 2. Qalqalah: qaf/ta/ba/jeem/dal + sukoon or at word end
  } else if (/[قطبجد]ْ/.test(w) ||
             /[قطبجد]$/.test(w.replace(/[ً-ْٰ]/g, ''))) {
    rule = 'qalqalah';

  // 3. Madd: alif madda, superscript alif, or long vowels
  } else if (
    w.includes('آ') ||
    w.includes('ٰ') ||
    /َا/.test(w) ||
    /ُو/.test(w) ||
    /ِي/.test(w) ||
    /َ[ىي]/.test(w)
  ) {
    rule = 'madd';

  // 4. Tanween: double fatha/damma/kasra
  } else if (/[ًٌٍ]/.test(w)) {
    rule = 'izhar';

  // 5. Ikhfa: noon + sukoon
  } else if (/نْ/.test(w)) {
    rule = 'ikhfa';
  }

  return { text: word, rule };
}
// Loads Ayahs dynamically (reads from sample, cache or pulls from API)
export async function loadSurahAyahs(surahId) {
  // 1. Check if it is preloaded in samples
  const sample = SAMPLE_SURAHS.find(s => s.id === surahId);
  if (sample) {
    return sample.ayahs;
  }

  // 2. Check if cached in AsyncStorage
  try {
    const cachedData = await AsyncStorage.getItem(`tarteel_surah_${surahId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (e) {
    console.log('Error reading surah cache:', e);
  }

  // 3. Fetch from Alquran.cloud API
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-simple,en.sahih`);
    if (!response.ok) {
      throw new Error(`Failed to load surah ${surahId}`);
    }
    const result = await response.json();
    const arabicEdition = result.data[0];
    const englishEdition = result.data[1];

    const formattedAyahs = arabicEdition.ayahs.map((ayah, index) => {
      const engAyah = englishEdition.ayahs[index];
      const ayahText = ayah.text;
      
      // Tokenize words
      const wordsText = ayahText.split(/\s+/).filter(w => w.length > 0);
      const words = wordsText.map(word => parseTajweedWord(word));

      return {
        number: ayah.numberInSurah,
        text: ayahText,
        translation: engAyah.text,
        words: words
      };
    });

    // Save to cache
    try {
      await AsyncStorage.setItem(`tarteel_surah_${surahId}`, JSON.stringify(formattedAyahs));
    } catch (e) {
      console.log('Failed to write surah cache:', e);
    }

    return formattedAyahs;
  } catch (err) {
    console.error('API Fetch error:', err);
    throw err;
  }
}

export function getAudioUrl(qariId, surahNumber, ayahNumber) {
  const qari = QARIS.find(q => q.id === qariId) || QARIS[0];
  const formattedSurah = String(surahNumber).padStart(3, '0');
  const formattedAyah = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/${qari.folder}/${formattedSurah}${formattedAyah}.mp3`;
}

