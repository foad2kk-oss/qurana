import React, { createContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { getAudioUrl } from '../services/QuranData';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying]               = useState(false);
  const [currentSurah, setCurrentSurah]         = useState(null);
  const [currentAyah, setCurrentAyah]           = useState(null);
  const [currentQari, setCurrentQari]           = useState('husary');
  const [repetitionCount, setRepetitionCount]   = useState(3);   // times to repeat the whole group
  const [groupRepetition, setGroupRepetition]   = useState(1);   // current group pass
  const [playbackSpeed, setPlaybackSpeed]       = useState(1.0);
  const [isLoading, setIsLoading]               = useState(false);

  // Recording State
  const [isRecording, setIsRecording]           = useState(false);
  const [recording, setRecording]               = useState(null);
  const [recordedUri, setRecordedUri]           = useState(null);
  const [isPlaybackUserVoice, setIsPlaybackUserVoice] = useState(false);
  const [userVoiceSound, setUserVoiceSound]     = useState(null);

  // Playback Range State
  const [ayahRange, setAyahRange]               = useState({ start: 1, end: 7 });

  const soundRef = useRef(null);

  // ── Refs to avoid stale-closure bugs inside callbacks ──────────────────────
  const currentAyahRef      = useRef(null);
  const currentSurahRef     = useRef(null);
  const currentQariRef      = useRef('husary');
  const ayahRangeRef        = useRef({ start: 1, end: 7 });
  const repetitionCountRef  = useRef(3);
  const groupRepetitionRef  = useRef(1);
  const playbackSpeedRef    = useRef(1.0);

  useEffect(() => { currentAyahRef.current    = currentAyah;      }, [currentAyah]);
  useEffect(() => { currentSurahRef.current   = currentSurah;     }, [currentSurah]);
  useEffect(() => { currentQariRef.current    = currentQari;      }, [currentQari]);
  useEffect(() => { ayahRangeRef.current      = ayahRange;        }, [ayahRange]);
  useEffect(() => { repetitionCountRef.current = repetitionCount; }, [repetitionCount]);
  useEffect(() => { groupRepetitionRef.current = groupRepetition; }, [groupRepetition]);
  useEffect(() => { playbackSpeedRef.current  = playbackSpeed;    }, [playbackSpeed]);
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldRouteThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    return () => {
      unloadSound();
      unloadUserVoice();
    };
  }, []);

  const unloadSound = async () => {
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (e) {}
      soundRef.current = null;
    }
  };

  const unloadUserVoice = async () => {
    if (userVoiceSound) {
      try { await userVoiceSound.unloadAsync(); } catch (e) {}
      setUserVoiceSound(null);
    }
  };

  // ── Play a single Ayah ─────────────────────────────────────────────────────
  const playAyah = async (surahId, ayahNum, qariId = currentQariRef.current, forceStart = true) => {
    setIsLoading(true);
    await unloadSound();

    setCurrentSurah(surahId);
    setCurrentAyah(ayahNum);
    currentAyahRef.current  = ayahNum;
    currentSurahRef.current = surahId;

    const url = getAudioUrl(qariId, surahId, ayahNum);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: forceStart, rate: playbackSpeedRef.current, shouldCorrectPitch: true },
        onPlaybackStatusUpdate,
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

  // ── Play the whole group from start (resets group counter) ─────────────────
  const playGroup = (surahId, rangeStart, qariId = currentQariRef.current) => {
    groupRepetitionRef.current = 1;
    setGroupRepetition(1);
    playAyah(surahId, rangeStart, qariId, true);
  };

  // ── Called when an ayah finishes ──────────────────────────────────────────
  const onPlaybackStatusUpdate = (status) => {
    if (!status) return;
    if (status.didJustFinish && !status.isLooping) {
      handleAyahCompletion();
    }
  };

  const handleAyahCompletion = async () => {
    const ayah        = currentAyahRef.current;
    const range       = ayahRangeRef.current;
    const surah       = currentSurahRef.current;
    const qari        = currentQariRef.current;
    const groupRep    = groupRepetitionRef.current;
    const repCount    = repetitionCountRef.current;

    if (ayah < range.end) {
      // Advance to next ayah in range
      playAyah(surah, ayah + 1, qari, true);
    } else {
      // End of range — check if we still have group repeats left
      if (groupRep < repCount) {
        const next = groupRep + 1;
        groupRepetitionRef.current = next;
        setGroupRepetition(next);
        playAyah(surah, range.start, qari, true);
      } else {
        // All done
        groupRepetitionRef.current = 1;
        setGroupRepetition(1);
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
      } catch (e) {}
    }
  };

  const resumeSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (e) {}
    } else if (currentSurahRef.current && currentAyahRef.current) {
      playAyah(currentSurahRef.current, currentAyahRef.current, currentQariRef.current, true);
    }
  };

  const setSpeed = async (speed) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (soundRef.current) {
      try { await soundRef.current.setRateAsync(speed, true); } catch (e) {}
    }
  };

  // ── Recording ─────────────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') return false;
      if (isPlaying) await pauseSound();
      await unloadUserVoice();
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
      if (status.canRecord) await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true },
        (status) => { if (status.didJustFinish) setIsPlaybackUserVoice(false); }
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
      } catch (e) {}
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
        stopRecordedVoice,
        isPlaybackUserVoice,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
