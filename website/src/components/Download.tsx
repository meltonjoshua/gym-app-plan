'use client';

import { useState } from 'react';

export default function Download() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Download notification email:', email);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const downloadStats = [
    { icon: '📱', stat: '1M+', label: 'Downloads' },
    { icon: '⭐', stat: '4.9/5', label: 'Rating' },
    { icon: '🏆', stat: '#1', label: 'Fitness App' },
    { icon: '🌍', stat: '150+', label: 'Countries' }
  ];

  const systemRequirements = {
    ios: {
      version: 'iOS 15.0+',
      storage: '250 MB',
      features: ['HealthKit Integration', 'Apple Watch Support', 'Siri Shortcuts', 'Widget Support']
    },
    android: {
      version: 'Android 8.0+',
      storage: '200 MB',
      features: ['Google Fit Integration', 'Wear OS Support', 'Health Connect', 'Quick Tiles']
    }
  };

  return (
    <section id="download" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Download
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> FitTracker Pro</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Transform your fitness journey today. Available on iOS and Android with all premium features included.
          </p>

          {/* Download Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {downloadStats.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl lg:text-3xl font-bold text-cyan-400 mb-1">{item.stat}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="text-center mb-16">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            {/* App Store Button */}
            <a
              href="#"
              className="group bg-black hover:bg-gray-800 rounded-2xl px-8 py-4 flex items-center space-x-4 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-3xl">🍎</div>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on the</div>
                <div className="text-xl font-semibold">App Store</div>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="#"
              className="group bg-black hover:bg-gray-800 rounded-2xl px-8 py-4 flex items-center space-x-4 transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-3xl">📱</div>
              <div className="text-left">
                <div className="text-xs text-gray-400">Get it on</div>
                <div className="text-xl font-semibold">Google Play</div>
              </div>
            </a>
          </div>

          <p className="text-gray-400 text-sm mb-8">
            Free download • Premium features included • No ads ever
          </p>

          {/* QR Codes */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 mb-4 inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">iOS QR Code</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">Scan for iOS</div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 mb-4 inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Android QR</span>
                </div>
              </div>
              <div className="text-sm text-gray-400">Scan for Android</div>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-center mb-4">Get Notified</h3>
            <p className="text-gray-300 text-center mb-6 text-sm">
              Be the first to know about new features and updates
            </p>
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 py-3 rounded-lg font-semibold transition-all"
                >
                  Notify Me
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <div className="text-lg font-semibold text-green-400">Thank you!</div>
                <div className="text-sm text-gray-300">You'll be notified about updates</div>
              </div>
            )}
          </div>
        </div>

        {/* System Requirements */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* iOS Requirements */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🍎</div>
              <div>
                <h3 className="text-2xl font-bold">iOS Version</h3>
                <p className="text-gray-400">iPhone & iPad</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Minimum iOS</span>
                <span className="font-semibold">{systemRequirements.ios.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Storage Required</span>
                <span className="font-semibold">{systemRequirements.ios.storage}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">iOS Features:</h4>
              <div className="space-y-2">
                {systemRequirements.ios.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Android Requirements */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="flex items-center mb-6">
              <div className="text-4xl mr-4">🤖</div>
              <div>
                <h3 className="text-2xl font-bold">Android Version</h3>
                <p className="text-gray-400">Phone & Tablet</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Minimum Android</span>
                <span className="font-semibold">{systemRequirements.android.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Storage Required</span>
                <span className="font-semibold">{systemRequirements.android.storage}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Android Features:</h4>
              <div className="space-y-2">
                {systemRequirements.android.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Security & Privacy First</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="font-semibold mb-2">End-to-End Encryption</h4>
              <p className="text-sm text-gray-400">Your personal data is encrypted and secure</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="font-semibold mb-2">HIPAA Compliant</h4>
              <p className="text-sm text-gray-400">Medical-grade security for health data</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h4 className="font-semibold mb-2">No Data Selling</h4>
              <p className="text-sm text-gray-400">We never sell your personal information</p>
            </div>
          </div>
        </div>

        {/* What's New */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">What's New in v2.0</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🤖</div>
              <h4 className="font-semibold mb-2">Enhanced AI</h4>
              <p className="text-sm text-gray-400">Smarter workout recommendations</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">New Analytics</h4>
              <p className="text-sm text-gray-400">Detailed progress insights</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2">Form Analysis 2.0</h4>
              <p className="text-sm text-gray-400">Real-time corrections</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="text-3xl mb-3">🌙</div>
              <h4 className="font-semibold mb-2">Sleep Integration</h4>
              <p className="text-sm text-gray-400">Better recovery tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}