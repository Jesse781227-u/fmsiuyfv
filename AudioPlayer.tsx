import React from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current?.duration || 0);
    });
    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(audioRef.current?.currentTime || 0);
    });
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-xl border border-accent/30">
      <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary text-accent flex items-center justify-center shrink-0 hover:scale-105 transition-transform">
        {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-1" fill="currentColor" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-1.5 bg-background rounded-full overflow-hidden w-full">
          <div className="h-full bg-accent transition-all duration-100" style={{ width: `${(progress / duration) * 100 || 0}%` }} />
        </div>
        <div className="flex justify-between text-xs text-primary/70 font-medium">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
