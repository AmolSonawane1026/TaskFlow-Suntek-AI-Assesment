'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

// Module-level flag: persists in memory across client-side SPA route changes
// Prevents unmounting into full-screen spinner flash on every route navigation
let hasClientMountedGlobally = false;

export default function ProtectedRoute({ children }) {
  const [isMounted, setIsMounted] = useState(hasClientMountedGlobally);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    hasClientMountedGlobally = true;
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  if (!isMounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return children;
}

