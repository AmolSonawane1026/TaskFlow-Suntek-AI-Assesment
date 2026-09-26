'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTimeLogs } from '@/store/slices/timelogSlice';
import { fetchActiveTimer } from '@/store/slices/timelogSlice';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import ActiveTimer from '@/components/timer/ActiveTimer';
import { formatTime, formatDateTime } from '@/utils/helpers';
import { Timer, Clock, Radio, CheckCircle2, History } from 'lucide-react';

export default function TimeLogsPage() {
  const dispatch = useDispatch();
  const { timeLogs, isLoading, activeTimer } = useSelector((state) => state.timelogs);

  useEffect(() => {
    dispatch(fetchTimeLogs({ limit: 50 }));
    dispatch(fetchActiveTimer());
  }, [dispatch]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Time Logs</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Review all your recorded productivity sessions and time tracking history
            </p>
          </div>

          {/* Active Timer */}
          {activeTimer && (
            <div className="mb-6">
              <ActiveTimer />
            </div>
          )}

          {/* Time Logs Table */}
          {isLoading && timeLogs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : timeLogs.length > 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-orange-50/40">
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeLogs.map((log, index) => (
                      <tr
                        key={log._id}
                        className={`border-b border-gray-50 hover:bg-orange-50/30 transition-colors ${
                          index % 2 === 0 ? '' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <p className="text-sm font-bold text-gray-900">
                            {log.task?.title || 'Unknown Task'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600 font-medium">
                            {formatDateTime(log.startTime)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600 font-medium">
                            {log.endTime ? formatDateTime(log.endTime) : '—'}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-orange-600">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            {log.duration > 0 ? formatTime(log.duration) : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {log.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                              Active Now
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {timeLogs.map((log) => (
                  <div key={log._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">
                        {log.task?.title || 'Unknown Task'}
                      </p>
                      {log.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-sm font-extrabold text-orange-600">
                          {formatTime(log.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                      <span>{formatDateTime(log.startTime)}</span>
                      {log.endTime && (
                        <>
                          <span>→</span>
                          <span>{formatDateTime(log.endTime)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-16 border border-gray-100 text-center shadow-xs">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-3">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No time logs recorded yet</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Start a timer on any task in your workspace to begin tracking your productivity history.
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
