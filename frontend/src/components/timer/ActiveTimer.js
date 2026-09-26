'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { stopTimer, fetchTimeLogs } from '@/store/slices/timelogSlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { fetchDailySummary, fetchWeeklySummary } from '@/store/slices/summarySlice';
import { formatTimerDisplay } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { Timer, Square } from 'lucide-react';

export default function ActiveTimer() {
  const dispatch = useDispatch();
  const { activeTimer } = useSelector((state) => state.timelogs);
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time from start
  const calculateElapsed = useCallback(() => {
    if (activeTimer?.startTime) {
      const start = new Date(activeTimer.startTime).getTime();
      const now = Date.now();
      return Math.floor((now - start) / 1000);
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

  const handleStop = async () => {
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
    <div className="bg-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-inner">
              <Timer className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping ring-2 ring-white"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white"></div>
          </div>
          <div>
            <p className="text-xs text-orange-100 font-semibold tracking-wide uppercase">
              Currently Tracking Time
            </p>
            <p className="text-lg font-bold truncate max-w-[200px] sm:max-w-[320px] text-white">
              {activeTimer.task?.title || 'Task'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-mono font-extrabold tracking-wider">
              {formatTimerDisplay(elapsed)}
            </p>
          </div>
          <button
            onClick={handleStop}
            className="inline-flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
