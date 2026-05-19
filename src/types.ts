export type Source = 'spotify' | 'youtube' | 'netease' | 'local';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  cover?: string;
  url?: string;
  source: Source;
  duration: number; // in seconds
  genre?: string;
  mood?: string;
  addedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}
