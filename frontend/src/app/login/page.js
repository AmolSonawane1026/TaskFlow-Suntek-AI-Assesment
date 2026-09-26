'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .required('Password is required'),
});

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      dispatch(loginUser(values));
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Orange Branding & Showcase Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 p-10 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md border-2 border-white/40">
              <img src="/logo.jpg" alt="TaskFlow" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">TaskFlow</span>
          </div>
        </div>

        {/* Showcase Image & Tagline */}
        <div className="relative z-10 my-auto py-6 space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 group">
            <img
              src="/auth-login.jpg"
              alt="TaskFlow Productivity Hub"
              className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                AI-Powered Workflow & Time Tracking
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Master Your Schedule,
              <br />
              <span className="text-amber-100">Supercharge Your Work.</span>
            </h1>
            <p className="text-orange-100 text-sm font-medium mt-2 max-w-md leading-relaxed">
              TaskFlow helps you organize priorities with Gemini AI, track time spent on every task, and get personalized daily productivity coaching.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-orange-200/80 text-xs font-medium">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form (White & Orange Theme) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-orange-200">
              <img src="/logo.jpg" alt="TaskFlow" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-1.5 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg shadow-orange-200 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="inline-flex items-center gap-1 text-orange-600 font-bold hover:text-orange-700 cursor-pointer">
              Create an account
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
