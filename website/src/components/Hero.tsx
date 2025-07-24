'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Hero() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email signup
    console.log('Email signup:', email);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold">FitTracker Pro</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#download" className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-full transition-colors">Download</a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Your AI-Powered
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Fitness Journey</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Transform your workouts with personalized AI coaching, real-time form analysis, and intelligent recovery optimization. 
                Get stronger, faster, and smarter with FitTracker Pro.
              </p>
            </div>

            {/* Key Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>AI-Powered Workouts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Real-Time Form Analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Recovery Optimization</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <span>Nutrition Intelligence</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#download" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg text-center">
                Download Now - Free
              </a>
              <a href="#features" className="border-2 border-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 rounded-full text-lg font-semibold transition-all text-center">
                Learn More
              </a>
            </div>

            {/* Email Signup */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Notify Me
              </button>
            </form>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  {/* Mock App Interface */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">💪</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Today's Workout</h3>
                    <p className="text-gray-400 mb-4">AI-Optimized Upper Body</p>
                    <div className="bg-cyan-500/20 rounded-lg p-3">
                      <p className="text-sm">95% Form Accuracy</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-cyan-400">156</div>
                      <div className="text-xs text-gray-400">Workouts</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-400">89%</div>
                      <div className="text-xs text-gray-400">Recovery</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-400">+25</div>
                      <div className="text-xs text-gray-400">Strength</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-8">Trusted by 10,000+ fitness enthusiasts worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-2xl font-bold">★★★★★</div>
            <span>4.9/5 App Store</span>
            <span>•</span>
            <span>4.8/5 Google Play</span>
          </div>
        </div>
      </div>
    </section>
  );
}