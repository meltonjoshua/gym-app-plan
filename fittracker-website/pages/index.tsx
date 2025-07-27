import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>FitTracker Pro - Transform Your Fitness Journey</title>
        <meta name="description" content="The all-in-one fitness app that helps you track workouts, monitor nutrition, and achieve your health goals with AI-powered insights." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white shadow-lg fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900">FitTracker Pro</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#features" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Features</a>
                  <a href="#pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Pricing</a>
                  <a href="#testimonials" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Reviews</a>
                  <a href="#download" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition duration-300">Download</a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Transform Your <span className="text-yellow-400">Fitness Journey</span>
                </h1>
                <p className="text-xl mb-8 text-blue-100 leading-relaxed">
                  The all-in-one fitness app that helps you track workouts, monitor nutrition, 
                  and achieve your health goals with AI-powered insights and personalized coaching.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="#download" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-center transition duration-300 shadow-lg">
                    Download Free App
                  </a>
                  <a href="#features" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-center transition duration-300">
                    Learn More
                  </a>
                </div>
                <div className="flex items-center mt-8 space-x-6">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 text-lg">
                      ★★★★★
                    </div>
                    <span className="ml-2 text-blue-100">4.9/5 Rating</span>
                  </div>
                  <div className="text-blue-100">
                    <span className="font-semibold">500K+</span> Downloads
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative mx-auto w-80 h-80 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white/90 p-8 rounded-2xl shadow-xl mb-4">
                      <div className="text-4xl font-bold text-blue-600 mb-2">FitTracker</div>
                      <div className="text-gray-600">Your Fitness Companion</div>
                    </div>
                    <div className="text-white/80 text-sm">Available on iOS & Android</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                FitTracker Pro combines cutting-edge technology with proven fitness science 
                to deliver a personalized experience that adapts to your lifestyle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Workouts</h3>
                <p className="text-gray-600">
                  Get personalized workout plans that adapt to your progress, preferences, and schedule 
                  with our advanced AI coaching system.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Nutrition Tracking</h3>
                <p className="text-gray-600">
                  Track your meals effortlessly with barcode scanning, recipe analysis, 
                  and personalized macro recommendations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">👥</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Social Community</h3>
                <p className="text-gray-600">
                  Connect with like-minded fitness enthusiasts, share achievements, 
                  and participate in challenges to stay motivated.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">❤️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Health Integration</h3>
                <p className="text-gray-600">
                  Seamlessly sync with Apple Health, Google Fit, and popular wearables 
                  for comprehensive health monitoring.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">📈</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Progress Analytics</h3>
                <p className="text-gray-600">
                  Visualize your fitness journey with detailed analytics, progress photos, 
                  and achievement tracking to stay motivated.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Adapt your fitness routine to your busy life with smart scheduling, 
                  quick workouts, and offline access.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600">
                Start free and upgrade when you're ready for premium features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-6">
                    $0<span className="text-lg text-gray-500">/month</span>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Basic workout tracking
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Exercise library (100+ exercises)
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Basic progress tracking
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Community access
                    </li>
                  </ul>
                  <button className="w-full bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition duration-300">
                    Get Started Free
                  </button>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="bg-blue-600 text-white p-8 rounded-xl relative transform scale-105 shadow-xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Premium</h3>
                  <div className="text-4xl font-bold mb-6">
                    $9.99<span className="text-lg text-blue-200">/month</span>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="text-yellow-400 mr-2">✓</span>
                      Everything in Free
                    </li>
                    <li className="flex items-center">
                      <span className="text-yellow-400 mr-2">✓</span>
                      AI-powered workout plans
                    </li>
                    <li className="flex items-center">
                      <span className="text-yellow-400 mr-2">✓</span>
                      Advanced nutrition tracking
                    </li>
                    <li className="flex items-center">
                      <span className="text-yellow-400 mr-2">✓</span>
                      Detailed analytics
                    </li>
                    <li className="flex items-center">
                      <span className="text-yellow-400 mr-2">✓</span>
                      Wearable integrations
                    </li>
                  </ul>
                  <button className="w-full bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition duration-300">
                    Start 7-Day Free Trial
                  </button>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-6">
                    $19.99<span className="text-lg text-gray-500">/month</span>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Everything in Premium
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Personal trainer chat
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Custom meal plans
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Advanced AR features
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Early access to features
                    </li>
                  </ul>
                  <button className="w-full bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-semibold transition duration-300">
                    Start Pro Trial
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of people who've transformed their fitness journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex text-yellow-400 mb-4 text-lg">
                  ★★★★★
                </div>
                <p className="text-gray-600 mb-6">
                  "FitTracker Pro completely changed how I approach fitness. The AI coaching 
                  feels like having a personal trainer in my pocket!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">SJ</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                    <p className="text-gray-500">Lost 25 lbs in 4 months</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex text-yellow-400 mb-4 text-lg">
                  ★★★★★
                </div>
                <p className="text-gray-600 mb-6">
                  "The nutrition tracking is incredible. I never realized how much I was 
                  overeating until I started using this app."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-semibold">MC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Mike Chen</h4>
                    <p className="text-gray-500">Achieved 10% body fat</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex text-yellow-400 mb-4 text-lg">
                  ★★★★★
                </div>
                <p className="text-gray-600 mb-6">
                  "The community aspect keeps me motivated every day. Love the challenges 
                  and seeing everyone's progress!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold">ER</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Emily Rodriguez</h4>
                    <p className="text-gray-500">Ran first marathon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Download FitTracker Pro today and join millions of people who are already 
              living healthier, happier lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </div>
              </div>
              <div className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-blue-200 mb-4">Start with our free plan • No credit card required</p>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">500K+</div>
                  <div className="text-blue-200">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.9★</div>
                  <div className="text-blue-200">App Store Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-blue-200">5-Star Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <span className="ml-2 text-xl font-bold">FitTracker Pro</span>
                </div>
                <p className="text-gray-400">
                  Your ultimate fitness companion for a healthier, happier life.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-white transition duration-300">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition duration-300">Pricing</a></li>
                  <li><a href="#download" className="hover:text-white transition duration-300">Download</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition duration-300">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition duration-300">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition duration-300">Privacy Policy</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Connect</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition duration-300">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition duration-300">Community</a></li>
                  <li><a href="#" className="hover:text-white transition duration-300">Instagram</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 FitTracker Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
