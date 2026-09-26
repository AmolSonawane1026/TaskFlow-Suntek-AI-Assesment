'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stopTimer, fetchTimeLogs, fetchActiveTimer } from '@/store/slices/timelogSlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { fetchDailySummary, fetchWeeklySummary } from '@/store/slices/summarySlice';
import { formatTimerDisplay } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { Timer, Square } from 'lucide-react';

export default function ActiveTimer() {
  const dispatch = useDispatch();
  const { activeTimer } = useSelector((state) => state.timelogs);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [elapsed, setElapsed] = useState(0);

  // Restore active timer on app mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchActiveTimer());
    }
  }, [dispatch, isAuthenticated]);

  // Calculate elapsed time from start
  const calculateElapsed = useCallback(() => {
    if (activeTimer?.startTime) {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((now - start) / 1000));
    }
    return 0;
  }, [activeTimer]);

  // Tick every second when timer is active
  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }

    setElapsed(calculateElapsed());

    const interval = setInterval(() => {
      setElapsed(calculateElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, calculateElapsed]);

  const handleStop = async (e) => {
    if (e) e.stopPropagation();
    if (!activeTimer?._id) return;

    try {
      await dispatch(stopTimer(activeTimer._id)).unwrap();
      toast.success('Timer stopped');
      dispatch(fetchDailySummary());
      dispatch(fetchWeeklySummary());
      dispatch(fetchTasks());
      dispatch(fetchTimeLogs({ limit: 50 }));
    } catch (error) {
      toast.error(error || 'Failed to stop timer');
    }
  };

  if (!activeTimer) return null;

  return (
    <aside
      aria-label="Active time tracker"
      className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[60] inline-flex w-fit items-center gap-2.5 sm:gap-3 bg-gray-950/80 backdrop-blur-2xl text-white pl-3.5 pr-2 py-1.5 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.28)] border border-white/25 ring-1 ring-white/10 animate-in fade-in slide-in-from-top-2 duration-200 max-w-[95vw] whitespace-nowrap overflow-hidden before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none"
    >
      {/* Live Pulsing Dot */}
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
      </span>

      {/* Timer icon + Task Title */}
      <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
        <Timer className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
        <span
          className="text-xs font-semibold text-gray-100 truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[190px]"
          title={activeTimer.task?.title || 'Task'}
        >
          {activeTimer.task?.title || 'Task'}
        </span>
      </div>

      {/* Monospace Time Display */}
      <div className="bg-white/10 text-white px-2 py-0.5 rounded-lg font-mono text-xs font-extrabold tracking-wider flex-shrink-0 border border-white/10 shadow-inner">
        {formatTimerDisplay(elapsed)}
      </div>

      {/* Stop Button */}
      <button
        type="button"
        onClick={handleStop}
        className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-md shadow-orange-500/25 cursor-pointer active:scale-95 flex-shrink-0"
      >
        <Square className="w-2.5 h-2.5 fill-current" />
        <span>Stop</span>
      </button>
    </aside>
  );
}

