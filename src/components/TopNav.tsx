import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const TopNav: React.FC = () => {
  const [vpnActive, setVpnActive] = React.useState(true);
  const { user, login, logout } = useAuth();

  return (
    <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-40">
      <div className="flex gap-4">
        <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 transition-colors">&lt;</button>
        <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center opacity-30 font-bold cursor-not-allowed">&gt;</button>
        
        <div className="hidden lg:flex items-center gap-3 ml-4">
           <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
            vpnActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", vpnActive ? "bg-green-400 animate-pulse" : "bg-white/20")} />
            PROXY: {vpnActive ? 'OPTIMIZED' : 'DIRECT'}
          </div>
          <button 
            onClick={() => setVpnActive(!vpnActive)}
            className="text-[9px] text-white/30 hover:text-white uppercase tracking-widest font-bold"
          >
            Switch
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
        </button>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">{user.displayName || 'Demo User'}</p>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Pro Member</p>
            </div>
            <div className="relative group">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-white/20 shadow-lg object-cover cursor-pointer hover:border-orange-500 transition-colors"
              />
              <div className="absolute right-0 top-full mt-2 w-40 bg-black border border-white/10 rounded-xl py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => login()}
            className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all transform active:scale-95"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
