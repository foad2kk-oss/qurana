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

  // Recording State
  const [isRecording, setIsRecording]               = useState(false);
  const [recording, setRecording]                   = useState(null);
  const [recordedUri, setRecordedUri]               = useState(null);
  const [isPlaybackUserVoice, setIsPlaybackUserVoice] = useState(false);
  const [userVoiceSound, setUserVoiceSound]         = useState(null);

  // Playback Range
  const [ayahRange, setAyahRange] = useState({ start: 1, end: 7 });

  // Internal refs
  const soundRef           = useRef(null);
  const playbackSpeedRef   = useRef(1.0);
  const isStopping         = useRef(false); // guard against re-entrance

  // ── Queue-based sequential playback ──────────────────────────────────────
  // queue: flat array of { surahId, ayahNum, qariId } objects to play in order
  const queueRef          = useRef([]);
  const queueIndexRef     = useRef(0);
  const groupRepRef       = useRef(1);
  const repCountRef       = useRef(3);

  useEffect(() => { repCountRef.current = repetitionCount; }, [repetitionCount]);
  useEffect(() => { playbackSpeedRef.current = playbackSpeed; }, [playbackSpeed]);

  // ── Audio mode setup ──────────────────────────────────────────────────────
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldRouteThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    return () => { unloadSound(); unloadUserVoice(); };
  }, []);

  // ── Sound helpers ─────────────────────────────────────────────────────────
  const unloadSound = async () => {
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

  // ── Core: play one item from the queue ────────────────────────────────────
  const playQueueItem = useCallback(async (item) => {
    isStopping.current = false;
    setIsLoading(true);
    await unloadSound();

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
          if (!status || isStopping.current) return;
          // Reliable finish detection: loaded + not playing + reached end
          const finished =
            status.didJustFinish ||
            (status.isLoaded && !status.isPlaying && !status.isBuffering &&
             status.durationMillis && status.positionMillis >= status.durationMillis - 200);
          if (finished) {
            onCurrentAyahFinished();
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
  }, []);

  // ── Called when the playing ayah finishes ─────────────────────────────────
  const onCurrentAyahFinished = useCallback(async () => {
    if (isStopping.current) return;
    isStopping.current = true; // prevent double-fire

    const nextIndex = queueIndexRef.current + 1;

    if (nextIndex < queueRef.current.length) {
      queueIndexRef.current = nextIndex;
      const next = queueRef.current[nextIndex];
      // Update group rep display when we restart from the beginning of a pass
      if (next._groupPass !== undefined) {
        groupRepRef.current = next._groupPass;
        setGroupRepetition(next._groupPass);
      }
      // slight delay so the sound fully unloads before next load
      setTimeout(() => playQueueItem(next), 100);
    } else {
      // All done
      setIsPlaying(false);
      setGroupRepetition(1);
      groupRepRef.current = 1;
      await unloadSound();
    }
  }, [playQueueItem]);

  // ── Build the queue and start playing ─────────────────────────────────────
  const playGroup = useCallback((surahId, rangeStart, rangeEnd, qariId = currentQari) => {
    const repCount = repCountRef.current;
    const queue = [];

    for (let pass = 1; pass <= repCount; pass++) {
      for (let ayah = rangeStart; ayah <= rangeEnd; ayah++) {
        queue.push({ surahId, ayahNum: ayah, qariId, _groupPass: pass });
      }
    }

    queueRef.current    = queue;
    queueIndexRef.current = 0;
    groupRepRef.current = 1;
    setGroupRepetition(1);

    if (queue.length > 0) {
      playQueueItem(queue[0]);
    }
  }, [currentQari, playQueueItem]);

  // ── Play single ayah (manual navigation) ──────────────────────────────────
  const playAyah = useCallback(async (surahId, ayahNum, qariId = currentQari, forceStart = true) => {
    // Single-ayah play clears the queue
    queueRef.current = [{ surahId, ayahNum, qariId: qariId || currentQari, _groupPass: 1 }];
    queueIndexRef.current = 0;
    groupRepRef.current = 1;
    setGroupRepetition(1);
    if (forceStart) {
      await playQueueItem({ surahId, ayahNum, qariId: qariId || currentQari });
    }
  }, [currentQari, playQueueItem]);

  // ── Pause / Resume ────────────────────────────────────────────────────────
  const pauseSound = async () => {
    isStopping.current = true;
    if (soundRef.current) {
      try { await soundRef.current.pauseAsync(); } catch (_) {}
    }
    setIsPlaying(false);
  };

  const resumeSound = async () => {
    isStopping.current = false;
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } catch (_) {}
    } else if (queueRef.current.length > 0) {
      const item = queueRef.current[queueIndexRef.current];
      if (item) playQueueItem(item);
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
      try { await userVoiceSound.stopAsync(); setIsPlaybackUserVoice(false); } catch (_) {}
    }
  };

  return (
    <AudioContext.Provider value={{
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
    }}>
      {children}
    </AudioContext.Provider>
  );
};
