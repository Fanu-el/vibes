import { musicMeApi } from "@/features/music-me/music-me-api";
import { store } from "@/store";
import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayerStatus,
} from "expo-audio";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import {
  useAuthState,
  getPlaybackPosition,
  savePlaybackPosition,
} from "@/hooks/use-storage";

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
}).catch(() => {});

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
export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const playerStatus = useAudioPlayerStatus(globalPlayer);
  const isAuthenticated = useAuthState();

  // Fetch recently played to restore on app start
  const { data: recentlyPlayed } = musicMeApi.endpoints.getRecentlyPlayed.useQuery(undefined, {
    skip: !isAuthenticated,
  });

  const initialLoadDone = useRef(false);

  // 1. Restore previous playback session on app start
  useEffect(() => {

    
    if (initialLoadDone.current || !recentlyPlayed || recentlyPlayed.length === 0 || track) return;
    initialLoadDone.current = true;

    async function restoreSession() {
      const recent = recentlyPlayed![0];
      if (!recent.track.streamUrl) return;

      const saved = await getPlaybackPosition();
      let positionToRestore = 0;

      // Use local storage position only if it matches the recent track
      if (saved && saved.trackId === recent.track.id) {
        positionToRestore = saved.positionMs / 1000;
      }

      const pt: PlayerTrack = {
        id: recent.track.id,
        title: recent.track.title,
        artistId: recent.track.artist.id,
        artistName: recent.track.artist.name,
        albumId: recent.track.album?.id,
        albumName: recent.track.album?.name,
        coverUrl: recent.track.coverUrl,
        streamUrl: recent.track.streamUrl,
        duration: recent.track.duration,
      };

      setTrack(pt);
      globalPlayer.replace({ uri: pt.streamUrl });
      
      // Restore position but remain paused
      if (positionToRestore > 0) {
        await globalPlayer.seekTo(positionToRestore);
      }
      
      globalPlayer.setActiveForLockScreen(true, {
        title: pt.title,
        artist: pt.artistName,
        albumTitle: pt.albumName,
        artworkUrl: pt.coverUrl,
      });
    }
    restoreSession();
  }, [recentlyPlayed, track]);

  // 2. Save playback position on pause
  const prevPlaying = useRef(false);
  const currentPosMs = useRef(0);
  currentPosMs.current = Math.floor((playerStatus.currentTime ?? 0) * 1000);

  useEffect(() => {
    // Detect transition from playing -> paused
    if (prevPlaying.current && !playerStatus.playing && track) {
      savePlaybackPosition(track.id, currentPosMs.current);
    }
    prevPlaying.current = playerStatus.playing;
  }, [playerStatus.playing, track]);

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
    // Log play to recently-played
    store.dispatch(
      musicMeApi.endpoints.logPlay.initiate({ providerId: newTrack.id }),
    );
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
