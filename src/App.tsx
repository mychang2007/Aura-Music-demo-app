/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { MainView } from './components/MainView';
import { AtmosphericBg } from './components/AtmosphericBg';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <div className="relative h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-orange-500/30">
          <AtmosphericBg />
          
          <div className="relative z-10 flex h-full">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-32">
              <MainView />
            </main>
          </div>

          <PlayerBar />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}
