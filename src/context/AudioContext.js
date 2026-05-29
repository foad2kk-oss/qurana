import React, { createContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getAudioUrl } from '../services/QuranData';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState(null);
  const [currentAyah, setCurrentAyah] = useState(null);
  const [currentQari, setCurrentQari] = useState('husary');
  const [repetitionCount, setRepetitionCount] = useState(3);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isPlaybackUserVoice, setIsPlaybackUserVoice] = useState(false);
  const [userVoiceSound, setUserVoiceSound] = useState(null);

  // Playback Range State
  const [ayahRange, setAyahRange] = useState({ start: 1, end: 7 });

  const soundRef = useRef(null);

  useEffect(() => {
    // Enable audio on iOS (even when in silent mode) and Android
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldRouteThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });

    return () => {
      // Cleanup sounds
      unloadSound();
      unloadUserVoice();
    };
  }, []);

  const unloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('Error unloading sound:', e);
      }
      soundRef.current = null;
    }
  };

  const unloadUserVoice = async () => {
    if (userVoiceSound) {
      try {
        await userVoiceSound.unloadAsync();
      } catch (e) {
        console.log('Error unloading user voice:', e);
      }
      setUserVoiceSound(null);
    }
  };

  // Play a specific Ayah
  const playAyah = async (surahId, ayahNum, qariId = currentQari, forceStart = true) => {
    setIsLoading(true);
    await unloadSound();
    
    setCurrentSurah(surahId);
    setCurrentAyah(ayahNum);
    
    const url = getAudioUrl(qariId, surahId, ayahNum);
    
    try {
      // Force playback through main speaker on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: forceStart, rate: playbackSpeed, shouldCorrectPitch: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(forceStart);
    } catch (error) {
      console.error('Error creating sound:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Track playback status updates to implement the repeat logic
  const onPlaybackStatusUpdate = async (status) => {
    if (!status) return;
    
    if (status.didJustFinish && !status.isLooping) {
      handleAyahCompletion();
    }
  };

  const handleAyahCompletion = async () => {
    // Check if we need to repeat the current Ayah again
    if (currentRepetition < repetitionCount) {
      setCurrentRepetition(prev => prev + 1);
      if (soundRef.current) {
        try {
          await soundRef.current.setPositionAsync(0);
          await soundRef.current.playAsync();
        } catch (e) {
          console.log('Error repeating ayah:', e);
        }
      }
    } else {
      // Moving to the next Ayah in range
      setCurrentRepetition(1);
      if (currentAyah < ayahRange.end) {
        const nextAyah = currentAyah + 1;
        playAyah(currentSurah, nextAyah, currentQari, true);
      } else {
        // Range completed
        setIsPlaying(false);
        await unloadSound();
      }
    }
  };

  const pauseSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (e) {
        console.log('Error pausing sound:', e);
      }
    }
  };

  const resumeSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (e) {
        console.log('Error resuming sound:', e);
      }
    } else if (currentSurah && currentAyah) {
      playAyah(currentSurah, currentAyah, currentQari, true);
    }
  };

  const setSpeed = async (speed) => {
    setPlaybackSpeed(speed);
    if (soundRef.current) {
      try {
        await soundRef.current.setRateAsync(speed, true);
      } catch (e) {
        console.log('Error setting playback speed:', e);
      }
    }
  };

  // --- RECORDING CONTROLS ---

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return false;

      // Stop recitation if playing
      if (isPlaying) {
        await pauseSound();
      }

      await unloadUserVoice();

      // Configure recorder settings for high quality vocal recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordedUri(null);
      return true;
    } catch (err) {
      console.error('Failed to start recording', err);
      return false;
    }
  };

  const stopRecording = async () => {
    if (!recording) return null;
    setIsRecording(false);
    try {
      const status = await recording.getStatusAsync();
      if (status.canRecord) {
        await recording.stopAndUnloadAsync();
      }
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      
      // Immediately reset audio mode to allow speaker playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      
      return uri;
    } catch (error) {
      console.error('Failed to stop recording', error);
      try {
        const uri = recording.getURI();
        setRecording(null);
        return uri;
      } catch (e) {
        setRecording(null);
        return null;
      }
    }
  };

  const playRecordedVoice = async () => {
    if (!recordedUri) return;
    setIsLoading(true);
    await unloadUserVoice();

    try {
      // Force playback through main speaker on iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) {
            setIsPlaybackUserVoice(false);
          }
        }
      );
      setUserVoiceSound(sound);
      setIsPlaybackUserVoice(true);
    } catch (e) {
      console.error('Failed to play user voice:', e);
      setIsPlaybackUserVoice(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopRecordedVoice = async () => {
    if (userVoiceSound) {
      try {
        await userVoiceSound.stopAsync();
        setIsPlaybackUserVoice(false);
      } catch (e) {
        console.log('Error stopping user voice:', e);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSurah,
        currentAyah,
        currentQari,
        setCurrentQari,
        repetitionCount,
        setRepetitionCount,
        currentRepetition,
        setCurrentRepetition,
        playbackSpeed,
        setSpeed,
        isLoading,
        playAyah,
        pauseSound,
        resumeSound,
        unloadSound,
        
        // Ranges
        ayahRange,
        setAyahRange,

        // Recording
        isRecording,
        recordedUri,
        startRecording,
        stopRecording,
        playRecordedVoice,
        stopRecordedVoice,
        isPlaybackUserVoice,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
