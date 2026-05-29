import AsyncStorage from '@react-native-async-storage/async-storage';

export const QARIS = [
  { id: 'husary', name: 'الشيخ الحصري (معلم)', englishName: 'Sheikh Al-Husary (Teacher)', folder: 'Husary_Muallim_128kbps' },
  { id: 'minshawi', name: 'الشيخ المنشاوي (معلم)', englishName: 'Sheikh Al-Minshawi (Teacher)', folder: 'Minshawi_Muallim_128kbps' },
  { id: 'alafasy', name: 'الشيخ مشاري العفاسي', englishName: 'Sheikh Mishary Alafasy', folder: 'Alafasy_128kbps' },
];

export const TAJWEED_RULES = {
  none: { name: 'Normal', color: '#FFFFFF', darkColor: '#E2E8F0', description: 'Standard pronunciation' },
  qalqalah: { name: 'قلقلة (Qalqalah)', color: '#F59E0B', darkColor: '#FBBF24', description: 'Vibrating or echoing sound on letters (ق، ط، ب، ج، د) when silent.' },
  ghunnah: { name: 'غنة (Ghunnah)', color: '#10B981', darkColor: '#34D399', description: 'Nasalization sound of 2 beats on Meem and Noon with Shaddah.' },
  ikhfa: { name: 'إخفاء (Ikhfa)', color: '#3B82F6', darkColor: '#60A5FA', description: 'Hiding the Noon Sakinah or Tanween when followed by specific letters.' },
  idgham: { name: 'إدغام (Idgham)', color: '#8B5CF6', darkColor: '#A78BFA', description: 'Merging Noon Sakinah or Tanween into the next letter with or without Ghunnah.' },
  iqlab: { name: 'إقلاب (Iqlab)', color: '#EC4899', darkColor: '#F472B6', description: 'Converting Noon Sakinah or Tanween into a Meem when followed by Baa.' },
  izhar: { name: 'إظهار (Izhar)', color: '#14B8A6', darkColor: '#2DD4BF', description: 'Clear pronunciation of Noon Sakinah or Tanween before the six throat letters.' },
  madd: { name: 'مد (Madd)', color: '#EF4444', darkColor: '#F87171', description: 'Prolongation of vowel sounds (Alif, Waw, Yaa) for 2 to 6 beats.' },
  tafkheem: { name: 'تفخيم (Tafkheem)', color: '#06B6D4', darkColor: '#22D3EE', description: 'Heavy/thick pronunciation of specific letters.' }
};

// Surah → primary Juz mapping
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
  { id: 'husary',   name: 'الشيخ محمود خليل الحصري',    subtitle: 'رواية حفص — معلم مرتّل',  folder: 'Husary_Muallim_128kbps',   icon: 'account-music' },
  { id: 'minshawi', name: 'الشيخ محمد صديق المنشاوي',   subtitle: 'رواية حفص — معلم مرتّل',  folder: 'Minshawi_Muallim_128kbps', icon: 'account-music-outline' },
  { id: 'alafasy',  name: 'الشيخ مشاري بن راشد العفاسي',subtitle: 'رواية حفص — تلاوة عادية', folder: 'Alafasy_128kbps',           icon: 'microphone-variant' },
];

