'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Users,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const registerValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Full name is required'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
});

export default function RegisterPage() {
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      const { confirmPassword, ...userData } = values;
      dispatch(registerUser(userData));
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
        <div className="relative z-10 my-auto py-4 space-y-5">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 group">
            <img
              src="/auth-register.jpg"
              alt="TaskFlow Goals & Milestones"
              className="w-full h-60 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end p-5">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                Track Goals • Crush Deadlines
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              Start Your Productivity
              <br />
              <span className="text-amber-100">Journey Today.</span>
            </h1>
            <p className="text-orange-100 text-sm font-medium mt-1.5 max-w-md leading-relaxed">
              Join high-performing teams using TaskFlow and Google Gemini AI to plan tasks, monitor time logs, and achieve high output.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <Users className="w-4 h-4 text-orange-200 mb-1" />
              <p className="text-xl font-extrabold text-white">10k+</p>
              <p className="text-[11px] text-orange-200 font-medium">Active Users</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <CheckCircle2 className="w-4 h-4 text-orange-200 mb-1" />
              <p className="text-xl font-extrabold text-white">1M+</p>
              <p className="text-[11px] text-orange-200 font-medium">Tasks Done</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
              <ShieldCheck className="w-4 h-4 text-orange-200 mb-1" />
              <p className="text-xl font-extrabold text-white">99.9%</p>
              <p className="text-[11px] text-orange-200 font-medium">Uptime</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-orange-200/80 text-xs font-medium">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form (White & Orange Theme) */}
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
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
            <p className="text-gray-500 mt-1.5 text-sm">Get started with TaskFlow in seconds</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="register-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    formik.touched.name && formik.errors.name
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
              </div>
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-email"
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
              <label htmlFor="register-password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Min 6 chars, 1 upper, 1 lower, 1 number"
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

            <div>
              <label htmlFor="register-confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-confirm"
                  type="password"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-400 bg-red-50/20 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-500 focus:border-transparent'
                  }`}
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formik.errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg shadow-orange-200 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="inline-flex items-center gap-1 text-orange-600 font-bold hover:text-orange-700 cursor-pointer">
              Sign in
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
