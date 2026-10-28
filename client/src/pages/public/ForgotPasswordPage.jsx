import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Compass,
  Mail,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  ExternalLink
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessData(null);

      const res = await authService.forgotPassword(email.trim());
      setSuccessData(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No account found with this email, or an error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/40 via-white to-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        {/* Header Icon & Title */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-400 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            No worries! Enter your registered account email and we'll generate a secure reset link.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-100 text-slate-800 space-y-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/25">
                <Mail className="w-6 h-6 animate-bounce" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Check Your Inbox! 📩
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We've sent a secure password reset link to:
                </p>
                <div className="inline-block px-3 py-1 bg-white rounded-lg border border-indigo-200 text-xs font-bold text-indigo-700">
                  {email}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Please open your email client, look for the email from <strong>Voyanta</strong>, and click the link inside to set your new password. The link will expire in 15 minutes.
              </p>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 text-left">
                💡 <strong>Tip:</strong> If you don't see the email within 1-2 minutes, check your <strong>Spam / Junk</strong> folder.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setEmail('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Send to a different email
              </button>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-md shadow-indigo-500/25 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Reset Link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
