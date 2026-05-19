import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy search for music sources
  app.get("/api/search", async (req, res) => {
    const { q, type = "all" } = req.query;
    const query = (q as string) || "";
    
    // Simulating results from different sources
    const mockTracks = [
      {
        id: "1",
        title: query ? `${query} (Radio Edit)` : "Moonlight Sonata",
        artist: "Lethal Bizzle",
        album: "Dench",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&h=300&fit=crop",
        source: "spotify",
        duration: 215,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      },
      {
        id: "2",
        title: query ? `${query} - Live` : "Midnight City",
        artist: "M83",
        album: "Hurry Up, We're Dreaming",
        cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&h=300&fit=crop",
        source: "youtube",
        duration: 243,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
      },
      {
        id: "3",
        title: query ? `周杰伦 - ${query}` : "告白气球",
        artist: "周杰伦 (Jay Chou)",
        album: "周杰伦的床边故事",
        cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=300&h=300&fit=crop",
        source: "netease",
        duration: 210,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
      },
      {
        id: "4",
        title: query ? `${query} (Remix)` : "Starlight",
        artist: "Muse",
        album: "Black Holes and Revelations",
        cover: "https://images.unsplash.com/photo-1514525253361-bee8d4a9ed9b?w=300&h=300&fit=crop",
        source: "spotify",
        duration: 240,
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
      }
    ];

    let results = mockTracks;
    if (type !== "all") {
      results = mockTracks.filter(t => t.source === type);
    }

    // Delay to simulate network
    setTimeout(() => {
      res.json({ results });
    }, 800);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
