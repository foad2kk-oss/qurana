import * as FileSystem from 'expo-file-system';

// Normalizes Arabic text for flexible comparison (removing diacritics, normalizing hamzas, etc.)
export function normalizeArabic(text, removeHarakat = true) {
  if (!text) return '';
  let normalized = text.trim();

  // Remove Quranic punctuation and signs
  normalized = normalized.replace(/[\u0615-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '');

  if (removeHarakat) {
    // Remove short vowels (Fatha, Damma, Kasra, Tanween, Sukoon, Shaddah)
    normalized = normalized.replace(/[\u064B-\u0652\u0670]/g, '');
  }

  // Normalize Alifs
  normalized = normalized.replace(/[أإآ]/g, 'ا');
  // Normalize Yahs
  normalized = normalized.replace(/ى/g, 'ي');
  // Normalize Ta Marbuta
  normalized = normalized.replace(/ة/g, 'ه');

  return normalized;
}

// Simple word-by-word sequence alignment using Longest Common Subsequence (LCS)
export function alignWords(originalWords, transcribedWords) {
  const m = originalWords.length;
  const n = transcribedWords.length;
  
  // dp[i][j] will store the length of LCS
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const origNorm = normalizeArabic(originalWords[i-1].text, true);
      const transNorm = normalizeArabic(transcribedWords[j-1], true);
      
      if (origNorm === transNorm) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  
  // Backtrack to find the alignment
  let i = m, j = n;
  const alignment = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const origNorm = normalizeArabic(originalWords[i-1].text, true);
      const transNorm = normalizeArabic(transcribedWords[j-1], true);
      
      if (origNorm === transNorm) {
        // Match found (check if harakat are identical)
        const hasHarakatError = originalWords[i-1].text !== transcribedWords[j-1] && 
                                transcribedWords[j-1].includes('\u064B'); // Simplification: has diacritics but different
        
        alignment.unshift({
          text: originalWords[i-1].text,
          userText: transcribedWords[j-1],
          status: hasHarakatError ? 'harakat_error' : 'correct',
          rule: originalWords[i-1].rule || 'none'
        });
        i--;
        j--;
      } else if (dp[i-1][j] >= dp[i][j-1]) {
        // Word from original was missed
        alignment.unshift({
          text: originalWords[i-1].text,
          status: 'missing',
          rule: originalWords[i-1].rule || 'none'
        });
        i--;
      } else {
        // Extra word spoken by user
        alignment.unshift({
          text: transcribedWords[j-1],
          status: 'extra',
          rule: 'none'
        });
        j--;
      }
    } else if (i > 0) {
      alignment.unshift({
        text: originalWords[i-1].text,
        status: 'missing',
        rule: originalWords[i-1].rule || 'none'
      });
      i--;
    } else {
      alignment.unshift({
        text: transcribedWords[j-1],
        status: 'extra',
        rule: 'none'
      });
      j--;
    }
  }
  
  return alignment;
}

// Grades the alignment and calculates a score
export function evaluateRecitation(originalWords, transcribedText) {
  if (!transcribedText) {
    return {
      score: 0,
      words: originalWords.map(w => ({ ...w, status: 'missing' })),
      feedback: 'لم يتم سماع أي تلاوة. الرجاء المحاولة مرة أخرى.'
    };
  }

  // Tokenize transcribed text
  const cleanTranscribed = transcribedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟]/g, "");
  const transcribedWords = cleanTranscribed.split(/\s+/).filter(w => w.length > 0);
  
  const aligned = alignWords(originalWords, transcribedWords);
  
  // Calculate scoring
  let correctCount = 0;
  let penaltyCount = 0;
  let totalOriginal = originalWords.length;
  
  aligned.forEach(item => {
    if (item.status === 'correct') {
      correctCount++;
    } else if (item.status === 'harakat_error') {
      correctCount += 0.8; // minor penalty
      penaltyCount += 0.2;
    } else if (item.status === 'missing') {
      penaltyCount += 1.0;
    } else if (item.status === 'extra') {
      penaltyCount += 0.5; // minor penalty for filler words
    }
  });
  
  const score = Math.max(0, Math.min(100, Math.round(((totalOriginal - penaltyCount) / totalOriginal) * 100)));
  
  let feedback = 'تلاوة ممتازة ما شاء الله!';
  if (score < 60) {
    feedback = 'تحتاج إلى مزيد من الحفظ والمراجعة. حاول الاستماع للشيخ وتكرار الآية.';
  } else if (score < 85) {
    feedback = 'أداء جيد، هناك بعض الأخطاء البسيطة. انتبه للكلمات المحددة باللون الأحمر.';
  } else if (score < 95) {
    feedback = 'قراءة رائعة! انتبه لبعض المخارج والحركات لتصل للاتقان.';
  }
  
  return {
    score,
    words: aligned,
    feedback
  };
}

