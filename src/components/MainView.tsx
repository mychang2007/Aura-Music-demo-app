import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, ArrowUpDown, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';
import { Track, Source } from '../types';
import { cn, formatTime } from '../lib/utils';
import axios from 'axios';
import { TopNav } from './TopNav';
import { db, OperationType, handleFirestoreError } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type SortField = 'title' | 'artist' | 'album' | 'duration' | 'addedAt';
type SortOrder = 'asc' | 'desc';

export const MainView: React.FC = () => {
  const { setCurrentTrack, setIsPlaying, setQueue, playlists, currentTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<Source | 'all'>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);

  // Sorting and Filtering State
  const [sortBy, setSortBy] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const addToPlaylist = useCallback(async (track: Track, playlistId: string) => {
    try {
      const pos = Date.now();
      await addDoc(collection(db, 'playlists', playlistId, 'tracks'), {
        ...track,
        addedAt: serverTimestamp(),
        position: pos
      });
      setShowPlaylistMenu(null);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `playlists/${playlistId}/tracks`);
    }
  }, []);

  useEffect(() => {
    const fetchInitial = async () => {
      setIsSearching(true);
      try {
        const response = await axios.get('/api/search?q=&type=all');
        setResults(response.data.results);
      } catch {
        // Fallback for demo if API fails
        const mockTracks: Track[] = [
          { id: '1', title: 'Manta', artist: 'Lexie Liu', duration: 222, album: 'The Gone Gold', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop', source: 'netease', genre: 'Electronic', mood: 'Futuristic', addedAt: Date.now() - 100000 },
          { id: '2', title: 'Fortnight', artist: 'Taylor Swift', duration: 228, album: 'TTPD', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop', source: 'spotify', genre: 'Pop', mood: 'Melancholy', addedAt: Date.now() - 50000 },
          { id: '3', title: 'Starboy', artist: 'The Weeknd', duration: 230, album: 'Starboy', cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop', source: 'youtube', genre: 'R&B', mood: 'Dark', addedAt: Date.now() - 10000 },
          { id: '4', title: 'Cruel Summer', artist: 'Taylor Swift', duration: 178, album: 'Lover', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', source: 'spotify', genre: 'Pop', mood: 'Energetic', addedAt: Date.now() - 200000 },
          { id: '5', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, album: 'After Hours', cover: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?w=300&h=300&fit=crop', source: 'spotify', genre: 'Synth-pop', mood: 'Energetic', addedAt: Date.now() - 300000 },
        ];
        setResults(mockTracks);
      } finally {
        setIsSearching(false);
      }
    };
    fetchInitial();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${activeSource}`);
      setResults(response.data.results);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setQueue(filteredAndSortedResults);
  };

  const filteredAndSortedResults = (() => {
    let output = [...results];

    // Filter by Genre
    if (filterGenre !== 'all') {
      output = output.filter(t => t.genre === filterGenre);
    }

    // Filter by Mood
    if (filterMood !== 'all') {
      output = output.filter(t => t.mood === filterMood);
    }

    // Sort
    output.sort((a, b) => {
      const field = sortBy as keyof Track;
      let valA = a[field];
      let valB = b[field];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        const sA = valA.toLowerCase();
        const sB = valB.toLowerCase();
        if (sA < sB) return sortOrder === 'asc' ? -1 : 1;
        if (sA > sB) return sortOrder === 'asc' ? 1 : -1;
      } else {
        // Fallback for numbers or mixed types
        const nA = typeof valA === 'number' ? valA : 0;
        const nB = typeof valB === 'number' ? valB : 0;
        if (nA < nB) return sortOrder === 'asc' ? -1 : 1;
        if (nA > nB) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return output;
  })();

  const genres = (() => {
    const g = new Set<string>();
    results.forEach(t => t.genre && g.add(t.genre));
    return ['all', ...Array.from(g)];
  })();

  const moods = (() => {
    const m = new Set<string>();
    results.forEach(t => t.mood && m.add(t.mood));
    return ['all', ...Array.from(m)];
  })();

  const sources: { id: Source | 'all', label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'netease', label: 'Netease Cloud' },
  ];

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex-1 pb-32">
      <TopNav />
      <div className="px-10 py-12">
        <div className="relative mb-16 min-h-[300px] flex flex-col justify-end">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.4em] mb-6 block drop-shadow-sm">Now Playing</span>
          {currentTrack ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={currentTrack.id}
              className="relative"
            >
              <h1 className="text-[9vw] lg:text-[140px] font-black leading-[0.82] tracking-tighter uppercase mb-6 drop-shadow-2xl">
                {currentTrack.title.split(' ')[0]}<br/>
                <span className="text-outline opacity-30">{currentTrack.title.split(' ').slice(1).join(' ') || 'CROSSOVER'}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-2xl font-light italic font-serif text-white/90">
                  By {currentTrack.artist} • <span className="text-orange-500">{currentTrack.source.charAt(0).toUpperCase() + currentTrack.source.slice(1)}</span>
                </div>
                <div className="hidden sm:block h-px w-32 bg-white/20"></div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 border border-white/20 rounded-full text-[10px] font-bold text-white/60 backdrop-blur-sm">DSD 256</span>
                  <span className="px-3 py-1 border border-white/20 rounded-full text-[10px] font-bold text-white/60 backdrop-blur-sm">24-BIT / 192KHZ</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h1 className="text-[9vw] lg:text-[140px] font-black leading-[0.82] tracking-tighter uppercase mb-6">
                DISCOVER<br/>
                <span className="text-outline opacity-20">SOUND</span>
              </h1>
              <p className="text-xl opacity-40 max-w-xl font-light leading-relaxed">Streaming across boundaries. Secure global tunneling to your favorite backends enabled.</p>
            </motion.div>
          )}
        </div>

        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
            <div className="flex items-center gap-4 flex-1">
              <form onSubmit={handleSearch} className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Search unified library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 px-12 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition-all font-medium placeholder:text-white/10"
                />
              </form>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "p-3.5 rounded-full border border-white/10 transition-all",
                  showFilters ? "bg-orange-500 text-white border-orange-500" : "bg-white/5 text-white/40 hover:text-white hover:border-white/30"
                )}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {sources.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSource(s.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border",
                    activeSource === s.id 
                      ? "bg-white text-black border-white shadow-xl shadow-white/5 scale-105" 
                      : "bg-transparent text-white/30 border-white/10 hover:border-white/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                       {(['title', 'artist', 'album', 'duration', 'addedAt'] as SortField[]).map(field => (
                         <button 
                          key={field}
                          onClick={() => handleSort(field)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all border",
                            sortBy === field ? "bg-white text-black border-white" : "bg-black/20 text-white/40 border-white/5 hover:border-white/20"
                          )}
                         >
                           {field.replace(/([A-Z])/g, ' $1')}
                           {sortBy === field && (
                             <span className="ml-2 text-orange-500">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                           )}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Genre</label>
                    <div className="flex flex-wrap gap-2">
                       {genres.map(g => (
                         <button 
                          key={g}
                          onClick={() => setFilterGenre(g)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all border",
                            filterGenre === g ? "bg-orange-500 text-white border-orange-500" : "bg-black/20 text-white/40 border-white/5 hover:border-white/20"
                          )}
                         >
                           {g}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Mood</label>
                    <div className="flex flex-wrap gap-2">
                       {moods.map(m => (
                         <button 
                          key={m}
                          onClick={() => setFilterMood(m)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all border",
                            filterMood === m ? "bg-orange-500 text-white border-orange-500" : "bg-black/20 text-white/40 border-white/5 hover:border-white/20"
                          )}
                         >
                           {m}
                         </button>
                       ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setFilterGenre('all'); setFilterMood('all'); }}
                    className="ml-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors py-2 px-4 border border-dashed border-white/10 rounded-lg"
                  >
                    <X className="w-3 h-3" /> Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
             <div className="grid grid-cols-[40px_2fr_1px_1.5fr_1fr_80px] items-center px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-white/20 border-b border-white/10 mb-6">
                <span className="cursor-pointer hover:text-white flex items-center gap-1" onClick={() => handleSort('title')}># {sortBy === 'title' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}</span>
                <span className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => handleSort('title')}>
                  Track details {sortBy === 'title' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}
                </span>
                <span />
                <span className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => handleSort('album')}>
                  Collection {sortBy === 'album' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}
                </span>
                <span className="cursor-pointer hover:text-white flex items-center gap-2" onClick={() => handleSort('artist')}>
                  Artist {sortBy === 'artist' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}
                </span>
                <span className="text-right cursor-pointer hover:text-white flex items-center justify-end gap-2" onClick={() => handleSort('duration')}>
                  Dur. {sortBy === 'duration' && <ArrowUpDown className="w-3 h-3 text-orange-500" />}
                </span>
             </div>
             
             {isSearching ? (
               <div className="flex items-center justify-center py-20 opacity-20">
                  <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               </div>
             ) : filteredAndSortedResults.map((track, i) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={track.id}
                  className="group relative"
                >
                  <div className="grid grid-cols-[40px_2fr_1px_1.5fr_1fr_80px] items-center px-4 py-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
                    <span className="text-[11px] font-mono text-white/10 group-hover:text-orange-500 transition-colors" onClick={() => playTrack(track)}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    
                    <div className="flex items-center gap-5 overflow-hidden" onClick={() => playTrack(track)}>
                      <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                        <img src={track.cover} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <div className="min-w-0 pr-4">
                        <p className="font-black text-sm uppercase tracking-tighter truncate group-hover:text-white transition-colors">{track.title}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest truncate mt-0.5">{track.artist}</p>
                      </div>
                    </div>

                    <div className="h-4 w-px bg-white/5" />

                    <span className="text-xs text-white/30 truncate pl-5 font-medium" onClick={() => playTrack(track)}>
                      {track.album || 'SINGLE'}
                    </span>
                    
                    <div className="flex items-center justify-between pl-4">
                       <div className="flex flex-col items-start gap-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border tracking-widest",
                            track.source === 'spotify' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            track.source === 'netease' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                            "bg-white/5 text-white/30 border-white/10"
                          )}>
                            {track.source}
                          </span>
                          {track.genre && (
                            <span className="text-[8px] opacity-20 group-hover:opacity-60 transition-opacity font-bold uppercase tracking-tighter">{track.genre} • {track.mood}</span>
                          )}
                       </div>

                       <div className="relative">
                         <button 
                          onClick={(e) => { e.stopPropagation(); setShowPlaylistMenu(showPlaylistMenu === track.id ? null : track.id); }}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-orange-500 hover:text-white rounded-full transition-all text-white/40"
                         >
                           <Plus className="w-4 h-4" />
                         </button>
                         
                         {showPlaylistMenu === track.id && (
                           <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 top-full mt-2 w-52 bg-[#0A0A0B] border border-white/10 rounded-xl py-3 z-50 shadow-2xl ring-1 ring-white/5"
                           >
                             <p className="px-4 py-1 text-[9px] text-white/20 uppercase font-black tracking-[0.2em] mb-2 border-b border-white/5 pb-2">Add to Collection</p>
                             <div className="max-h-48 overflow-y-auto custom-scrollbar">
                               {playlists.map(p => (
                                 <button 
                                   key={p.id}
                                   onClick={(e) => { e.stopPropagation(); addToPlaylist(track, p.id); }}
                                   className="w-full text-left px-4 py-2.5 text-[11px] font-bold hover:bg-orange-500 transition-colors uppercase tracking-tight"
                                 >
                                   {p.name}
                                 </button>
                               ))}
                             </div>
                             {playlists.length === 0 && (
                               <p className="px-4 py-2 text-[10px] italic text-white/20">No collections active</p>
                             )}
                           </motion.div>
                         )}
                       </div>
                    </div>

                    <span className="text-right text-xs text-white/20 font-mono group-hover:text-white transition-colors" onClick={() => playTrack(track)}>
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
