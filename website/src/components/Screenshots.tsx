'use client';

import { useState } from 'react';

export default function Screenshots() {
  const [activeTab, setActiveTab] = useState(0);

  const screenshots = [
    {
      title: 'Workout Dashboard',
      description: 'Track your progress with our intuitive dashboard featuring real-time metrics and AI insights.',
      mockup: (
        <div className="bg-gray-900 rounded-3xl p-6 max-w-sm mx-auto">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Today's Session</h3>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Live</span>
            </div>
            <div className="text-3xl font-bold mb-2">Upper Body Power</div>
            <div className="text-cyan-200">45 min • 8 exercises</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400">156</div>
              <div className="text-xs text-gray-400">Calories</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">95%</div>
              <div className="text-xs text-gray-400">Form Score</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">Bench Press</span>
              <span className="text-cyan-400 text-sm">Set 3/4</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'AI Form Analysis',
      description: 'Get real-time feedback on your form with our advanced computer vision technology.',
      mockup: (
        <div className="bg-gray-900 rounded-3xl p-6 max-w-sm mx-auto">
          <div className="bg-gray-800 rounded-2xl p-4 mb-4">
            <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mb-4 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">📹</div>
                <div className="text-sm">Live Camera Feed</div>
              </div>
            </div>
            <div className="text-center text-white">
              <div className="text-lg font-bold mb-2">Form Analysis</div>
              <div className="text-green-400 text-sm mb-2">✓ Perfect form detected</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
              <div className="text-green-400 text-sm font-semibold">Excellent Form</div>
              <div className="text-white text-xs">Keep your back straight</div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
              <div className="text-yellow-400 text-sm font-semibold">Minor Adjustment</div>
              <div className="text-white text-xs">Slow down the movement</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Recovery Insights',
      description: 'Monitor your recovery with detailed analytics and personalized recommendations.',
      mockup: (
        <div className="bg-gray-900 rounded-3xl p-6 max-w-sm mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-white text-lg font-bold mb-2">Recovery Score</h3>
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">89%</div>
                  <div className="text-xs text-gray-400">Excellent</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm">Sleep Quality</span>
                <span className="text-green-400 text-sm">8.2/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm">Stress Level</span>
                <span className="text-yellow-400 text-sm">3.1/10</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full w-1/3"></div>
              </div>
            </div>
            <div className="bg-cyan-500/20 rounded-xl p-4">
              <div className="text-cyan-400 text-sm font-semibold mb-1">Recommendation</div>
              <div className="text-white text-xs">Ready for high-intensity training</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Nutrition Tracking',
      description: 'AI-powered nutrition recommendations tailored to your fitness goals and preferences.',
      mockup: (
        <div className="bg-gray-900 rounded-3xl p-6 max-w-sm mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-white text-lg font-bold mb-2">Daily Nutrition</h3>
            <div className="text-cyan-400 text-sm">2,156 / 2,400 calories</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-orange-400 text-lg font-bold">156g</div>
              <div className="text-gray-400 text-xs">Protein</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-blue-400 text-lg font-bold">245g</div>
              <div className="text-gray-400 text-xs">Carbs</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 text-lg font-bold">89g</div>
              <div className="text-gray-400 text-xs">Fats</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white text-sm font-semibold">Post-Workout Meal</div>
                  <div className="text-gray-400 text-xs">Recommended in 30 min</div>
                </div>
                <div className="text-cyan-400 text-xl">🍗</div>
              </div>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4">
              <div className="text-purple-400 text-sm font-semibold mb-1">AI Suggestion</div>
              <div className="text-white text-xs">Add 20g protein for optimal recovery</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See FitTracker Pro in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our intuitive interface designed to make your fitness journey seamless and engaging
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-12 bg-gray-100 rounded-2xl p-2 max-w-4xl mx-auto">
          {screenshots.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === index
                  ? 'bg-white text-cyan-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {screenshot.title}
            </button>
          ))}
        </div>

        {/* Active Screenshot */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              {screenshots[activeTab].title}
            </h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {screenshots[activeTab].description}
            </p>

            {/* Feature Points */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Real-time Updates</div>
                  <div className="text-gray-600 text-sm">Live data synchronization across all devices</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Intuitive Design</div>
                  <div className="text-gray-600 text-sm">Clean, user-friendly interface for all skill levels</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Personalized Experience</div>
                  <div className="text-gray-600 text-sm">Adapts to your preferences and fitness level</div>
                </div>
              </div>
            </div>

            <a
              href="#download"
              className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Try It Free
            </a>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative">
              {screenshots[activeTab].mockup}
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Additional Screenshots Grid */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            More App Previews
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {screenshots.map((screenshot, index) => (
              <div
                key={index}
                className={`cursor-pointer transform transition-all hover:scale-105 ${
                  activeTab === index ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="scale-50 origin-top">
                    {screenshot.mockup}
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="font-semibold text-gray-900 text-sm">{screenshot.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}