// Sends audio recording to OpenAI Whisper API
export async function transcribeAudio(audioUri, apiKey) {
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  try {
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (!fileInfo.exists) {
      throw new Error('Audio file does not exist');
    }

    const formData = new FormData();
    // In React Native, we pass the file uri, name, and type in FormData
    formData.append('file', {
      uri: audioUri,
      name: 'recitation.m4a',
      type: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'ar');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to transcribe audio');
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Maps tajweed rule IDs to Arabic correction messages
const TAJWEED_CORRECTION_MESSAGES = {
  qalqalah: 'انتبه للقلقلة — يجب أن يهتز الصوت عند الحرف الساكن (ق، ط، ب، ج، د)',
  ghunnah:  'انتبه للغنة — يجب إخراج صوت الأنف بمقدار حركتين على النون أو الميم المشددتين',
  ikhfa:    'انتبه للإخفاء — لا تُظهر النون تماماً ولا تُدغمها، بل أخفِها مع إبقاء الغنة',
  idgham:   'انتبه للإدغام — يجب إدخال النون الساكنة في الحرف التالي حتى يصيرا حرفاً مشدداً',
  iqlab:    'انتبه للإقلاب — يجب تحويل النون الساكنة إلى ميم عند حرف الباء',
  izhar:    'انتبه للإظهار — يجب نطق النون الساكنة واضحة بلا غنة عند الحروف الحلقية',
  madd:     'انتبه للمد — يجب إطالة الصوت بالمقدار الصحيح (حركتان للطبيعي، أكثر للفرعي)',
  tafkheem: 'انتبه للتفخيم — يجب تغليظ الحرف حتى يمتلئ الفم بصداه',
};

// Analyzes recitation and returns tajweed-specific correction per word
export function analyzeTajweedCorrections(ayahWords, transcribedText) {
  const baseResult = evaluateRecitation(ayahWords, transcribedText || '');

  const corrections = [];
  const wordsWithRules = ayahWords.filter(w => w.rule && w.rule !== 'none');

  wordsWithRules.forEach(wordObj => {
    const matchedAligned = baseResult.words.find(w => {
      const norm1 = w.text?.replace(/[ً-ْٰ]/g, '').replace(/[أإآ]/g, 'ا');
      const norm2 = wordObj.text?.replace(/[ً-ْٰ]/g, '').replace(/[أإآ]/g, 'ا');
      return norm1 === norm2;
    });

    const wasMissed = !matchedAligned || matchedAligned.status === 'missing';
    corrections.push({
      word: wordObj.text,
      rule: wordObj.rule,
      status: wasMissed ? 'needs_attention' : 'ok',
      message: wasMissed ? TAJWEED_CORRECTION_MESSAGES[wordObj.rule] : null,
    });
  });

  return {
    ...baseResult,
    tajweedCorrections: corrections,
    tajweedIssues: corrections.filter(c => c.status === 'needs_attention'),
  };
}

// Generate realistic mock correction — accepts words array with rule info
export function getMockCorrection(ayahWordsOrText, index = 0) {
  // Accept either words array or plain text
  const originalWords = Array.isArray(ayahWordsOrText)
    ? ayahWordsOrText
    : ayahWordsOrText.split(/\s+/).map(w => ({ text: w, rule: 'none' }));

  if (index % 3 === 0) {
    return {
      score: 97,
      words: originalWords.map(w => ({ text: w.text ?? w, status: 'correct', rule: w.rule ?? 'none' })),
      feedback: 'تلاوة ممتازة ما شاء الله! أحكام التجويد مُطبَّقة بشكل صحيح.',
      tajweedErrors: [],
    };
  } else if (index % 3 === 1) {
    const wordsResult = originalWords.map((w, idx) => {
      const word = w.text ?? w;
      const rule = w.rule ?? 'none';
      if (idx === originalWords.length - 1) return { text: word, status: 'missing', rule };
      if (idx === 1 && originalWords.length > 3) return { text: word, status: 'tajweed_error', rule };
      return { text: word, status: 'correct', rule };
    });
    const tajweedErrors = wordsResult.filter(w => w.status === 'tajweed_error' && w.rule !== 'none');
    return {
      score: 72,
      words: wordsResult,
      feedback: 'أداء جيد! نسيت كلمة في النهاية وهناك خطأ في حكم التجويد للكلمة الملوّنة.',
      tajweedErrors,
    };
  } else {
    const wordsResult = [];
    originalWords.forEach((w, idx) => {
      const word = w.text ?? w;
      const rule = w.rule ?? 'none';
      if (idx === Math.floor(originalWords.length / 2)) {
        wordsResult.push({ text: word, status: 'tajweed_error', rule });
        wordsResult.push({ text: 'يعني', status: 'extra', rule: 'none' });
      } else if (idx === originalWords.length - 2) {
        wordsResult.push({ text: word, status: 'missing', rule });
      } else {
        wordsResult.push({ text: word, status: 'correct', rule });
      }
    });
    const tajweedErrors = wordsResult.filter(w => w.status === 'tajweed_error' && w.rule !== 'none');
    return {
      score: 60,
      words: wordsResult,
      feedback: 'تحتاج إلى مراجعة. انتبه للكلمات المحددة بإطار أحمر وتطبيق الأحكام الموضّحة أدناه.',
      tajweedErrors,
    };
  }
}
