import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track, Playlist } from '../types';
import { db, auth, OperationType, handleFirestoreError } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  queue: Track[];
  setQueue: (tracks: Track[]) => void;
  playlists: Playlist[];
  setPlaylists: (playlists: Playlist[]) => void;
  volume: number;
  setVolume: (v: number) => void;
  progress: number;
  setProgress: (p: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setPlaylists([]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'playlists'), 
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p: Playlist[] = [];
      snapshot.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() } as Playlist);
      });
      setPlaylists(p);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'playlists');
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.url || '';
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error", e));
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback error", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < queue.length - 1) {
      setCurrentTrack(queue[currentIndex + 1]);
    } else {
      setCurrentTrack(queue[0]);
    }
  }, [currentTrack, queue]);

  const playPrevious = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      setCurrentTrack(queue[currentIndex - 1]);
    } else {
      setCurrentTrack(queue[queue.length - 1]);
    }
  }, [currentTrack, queue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress(audio.currentTime);
    const handleEnd = () => playNext();

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnd);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [playNext]);

  return (
    <PlayerContext.Provider value={{
      currentTrack, setCurrentTrack,
      isPlaying, setIsPlaying,
      queue, setQueue,
      playlists, setPlaylists,
      volume, setVolume,
      progress, setProgress,
      playNext, playPrevious,
      audioRef
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
