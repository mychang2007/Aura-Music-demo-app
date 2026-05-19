import React from 'react';
import { Home, Search, Library, PlusCircle, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { db, auth, OperationType, handleFirestoreError } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const Sidebar: React.FC = () => {
  const { playlists } = usePlayer();

  const handleCreatePlaylist = async () => {
    if (!auth.currentUser) {
      alert("Please sign in to create playlists");
      return;
    }

    try {
      await addDoc(collection(db, 'playlists'), {
        name: "My New Playlist",
        ownerId: auth.currentUser.uid,
        isPublic: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'playlists');
    }
  };

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col p-6 space-y-8 bg-black/20 backdrop-blur-xl hidden md:flex">
      <div className="text-2xl font-black tracking-tighter italic uppercase text-white">CROSSover</div>

      <nav className="space-y-6">
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-bold">Library</h3>
          <ul className="space-y-3 font-medium text-sm">
            <li className="flex items-center gap-2 text-orange-500 cursor-pointer hover:opacity-80">
              <Home className="w-4 h-4" /> Browse Global
            </li>
            <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer">
              <Search className="w-4 h-4" /> Search
            </li>
            <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer">
              <Library className="w-4 h-4" /> Playlists
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-bold">Integrations</h3>
          <ul className="space-y-3 font-medium text-sm">
            <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> Netease Cloud
            </li>
            <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div> Spotify
            </li>
            <li className="flex items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div> YouTube
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Your Playlists</h3>
              <button 
                onClick={handleCreatePlaylist}
                className="text-white/30 hover:text-white transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
           </div>
           <div className="space-y-2 overflow-y-auto max-h-[30vh] custom-scrollbar pr-2">
              <button className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-colors w-full text-left truncate">
                <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> Liked Songs
              </button>
              {playlists.map(p => (
                <button key={p.id} className="text-sm opacity-40 hover:opacity-100 transition-colors block w-full text-left truncate">
                  {p.name}
                </button>
              ))}
           </div>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group hover:border-orange-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">VPN Tunnel</span>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse"></div>
          </div>
          <div className="text-xs opacity-60 font-mono">Region: Mainland China</div>
          <div className="text-[10px] mt-1 font-mono opacity-40 uppercase tracking-tighter">Latency: 42ms • Secure</div>
          <button className="w-full mt-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-[0.1em] rounded-lg hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 shadow-lg shadow-white/5">
            Switch Node
          </button>
        </div>
      </div>
    </aside>
  );
};