// 114 Surahs Metadata List
export const ALL_SURAHS = [
  { id: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishTranslation: 'The Opening', totalAyahs: 7, type: 'Meccan' },
  { id: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishTranslation: 'The Cow', totalAyahs: 286, type: 'Medinan' },
  { id: 3, name: 'آل عمران', englishName: 'Ali \'Imran', englishTranslation: 'Family of Imran', totalAyahs: 200, type: 'Medinan' },
  { id: 4, name: 'النساء', englishName: 'An-Nisa', englishTranslation: 'The Women', totalAyahs: 176, type: 'Medinan' },
  { id: 5, name: 'المائدة', englishName: 'Al-Ma\'idah', englishTranslation: 'The Table Spread', totalAyahs: 120, type: 'Medinan' },
  { id: 6, name: 'الأنعام', englishName: 'Al-An\'am', englishTranslation: 'The Cattle', totalAyahs: 165, type: 'Meccan' },
  { id: 7, name: 'الأعراف', englishName: 'Al-A\'raf', englishTranslation: 'The Heights', totalAyahs: 206, type: 'Meccan' },
  { id: 8, name: 'الأنفال', englishName: 'Al-Anfal', englishTranslation: 'The Spoils of War', totalAyahs: 75, type: 'Medinan' },
  { id: 9, name: 'التوبة', englishName: 'At-Tawbah', englishTranslation: 'The Repentance', totalAyahs: 129, type: 'Medinan' },
  { id: 10, name: 'يونس', englishName: 'Yunus', englishTranslation: 'Jonah', totalAyahs: 109, type: 'Meccan' },
  { id: 11, name: 'هود', englishName: 'Hud', englishTranslation: 'Hud', totalAyahs: 123, type: 'Meccan' },
  { id: 12, name: 'يوسف', englishName: 'Yusuf', englishTranslation: 'Joseph', totalAyahs: 111, type: 'Meccan' },
  { id: 13, name: 'الرعد', englishName: 'Ar-Ra\'d', englishTranslation: 'The Thunder', totalAyahs: 43, type: 'Medinan' },
  { id: 14, name: 'إبراهيم', englishName: 'Ibrahim', englishTranslation: 'Abraham', totalAyahs: 52, type: 'Meccan' },
  { id: 15, name: 'الحجر', englishName: 'Al-Hijr', englishTranslation: 'The Rocky Tract', totalAyahs: 99, type: 'Meccan' },
  { id: 16, name: 'النحل', englishName: 'An-Nahl', englishTranslation: 'The Bee', totalAyahs: 128, type: 'Meccan' },
  { id: 17, name: 'الإسراء', englishName: 'Al-Isra', englishTranslation: 'The Night Journey', totalAyahs: 111, type: 'Meccan' },
  { id: 18, name: 'الكهف', englishName: 'Al-Kahf', englishTranslation: 'The Cave', totalAyahs: 110, type: 'Meccan' },
  { id: 19, name: 'مريم', englishName: 'Maryam', englishTranslation: 'Mary', totalAyahs: 98, type: 'Meccan' },
  { id: 20, name: 'طه', englishName: 'Taha', englishTranslation: 'Ta-Ha', totalAyahs: 135, type: 'Meccan' },
  { id: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', englishTranslation: 'The Prophets', totalAyahs: 112, type: 'Meccan' },
  { id: 22, name: 'الحج', englishName: 'Al-Hajj', englishTranslation: 'The Pilgrimage', totalAyahs: 78, type: 'Medinan' },
  { id: 23, name: 'المؤمنون', englishName: 'Al-Mu\'minun', englishTranslation: 'The Believers', totalAyahs: 118, type: 'Meccan' },
  { id: 24, name: 'النور', englishName: 'An-Nur', englishTranslation: 'The Light', totalAyahs: 64, type: 'Medinan' },
  { id: 25, name: 'الفرقان', englishName: 'Al-Furqan', englishTranslation: 'The Criterion', totalAyahs: 77, type: 'Meccan' },
  { id: 26, name: 'الشعراء', englishName: 'Ash-Shu\'ara', englishTranslation: 'The Poets', totalAyahs: 227, type: 'Meccan' },
  { id: 27, name: 'النمل', englishName: 'An-Naml', englishTranslation: 'The Ant', totalAyahs: 93, type: 'Meccan' },
  { id: 28, name: 'القصص', englishName: 'Al-Qasas', englishTranslation: 'The Stories', totalAyahs: 88, type: 'Meccan' },
  { id: 29, name: 'العنكبوت', englishName: 'Al-Ankabut', englishTranslation: 'The Spider', totalAyahs: 69, type: 'Meccan' },
  { id: 30, name: 'الروم', englishName: 'Ar-Rum', englishTranslation: 'The Romans', totalAyahs: 60, type: 'Meccan' },
  { id: 31, name: 'لقمان', englishName: 'Luqman', englishTranslation: 'Luqman', totalAyahs: 34, type: 'Meccan' },
  { id: 32, name: 'السجدة', englishName: 'As-Sajdah', englishTranslation: 'The Prostration', totalAyahs: 30, type: 'Meccan' },
  { id: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', englishTranslation: 'The Combined Forces', totalAyahs: 73, type: 'Medinan' },
  { id: 34, name: 'سبأ', englishName: 'Saba', englishTranslation: 'Sheba', totalAyahs: 54, type: 'Meccan' },
  { id: 35, name: 'فاطر', englishName: 'Fatir', englishTranslation: 'Originator', totalAyahs: 45, type: 'Meccan' },
  { id: 36, name: 'يس', englishName: 'Ya-Sin', englishTranslation: 'Ya Sin', totalAyahs: 83, type: 'Meccan' },
  { id: 37, name: 'الصافات', englishName: 'As-Saffat', englishTranslation: 'Those who set the Ranks', totalAyahs: 182, type: 'Meccan' },
  { id: 38, name: 'ص', englishName: 'Sad', englishTranslation: 'The Letter Sad', totalAyahs: 88, type: 'Meccan' },
  { id: 39, name: 'الزمر', englishName: 'Az-Zumar', englishTranslation: 'The Troops', totalAyahs: 75, type: 'Meccan' },
  { id: 40, name: 'غافر', englishName: 'Ghafir', englishTranslation: 'The Forgiver', totalAyahs: 85, type: 'Meccan' },
  { id: 41, name: 'فصلت', englishName: 'Fussilat', englishTranslation: 'Explained in Detail', totalAyahs: 54, type: 'Meccan' },
  { id: 42, name: 'الشورى', englishName: 'Ash-Shura', englishTranslation: 'The Consultation', totalAyahs: 53, type: 'Meccan' },
  { id: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishTranslation: 'The Ornaments of Gold', totalAyahs: 89, type: 'Meccan' },
  { id: 44, name: 'الدخان', englishName: 'Ad-Dukhan', englishTranslation: 'The Smoke', totalAyahs: 59, type: 'Meccan' },
  { id: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', englishTranslation: 'The Crouching', totalAyahs: 37, type: 'Meccan' },
  { id: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', englishTranslation: 'The Wind-Curved Sandhills', totalAyahs: 35, type: 'Meccan' },
  { id: 47, name: 'محمد', englishName: 'Muhammad', englishTranslation: 'Muhammad', totalAyahs: 38, type: 'Medinan' },
  { id: 48, name: 'الفتح', englishName: 'Al-Fath', englishTranslation: 'The Victory', totalAyahs: 29, type: 'Medinan' },
  { id: 49, name: 'الحجرات', englishName: 'Al-Hujurat', englishTranslation: 'The Rooms', totalAyahs: 18, type: 'Medinan' },
  { id: 50, name: 'ق', englishName: 'Qaf', englishTranslation: 'The Letter Qaf', totalAyahs: 45, type: 'Meccan' },
  { id: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', englishTranslation: 'The Winnowing Winds', totalAyahs: 60, type: 'Meccan' },
  { id: 52, name: 'الطور', englishName: 'At-Tur', englishTranslation: 'The Mount', totalAyahs: 49, type: 'Meccan' },
  { id: 53, name: 'النجم', englishName: 'An-Najm', englishTranslation: 'The Star', totalAyahs: 62, type: 'Meccan' },
  { id: 54, name: 'القمر', englishName: 'Al-Qamar', englishTranslation: 'The Moon', totalAyahs: 55, type: 'Meccan' },
  { id: 55, name: 'الرحمن', englishName: 'Ar-Rahman', englishTranslation: 'The Beneficent', totalAyahs: 78, type: 'Medinan' },
  { id: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', englishTranslation: 'The Inevitable', totalAyahs: 96, type: 'Meccan' },
  { id: 57, name: 'الحديد', englishName: 'Al-Hadid', englishTranslation: 'The Iron', totalAyahs: 29, type: 'Medinan' },
  { id: 58, name: 'المجادلة', englishName: 'Al-Mujadilah', englishTranslation: 'The Pleading Woman', totalAyahs: 22, type: 'Medinan' },
  { id: 59, name: 'الحشر', englishName: 'Al-Hashr', englishTranslation: 'The Exile', totalAyahs: 24, type: 'Medinan' },
  { id: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', englishTranslation: 'She that is to be examined', totalAyahs: 13, type: 'Medinan' },
  { id: 61, name: 'الصف', englishName: 'As-Saff', englishTranslation: 'The Ranks', totalAyahs: 14, type: 'Medinan' },
  { id: 62, name: 'الجمعة', englishName: 'Al-Jumu\'ah', englishTranslation: 'The Congregation', totalAyahs: 11, type: 'Medinan' },
  { id: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', englishTranslation: 'The Hypocrites', totalAyahs: 11, type: 'Medinan' },
  { id: 64, name: 'التغابن', englishName: 'At-Taghabun', englishTranslation: 'Mutual Disillusion', totalAyahs: 18, type: 'Medinan' },
  { id: 65, name: 'الطلاق', englishName: 'At-Talaq', englishTranslation: 'The Divorce', totalAyahs: 12, type: 'Medinan' },
  { id: 66, name: 'التحريم', englishName: 'At-Tahrim', englishTranslation: 'The Banning', totalAyahs: 12, type: 'Medinan' },
  { id: 67, name: 'الملك', englishName: 'Al-Mulk', englishTranslation: 'The Sovereignty', totalAyahs: 30, type: 'Meccan' },
  { id: 68, name: 'القلم', englishName: 'Al-Qalam', englishTranslation: 'The Pen', totalAyahs: 52, type: 'Meccan' },
  { id: 69, name: 'الحاقة', englishName: 'Al-Haqqah', englishTranslation: 'The Reality', totalAyahs: 52, type: 'Meccan' },
  { id: 70, name: 'المعارج', englishName: 'Al-Ma\'arij', englishTranslation: 'The Ascending Stairways', totalAyahs: 44, type: 'Meccan' },
  { id: 71, name: 'نوح', englishName: 'Nuh', englishTranslation: 'Noah', totalAyahs: 28, type: 'Meccan' },
  { id: 72, name: 'الجن', englishName: 'Al-Jinn', englishTranslation: 'The Jinn', totalAyahs: 28, type: 'Meccan' },
  { id: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishTranslation: 'The Enshrouded One', totalAyahs: 20, type: 'Meccan' },
  { id: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishTranslation: 'The Cloaked One', totalAyahs: 56, type: 'Meccan' },
  { id: 75, name: 'القيامة', englishName: 'Al-Qiyamah', englishTranslation: 'The Rising of the Dead', totalAyahs: 40, type: 'Meccan' },
  { id: 76, name: 'الإنسان', englishName: 'Al-Insan', englishTranslation: 'Man', totalAyahs: 31, type: 'Medinan' },
  { id: 77, name: 'المرسلات', englishName: 'Al-Mursalat', englishTranslation: 'The Emissaries', totalAyahs: 50, type: 'Meccan' },
  { id: 78, name: 'النبأ', englishName: 'An-Naba', englishTranslation: 'The Tidings', totalAyahs: 40, type: 'Meccan' },
  { id: 79, name: 'النازعات', englishName: 'An-Nazi\'at', englishTranslation: 'Those who drag forth', totalAyahs: 46, type: 'Meccan' },
  { id: 80, name: 'عبس', englishName: 'Abasa', englishTranslation: 'He Frowned', totalAyahs: 42, type: 'Meccan' },
  { id: 81, name: 'التكوير', englishName: 'At-Takwir', englishTranslation: 'The Overthrowing', totalAyahs: 29, type: 'Meccan' },
  { id: 82, name: 'الانفطار', englishName: 'Al-Infitar', englishTranslation: 'The Cleaving', totalAyahs: 19, type: 'Meccan' },
  { id: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishTranslation: 'Defrauding', totalAyahs: 36, type: 'Meccan' },
  { id: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', englishTranslation: 'The Sundering', totalAyahs: 25, type: 'Meccan' },
  { id: 85, name: 'البروج', englishName: 'Al-Buruj', englishTranslation: 'The Mansions of the Stars', totalAyahs: 22, type: 'Meccan' },
  { id: 86, name: 'الطارق', englishName: 'At-Tariq', englishTranslation: 'The Morning Star', totalAyahs: 17, type: 'Meccan' },
  { id: 87, name: 'الأعلى', englishName: 'Al-A\'la', englishTranslation: 'The Most High', totalAyahs: 19, type: 'Meccan' },
  { id: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', englishTranslation: 'The Overwhelming', totalAyahs: 26, type: 'Meccan' },
  { id: 89, name: 'الفجر', englishName: 'Al-Fajr', englishTranslation: 'The Dawn', totalAyahs: 30, type: 'Meccan' },
  { id: 90, name: 'البلد', englishName: 'Al-Balad', englishTranslation: 'The City', totalAyahs: 20, type: 'Meccan' },
  { id: 91, name: 'الشمس', englishName: 'Ash-Shams', englishTranslation: 'The Sun', totalAyahs: 15, type: 'Meccan' },
  { id: 92, name: 'الليل', englishName: 'Al-Layl', englishTranslation: 'The Night', totalAyahs: 21, type: 'Meccan' },
  { id: 93, name: 'الضحى', englishName: 'Ad-Duha', englishTranslation: 'The Morning Hours', totalAyahs: 11, type: 'Meccan' },
  { id: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishTranslation: 'The Consolation', totalAyahs: 8, type: 'Meccan' },
  { id: 95, name: 'التين', englishName: 'At-Tin', englishTranslation: 'The Fig', totalAyahs: 8, type: 'Meccan' },
  { id: 96, name: 'العلق', englishName: 'Al-Alaq', englishTranslation: 'The Clot', totalAyahs: 19, type: 'Meccan' },
  { id: 97, name: 'القدر', englishName: 'Al-Qadr', englishTranslation: 'The Power', totalAyahs: 5, type: 'Meccan' },
  { id: 98, name: 'البينة', englishName: 'Al-Bayyinah', englishTranslation: 'The Clear Proof', totalAyahs: 8, type: 'Medinan' },
  { id: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', englishTranslation: 'The Earthquake', totalAyahs: 8, type: 'Medinan' },
  { id: 100, name: 'العاديات', englishName: 'Al-Adiyat', englishTranslation: 'The Chargers', totalAyahs: 11, type: 'Meccan' },
  { id: 101, name: 'القارعة', englishName: 'Al-Qari\'ah', englishTranslation: 'The Calamity', totalAyahs: 11, type: 'Meccan' },
  { id: 102, name: 'التكاثر', englishName: 'At-Takathur', englishTranslation: 'Competition in Increase', totalAyahs: 8, type: 'Meccan' },
  { id: 103, name: 'العصر', englishName: 'Al-Asr', englishTranslation: 'The Declining Day', totalAyahs: 3, type: 'Meccan' },
  { id: 104, name: 'الهمزة', englishName: 'Al-Humazah', englishTranslation: 'The Slanderer', totalAyahs: 9, type: 'Meccan' },
  { id: 105, name: 'الفيل', englishName: 'Al-Fil', englishTranslation: 'The Elephant', totalAyahs: 5, type: 'Meccan' },
  { id: 106, name: 'قريش', englishName: 'Quraysh', englishTranslation: 'Quraysh', totalAyahs: 4, type: 'Meccan' },
  { id: 107, name: 'الماعون', englishName: 'Al-Ma\'un', englishTranslation: 'Neighborly Assistance', totalAyahs: 7, type: 'Meccan' },
  { id: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishTranslation: 'The Abundance', totalAyahs: 3, type: 'Meccan' },
  { id: 109, name: 'الكافرون', englishName: 'Al-Kafirun', englishTranslation: 'The Disbelievers', totalAyahs: 6, type: 'Meccan' },
  { id: 110, name: 'النصر', englishName: 'An-Nasr', englishTranslation: 'Divine Support', totalAyahs: 3, type: 'Medinan' },
  { id: 111, name: 'المسد', englishName: 'Al-Masad', englishTranslation: 'Palm Fibre', totalAyahs: 5, type: 'Meccan' },
  { id: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', englishTranslation: 'The Sincerity', totalAyahs: 4, type: 'Meccan' },
  { id: 113, name: 'الفلق', englishName: 'Al-Falaq', englishTranslation: 'The Daybreak', totalAyahs: 5, type: 'Meccan' },
  { id: 114, name: 'الناس', englishName: 'An-Nas', englishTranslation: 'Mankind', totalAyahs: 6, type: 'Meccan' }
];

// High-fidelity preloaded sample surahs (1, 103, 108, 112, 114)
export const SAMPLE_SURAHS = [
  {
    id: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatihah',
    englishTranslation: 'The Opening',
    totalAyahs: 7,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        words: [
          { text: "بِسْمِ", rule: "none" },
          { text: "اللَّهِ", rule: "none" },
          { text: "الرَّحْمَٰنِ", rule: "none" },
          { text: "الرَّحِيمِ", rule: "madd" }
        ]
      },
      {
        number: 2,
        text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
        words: [
          { text: "الْحَمْدُ", rule: "none" },
          { text: "لِلَّهِ", rule: "none" },
          { text: "رَبِّ", rule: "none" },
          { text: "الْعَالَمِينَ", rule: "madd" }
        ]
      },
      {
        number: 3,
        text: "الرَّحْمَٰنِ الرَّحِيمِ",
        translation: "The Entirely Merciful, the Especially Merciful,",
        words: [
          { text: "الرَّحْمَٰنِ", rule: "none" },
          { text: "الرَّحِيمِ", rule: "madd" }
        ]
      },
      {
        number: 4,
        text: "مَالِكِ يَوْمِ الدِّينِ",
        translation: "Sovereign of the Day of Recompense.",
        words: [
          { text: "مَالِكِ", rule: "none" },
          { text: "يَوْمِ", rule: "none" },
          { text: "الدِّينِ", rule: "madd" }
        ]
      },
      {
        number: 5,
        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        translation: "It is You we worship and You we ask for help.",
        words: [
          { text: "إِيَّاكَ", rule: "none" },
          { text: "نَعْبُدُ", rule: "none" },
          { text: "وَإِيَّاكَ", rule: "none" },
          { text: "نَسْتَعِينُ", rule: "madd" }
        ]
      },
      {
        number: 6,
        text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        translation: "Guide us to the straight path -",
        words: [
          { text: "اهْدِنَا", rule: "none" },
          { text: "الصِّرَاطَ", rule: "tafkheem" },
          { text: "الْمُسْتَقِيمَ", rule: "madd" }
        ]
      },
      {
        number: 7,
        text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
        words: [
          { text: "صِرَاطَ", rule: "tafkheem" },
          { text: "الَّذِينَ", rule: "none" },
          { text: "أَنْعَمْتَ", rule: "none" },
          { text: "عَلَيْهِمْ", rule: "none" },
          { text: "غَيْرِ", rule: "tafkheem" },
          { text: "الْمَغْضُوبِ", rule: "tafkheem" },
          { text: "عَلَيْهِمْ", rule: "none" },
          { text: "وَلَا", rule: "none" },
          { text: "الضَّالِّينَ", rule: "madd" }
        ]
      }
    ]
  },
  {
    id: 108,
    name: 'الكوثر',
    englishName: 'Al-Kawthar',
    englishTranslation: 'The Abundance',
    totalAyahs: 3,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
        translation: "Indeed, We have granted you, [O Muhammad], al-Kawthar.",
        words: [
          { text: "إِنَّا", rule: "ghunnah" },
          { text: "أَعْطَيْنَاكَ", rule: "tafkheem" },
          { text: "الْكَوْثَرَ", rule: "tafkheem" }
        ]
      },
      {
        number: 2,
        text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
        translation: "So pray to your Lord and sacrifice [to Him alone].",
        words: [
          { text: "فَصَلِّ", rule: "tafkheem" },
          { text: "لِرَبِّكَ", rule: "none" },
          { text: "وَانْحَرْ", rule: "tafkheem" }
        ]
      },
      {
        number: 3,
        text: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
        translation: "Indeed, your enemy is the one cut off.",
        words: [
          { text: "إِنَّ", rule: "ghunnah" },
          { text: "شَانِئَكَ", rule: "none" },
          { text: "هُوَ", rule: "none" },
          { text: "الْأَبْتَرُ", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 103,
    name: 'العصر',
    englishName: 'Al-Asr',
    englishTranslation: 'The Declining Day',
    totalAyahs: 3,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "وَالْعَصْرِ",
        translation: "By time,",
        words: [
          { text: "وَالْعَصْرِ", rule: "tafkheem" }
        ]
      },
      {
        number: 2,
        text: "إِنَّ الْإِنسَانَ لَفِي خُسْرٍ",
        translation: "Indeed, mankind is in loss,",
        words: [
          { text: "إِنَّ", rule: "ghunnah" },
          { text: "الْإِنسَانَ", rule: "ikhfa" },
          { text: "لَفِي", rule: "none" },
          { text: "خُسْرٍ", rule: "tafkheem" }
        ]
      },
      {
        number: 3,
        text: "إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ",
        translation: "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
        words: [
          { text: "إِلَّا", rule: "none" },
          { text: "الَّذِينَ", rule: "none" },
          { text: "آمَنُوا", rule: "none" },
          { text: "وَعَمِلُوا", rule: "none" },
          { text: "الصَّالِحَاتِ", rule: "tafkheem" },
          { text: "وَتَوَاصَوْا", rule: "none" },
          { text: "بِالْحَقِّ", rule: "tafkheem" },
          { text: "وَتَوَاصَوْا", rule: "none" },
          { text: "بِالصَّبْرِ", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 112,
    name: 'الإخلاص',
    englishName: 'Al-Ikhlas',
    englishTranslation: 'The Sincerity',
    totalAyahs: 4,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        translation: "Say, \"He is Allah, [who is] One,",
        words: [
          { text: "قُلْ", rule: "tafkheem" },
          { text: "هُوَ", rule: "none" },
          { text: "اللَّهُ", rule: "none" },
          { text: "أَحَدٌ", rule: "qalqalah" }
        ]
      },
      {
        number: 2,
        text: "اللَّهُ الصَّمَدُ",
        translation: "Allah, the Eternal Refuge.",
        words: [
          { text: "اللَّهُ", rule: "none" },
          { text: "الصَّمَدُ", rule: "qalqalah" }
        ]
      },
      {
        number: 3,
        text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        translation: "He neither begets nor is born,",
        words: [
          { text: "لَمْ", rule: "none" },
          { text: "يَلِدْ", rule: "qalqalah" },
          { text: "وَلَمْ", rule: "none" },
          { text: "يُولَدْ", rule: "qalqalah" }
        ]
      },
      {
        number: 4,
        text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        translation: "And there is none co-equal or comparable unto Him.\"",
        words: [
          { text: "وَلَمْ", rule: "none" },
          { text: "يَكُن", rule: "none" },
          { text: "لَّهُ", rule: "idgham" },
          { text: "كُفُوًا", rule: "none" },
          { text: "أَحَدٌ", rule: "qalqalah" }
        ]
      }
    ]
  },
  {
    id: 114,
    name: 'الناس',
    englishName: 'An-Nas',
    englishTranslation: 'Mankind',
    totalAyahs: 6,
    type: 'Meccan',
    ayahs: [
      {
        number: 1,
        text: "قُلْ أَعُوذُ بِرَبِّ الناسِ",
        translation: "Say, \"I seek refuge in the Lord of mankind,",
        words: [
          { text: "قُلْ", rule: "tafkheem" },
          { text: "أَعُوذُ", rule: "none" },
          { text: "بِرَبِّ", rule: "none" },
          { text: "الناسِ", rule: "ghunnah" }
        ]
      },
      {
        number: 2,
        text: "مَلِكِ الناسِ",
        translation: "The Sovereign of mankind,",
        words: [
          { text: "مَلِكِ", rule: "none" },
          { text: "الناسِ", rule: "ghunnah" }
        ]
      },
      {
        number: 3,
        text: "إِلَٰهِ الناسِ",
        translation: "The God of mankind,",
        words: [
          { text: "إِلَٰهِ", rule: "none" },
          { text: "الناسِ", rule: "ghunnah" }
        ]
      },
      {
        number: 4,
        text: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        translation: "From the evil of the retreating whisperer -",
        words: [
          { text: "مِن", rule: "none" },
          { text: "شَرِّ", rule: "ikhfa" },
          { text: "الْوَسْوَاسِ", rule: "none" },
          { text: "الْخَنَّاسِ", rule: "ghunnah" }
        ]
      },
      {
        number: 5,
        text: "الَّذِي يُوَسْوِسُ فِي صُدُورِ الناسِ",
        translation: "Who whispers [evil] into the breasts of mankind -",
        words: [
          { text: "الَّذِي", rule: "none" },
          { text: "يُوَسْوِسُ", rule: "none" },
          { text: "فِي", rule: "none" },
          { text: "صُدُورِ", rule: "tafkheem" },
          { text: "الناسِ", rule: "ghunnah" }
        ]
      },
      {
        number: 6,
        text: "مِنَ الْجِنَّةِ وَالناسِ",
        translation: "From among the jinn and mankind.\"",
        words: [
          { text: "مِنَ", rule: "none" },
          { text: "الْجِنَّةِ", rule: "ghunnah" },
          { text: "وَالناسِ", rule: "ghunnah" }
        ]
      }
    ]
  }
];

// Helper to check if a word has a Tajweed rule dynamically
function parseTajweedWord(word) {
  let rule = 'none';
  const cleanWord = word.replace(/[\u0615-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');

  if (cleanWord.includes('نّ') || cleanWord.includes('مّ')) {
    rule = 'ghunnah';
  } else if (/[قطبجد]ْ/.test(cleanWord) || /[قطبجد]$/.test(cleanWord.replace(/[\u064B-\u0652]/g, ''))) {
    rule = 'qalqalah';
  } else if (/[\u0653]/.test(cleanWord) || cleanWord.includes('~')) {
    rule = 'madd';
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
