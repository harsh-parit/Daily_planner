import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Volume2, VolumeX, CloudRain, Coffee, Trees, Music, Clock } from 'lucide-react';
import { FocusSession } from '../types';

interface FocusTimerProps {
  onComplete: (minutes: number) => void;
}

type SoundType = 'none' | 'rain' | 'forest' | 'cafe';

const SOUNDS: Record<SoundType, { url: string; label: string; icon: React.ElementType }> = {
  none: { url: '', label: 'Silent', icon: VolumeX },
  rain: { url: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3', label: 'Rainy Day', icon: CloudRain },
  forest: { url: 'https://assets.mixkit.co/active_storage/sfx/1210/1210-preview.mp3', label: 'Forest Zen', icon: Trees },
  cafe: { url: 'https://assets.mixkit.co/active_storage/sfx/443/443-preview.mp3', label: 'Coffee Shop', icon: Coffee },
};

const TIME_PRESETS = [5, 10, 15, 25, 30, 45, 60, 90, 120];

export const FocusTimer: React.FC<FocusTimerProps> = ({ onComplete }) => {
  const [session, setSession] = useState<FocusSession>({
    isActive: false,
    timeLeft: 25 * 60,
    mode: 'focus',
    totalDuration: 25 * 60
  });
  
  const [activeSound, setActiveSound] = useState<SoundType>('none');
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: number | undefined;

    if (session.isActive && session.timeLeft > 0) {
      interval = window.setInterval(() => {
        setSession(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (session.timeLeft === 0 && session.isActive) {
      // Timer finished
      setSession(prev => ({ ...prev, isActive: false }));
      if (session.mode === 'focus') {
        onComplete(session.totalDuration / 60);
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      }
    }

    return () => clearInterval(interval);
  }, [session.isActive, session.timeLeft, session.mode, session.totalDuration, onComplete]);

  // Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    if (activeSound !== 'none') {
      audioRef.current.src = SOUNDS[activeSound].url;
      audioRef.current.volume = volume;
      if (session.isActive) {
        audioRef.current.play().catch(e => console.log("Audio play failed", e));
      }
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [activeSound]);

  useEffect(() => {
    if (audioRef.current && activeSound !== 'none') {
      if (session.isActive) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [session.isActive, activeSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleTimer = () => {
    setSession(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    setSession(prev => ({ 
      ...prev, 
      isActive: false, 
      timeLeft: prev.totalDuration,
    }));
  };

  const setDuration = (minutes: number) => {
    setSession({
      isActive: false,
      timeLeft: minutes * 60,
      totalDuration: minutes * 60,
      mode: minutes <= 15 ? 'break' : 'focus'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((session.totalDuration - session.timeLeft) / session.totalDuration) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      
      {/* Sound Controls */}
      <div className="w-full flex justify-between items-center mb-8 bg-white dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3 pl-2">
          <div className={`p-2 rounded-full ${activeSound !== 'none' && session.isActive ? 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 animate-pulse' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            <Music size={18} />
          </div>
          <div className="flex flex-col">
             <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Ambience</span>
             {activeSound !== 'none' && (
                 <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-1"
                 />
             )}
          </div>
        </div>
        
        <div className="flex gap-1.5">
          {(Object.keys(SOUNDS) as SoundType[]).map((sound) => {
             const Icon = SOUNDS[sound].icon;
             return (
              <button
                key={sound}
                onClick={() => setActiveSound(sound)}
                className={`p-2.5 rounded-xl transition-all ${
                  activeSound === sound 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25 scale-105' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                }`}
                title={SOUNDS[sound].label}
              >
                <Icon size={18} />
              </button>
             );
          })}
        </div>
      </div>

      {/* Timer Visual */}
      <div className="relative mb-10 group flex justify-center">
        <div className={`absolute inset-0 bg-violet-500 rounded-full blur-3xl opacity-10 transition-opacity duration-1000 ${session.isActive ? 'opacity-25 animate-pulse-slow' : ''}`}></div>
        
        <div className="relative">
            {/* SVG Ring */}
            <svg className="transform -rotate-90 w-72 h-72 md:w-80 md:h-80 relative z-10 drop-shadow-2xl">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800 fill-white dark:fill-slate-950 opacity-100"
                strokeWidth="8"
            />
            <circle
                cx="50%"
                cy="50%"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-linear ${session.mode === 'break' ? 'text-emerald-500' : ''}`}
            />
            </svg>
            
            {/* Time Display */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 flex flex-col items-center">
                <div className="text-6xl md:text-7xl font-bold font-heading text-slate-800 dark:text-white tracking-tighter tabular-nums drop-shadow-sm">
                    {formatTime(session.timeLeft)}
                </div>
                <div className={`mt-3 font-medium uppercase tracking-[0.25em] text-xs transition-colors px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 ${session.isActive ? 'text-violet-600 dark:text-violet-400 border-violet-500/30' : 'text-slate-500'}`}>
                    {session.isActive ? 'Focusing' : session.mode === 'focus' ? 'Ready' : 'Break'}
                </div>
            </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-6 mb-10">
        <button
          onClick={toggleTimer}
          className={`
            w-24 h-16 rounded-2xl flex items-center justify-center transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl
            ${session.isActive 
              ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700' 
              : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-violet-500/30'}
          `}
        >
          {session.isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>
        
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-all hover:rotate-180 duration-500"
          title="Reset Timer"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      {/* Time Presets */}
      <div className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 backdrop-blur-sm shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 text-sm font-medium pl-1">
            <Clock size={16} />
            <span>Set Duration (Minutes)</span>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
            {TIME_PRESETS.map((min) => (
                <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`
                        py-2 px-1 rounded-xl text-sm font-bold transition-all border
                        ${(session.totalDuration / 60) === min
                            ? 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/50 shadow-sm'
                            : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700/50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:hover:border-slate-600'
                        }
                    `}
                >
                    {min}m
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};