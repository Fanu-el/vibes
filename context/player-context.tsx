import {
    createAudioPlayer,
    setAudioModeAsync,
    useAudioPlayerStatus,
} from "expo-audio";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

export interface PlayerTrack {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumName?: string;
  coverUrl?: string;
  streamUrl: string;
  duration: number; // seconds
}

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "error";

// ─── Global audio instance ────────────────────────────────────────────────────
const globalPlayer = createAudioPlayer(null);

setAudioModeAsync({
  playsInSilentMode: true,
  shouldPlayInBackground: true,
}).catch(console.error);

// ─── Context ──────────────────────────────────────────────────────────────────
interface PlayerContextValue {
  track: PlayerTrack | null;
  status: PlaybackStatus;
  positionMs: number;
  durationMs: number;
  play: (track: PlayerTrack) => void;
  togglePlayPause: () => void;
  seek: (ms: number) => Promise<void>;
  stop: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const playerStatus = useAudioPlayerStatus(globalPlayer);

  const status: PlaybackStatus = (() => {
    if (!track) return "idle";
    if (playerStatus.isBuffering && !playerStatus.isLoaded) return "loading";
    if (playerStatus.playing) return "playing";
    if (playerStatus.isLoaded) return "paused";
    return "idle";
  })();

  const positionMs = Math.floor((playerStatus.currentTime ?? 0) * 1000);
  const durationMs = Math.floor(
    (playerStatus.duration ?? track?.duration ?? 0) * 1000,
  );

  const play = useCallback((newTrack: PlayerTrack) => {
    setTrack(newTrack);
    globalPlayer.replace({ uri: newTrack.streamUrl });
    globalPlayer.play();
    globalPlayer.setActiveForLockScreen(true, {
      title: newTrack.title,
      artist: newTrack.artistName,
      albumTitle: newTrack.albumName,
      artworkUrl: newTrack.coverUrl,
    });
  }, []);

  const togglePlayPause = useCallback(() => {
    if (playerStatus.playing) {
      globalPlayer.pause();
    } else {
      globalPlayer.play();
    }
  }, [playerStatus.playing]);

  const seek = useCallback(async (ms: number) => {
    await globalPlayer.seekTo(ms / 1000);
  }, []);

  const stop = useCallback(() => {
    globalPlayer.pause();
    globalPlayer.replace(null as any);
    globalPlayer.clearLockScreenControls();
    setTrack(null);
  }, []);

  // Auto-clear when track finishes
  useEffect(() => {
    if (track && playerStatus.didJustFinish) {
      globalPlayer.clearLockScreenControls();
      setTrack(null);
    }
  }, [playerStatus.didJustFinish, track]);

  return (
    <PlayerContext.Provider
      value={{
        track,
        status,
        positionMs,
        durationMs,
        play,
        togglePlayPause,
        seek,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
