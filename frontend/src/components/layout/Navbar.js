'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logoutUser } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out of your account?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#E11A45',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Sign Out',
      cancelButtonText: 'Cancel',
      focusCancel: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl p-6 font-sans',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer',
      },
    });

    if (result.isConfirmed) {
      await dispatch(logoutUser());
      toast.success('Signed out successfully');
      router.push('/login');
    }
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/timelogs', label: 'Time Logs', icon: Timer },
  ];

  const isActive = (href) => pathname === href;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-orange-100 flex-shrink-0">
                <img src="/logo.jpg" alt="TaskFlow Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 hidden sm:block tracking-tight">
                Task<span className="text-orange-600">Flow</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-orange-50 text-orange-600 shadow-xs'
                        : 'text-gray-600 hover:bg-orange-50/50 hover:text-orange-600'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Profile & Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-orange-50/50 transition-colors cursor-pointer border border-transparent hover:border-orange-100"
              >
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-xs">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-in">
                    <div className="px-4 py-3 border-b border-gray-100 bg-orange-50/30 rounded-t-2xl">
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-orange-50 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white pb-3 pt-2">
          <div className="px-4 space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-orange-50/50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
