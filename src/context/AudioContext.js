import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { getAudioUrl } from '../services/QuranData';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [isPlaying, setIsPlaying]             = useState(false);
  const [currentSurah, setCurrentSurah]       = useState(null);
  const [currentAyah, setCurrentAyah]         = useState(null);
  const [currentQari, setCurrentQari]         = useState('husary');
  const [repetitionCount, setRepetitionCount] = useState(3);
  const [groupRepetition, setGroupRepetition] = useState(1);
  const [playbackSpeed, setPlaybackSpeed]     = useState(1.0);
  const [isLoading, setIsLoading]             = useState(false);

  // Recording
  const [isRecording, setIsRecording]               = useState(false);
  const [recording, setRecording]                   = useState(null);
  const [recordedUri, setRecordedUri]               = useState(null);
  const [isPlaybackUserVoice, setIsPlaybackUserVoice] = useState(false);
  const [userVoiceSound, setUserVoiceSound]         = useState(null);

  const [ayahRange, setAyahRange] = useState({ start: 1, end: 5 });

  // ── Refs ──────────────────────────────────────────────────────────────────
  const soundRef          = useRef(null);
  const playbackSpeedRef  = useRef(1.0);
  const repCountRef       = useRef(3);
  const currentQariRef    = useRef('husary'); // always up-to-date qari
  // Each new sound gets a unique ID; stale callbacks check against it
  const activeSoundIdRef  = useRef(0);
  // Queue
  const queueRef          = useRef([]);
  const queueIndexRef     = useRef(0);

  useEffect(() => { repCountRef.current      = repetitionCount; }, [repetitionCount]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed;   }, [playbackSpeed]);
  useEffect(() => { currentQariRef.current   = currentQari;     }, [currentQari]);

  // Wrapper: update ref immediately + reset playback so new qari takes effect on next Play
  const handleSetCurrentQari = async (qariId) => {
    currentQariRef.current = qariId;
    setCurrentQari(qariId);
    // Clear queue and unload old sound → next Play starts fresh with new qari
    queueRef.current      = [];
    queueIndexRef.current = 0;
    await unloadSound();
    setIsPlaying(false);
    setCurrentAyah(null);
    setCurrentSurah(null);
  };

  // ── Setup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldRouteThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    return () => { unloadSound(); unloadUserVoice(); };
  }, []);

  const unloadSound = async () => {
    // Invalidate any active sound before unloading so its callbacks are ignored
    activeSoundIdRef.current = activeSoundIdRef.current + 1000;
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (_) {}
      soundRef.current = null;
    }
  };

  const unloadUserVoice = async () => {
    if (userVoiceSound) {
      try { await userVoiceSound.unloadAsync(); } catch (_) {}
      setUserVoiceSound(null);
    }
  };

  // ── Move to next item in queue ────────────────────────────────────────────
  const advanceQueue = useCallback(async () => {
    const nextIndex = queueIndexRef.current + 1;
    if (nextIndex < queueRef.current.length) {
      queueIndexRef.current = nextIndex;
      const next = queueRef.current[nextIndex];
      if (next._groupPass !== undefined) {
        setGroupRepetition(next._groupPass);
      }
      // Small delay to let the previous sound fully release
      setTimeout(() => _loadAndPlay(next), 30);
    } else {
      setIsPlaying(false);
      setGroupRepetition(1);
      await unloadSound();
    }
  }, []);

  // ── Load & play one queue item ────────────────────────────────────────────
  const _loadAndPlay = useCallback(async (item) => {
    setIsLoading(true);
    await unloadSound();

    // Each sound gets a unique ID captured in its closure
    const mySoundId = ++activeSoundIdRef.current;

    setCurrentSurah(item.surahId);
    setCurrentAyah(item.ayahNum);

    const url = getAudioUrl(item.qariId, item.surahId, item.ayahNum);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldRouteThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, rate: playbackSpeedRef.current, shouldCorrectPitch: true },
        (status) => {
          // Ignore callbacks from sounds that are no longer active
          if (activeSoundIdRef.current !== mySoundId) return;
          if (status.didJustFinish) {
            // Invalidate this sound's ID so duplicate callbacks are ignored
            activeSoundIdRef.current = mySoundId + 0.5;
            advanceQueue();
          }
        },
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.error('Error playing ayah:', err);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [advanceQueue]);

  // ── Public: play the whole group N times ──────────────────────────────────
  const playGroup = useCallback((surahId, rangeStart, rangeEnd, qariId) => {
    const qari = qariId || currentQariRef.current;
    const repCount = repCountRef.current;
    const queue = [];
    for (let pass = 1; pass <= repCount; pass++) {
      for (let ayah = rangeStart; ayah <= rangeEnd; ayah++) {
        queue.push({ surahId, ayahNum: ayah, qariId: qari, _groupPass: pass });
      }
    }
    queueRef.current      = queue;
    queueIndexRef.current = 0;
    setGroupRepetition(1);
    if (queue.length > 0) _loadAndPlay(queue[0]);
  }, [_loadAndPlay]);

  // ── Public: play a single ayah (manual nav) ───────────────────────────────
  const playAyah = useCallback(async (surahId, ayahNum, qariId, forceStart = true) => {
    const qari = qariId || currentQariRef.current;
    const item = { surahId, ayahNum, qariId: qari, _groupPass: 1 };
    queueRef.current      = [item];
    queueIndexRef.current = 0;
    setGroupRepetition(1);
    if (forceStart) _loadAndPlay(item);
  }, [_loadAndPlay]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const pauseSound = async () => {
    // Prevent advanceQueue from firing while paused
    activeSoundIdRef.current = activeSoundIdRef.current + 0.1;
    if (soundRef.current) {
      try { await soundRef.current.pauseAsync(); } catch (_) {}
    }
    setIsPlaying(false);
  };

  const resumeSound = async () => {
    if (soundRef.current) {
      // Re-register a fresh sound ID so completion callbacks work again
      const mySoundId = ++activeSoundIdRef.current;
      try {
        await soundRef.current.setOnPlaybackStatusUpdate((status) => {
          if (activeSoundIdRef.current !== mySoundId) return;
          if (status.didJustFinish) {
            activeSoundIdRef.current = mySoundId + 0.5;
            advanceQueue();
          }
        });
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (_) {}
    } else if (queueRef.current.length > 0) {
      _loadAndPlay(queueRef.current[queueIndexRef.current]);
    }
  };

  const setSpeed = async (speed) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (soundRef.current) {
      try { await soundRef.current.setRateAsync(speed, true); } catch (_) {}
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
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
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
    } catch (err) {
      console.error('Failed to stop recording', err);
      try { const uri = recording.getURI(); setRecording(null); return uri; }
      catch (_) { setRecording(null); return null; }
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
        (s) => { if (s.didJustFinish) setIsPlaybackUserVoice(false); }
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
      try { await userVoiceSound.stopAsync(); setIsPlaybackUserVoice(false); } catch (_) {}
    }
  };

  return (
    <AudioContext.Provider value={{
      isPlaying, currentSurah, currentAyah,
      currentQari, setCurrentQari: handleSetCurrentQari,
      repetitionCount, setRepetitionCount,
      groupRepetition,
      playbackSpeed, setSpeed,
      isLoading,
      playAyah, playGroup,
      pauseSound, resumeSound, unloadSound,
      ayahRange, setAyahRange,
      isRecording, recordedUri,
      startRecording, stopRecording,
      playRecordedVoice, stopRecordedVoice,
      isPlaybackUserVoice,
    }}>
      {children}
    </AudioContext.Provider>
  );
};
