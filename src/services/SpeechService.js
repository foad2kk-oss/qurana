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

// Generate realistic mock correction feedback for demonstration & offline practice
export function getMockCorrection(ayahText, index = 0) {
  const originalWords = ayahText.split(/\s+/);
  
  // Create different mock error profiles based on index
  if (index % 3 === 0) {
    // Perfect score
    return {
      score: 100,
      words: originalWords.map(w => ({ text: w, status: 'correct', rule: 'none' })),
      feedback: 'تلاوة ممتازة ما شاء الله! لقد قرأت الآية بشكل صحيح وتطبيق رائع للتحسين.'
    };
  } else if (index % 3 === 1) {
    // Missing last word, and a harakat warning
    const wordsResult = originalWords.map((w, idx) => {
      if (idx === originalWords.length - 1) {
        return { text: w, status: 'missing', rule: 'none' };
      }
      if (idx === 0 && originalWords.length > 2) {
        return { text: w, status: 'harakat_error', userText: w.substring(0, w.length - 1), rule: 'none' };
      }
      return { text: w, status: 'correct', rule: 'none' };
    });
    
    return {
      score: 75,
      words: wordsResult,
      feedback: 'أداء جيد! لقد نسيت الكلمة الأخيرة، وهناك خطأ بسيط في حركة الكلمة الأولى.'
    };
  } else {
    // Extra word inserted and middle word missing
    const wordsResult = [];
    originalWords.forEach((w, idx) => {
      if (idx === Math.floor(originalWords.length / 2)) {
        wordsResult.push({ text: w, status: 'missing', rule: 'none' });
        wordsResult.push({ text: 'يعني', status: 'extra', rule: 'none' }); // Insert extra filler word
      } else {
        wordsResult.push({ text: w, status: 'correct', rule: 'none' });
      }
    });

    return {
      score: 65,
      words: wordsResult,
      feedback: 'تحتاج إلى تثبيت الحفظ. لقد تركت كلمة في المنتصف وأضفت كلمة زائدة ("يعني").'
    };
  }
}
