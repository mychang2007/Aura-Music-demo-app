import React, { useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, VolumeX, ListMusic, Maximize2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../lib/utils';
import { motion } from 'motion/react';

export const PlayerBar: React.FC = () => {
  const { 
    currentTrack, isPlaying, setIsPlaying, 
    progress, setProgress, volume, setVolume,
    playNext, playPrevious, audioRef
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const prevVolume = useRef(volume);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/40 backdrop-blur-2xl border-t border-white/5 flex items-center justify-center text-white/20 text-sm">
        No track selected
      </div>
    );
  }

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentTrack || !audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const pct = x / bounds.width;
    const newTime = pct * currentTrack.duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0B]/95 backdrop-blur-2xl border-t border-white/10 px-10 flex items-center justify-between z-50">
      {/* Track Info */}
      <div className="flex items-center gap-5 w-[30%]">
        <div className="w-14 h-14 bg-white/10 rounded-lg overflow-hidden shadow-2xl group relative cursor-pointer">
          <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="min-w-0 pr-4">
          <div className="text-sm font-black uppercase tracking-tighter truncate text-white mb-0.5">{currentTrack.title}</div>
          <div className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] truncate">{currentTrack.artist}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-3 flex-1 max-w-2xl px-8">
        <div className="flex items-center gap-10">
          <button className="text-white/20 hover:text-white transition-all transform active:scale-90">
            <Shuffle className="w-3.5 h-3.5" />
          </button>
          <button onClick={playPrevious} className="text-white opacity-40 hover:opacity-100 transition-all transform active:scale-90">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-white opacity-40 hover:opacity-100 transition-all transform active:scale-90">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="text-white/20 hover:text-white transition-all transform active:scale-90">
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-full flex items-center gap-3 text-[10px] font-mono text-white/40">
          <span className="w-10 text-right">{formatTime(progress)}</span>
          <div 
            onClick={onSeek}
            className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden group cursor-pointer"
          >
            <motion.div 
              className="absolute left-0 top-0 bottom-0 bg-orange-500 group-hover:bg-orange-400 transition-colors"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / currentTrack.duration) * 100}%` }}
            />
          </div>
          <span className="w-10">{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="flex justify-end items-center gap-8 w-[30%]">
        <button className="text-white/30 hover:text-white transition-colors">
          <ListMusic className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-3 group w-32">
          <button onClick={toggleMute} className="text-white/40 group-hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden hidden sm:block">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/60 group-hover:opacity-100" 
              style={{ width: `${volume * 100}%` }} 
            />
          </div>
        </div>

        <button className="px-3 py-1.5 border border-white/20 rounded text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white hover:text-black hover:border-white transition-all">
          High-Res
        </button>
      </div>
    </footer>
  );
};
