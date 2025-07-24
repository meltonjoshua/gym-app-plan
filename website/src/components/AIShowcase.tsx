'use client';

import { useState, useEffect } from 'react';

export default function AIShowcase() {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demos = [
    {
      title: 'Form Analysis AI',
      subtitle: 'Real-time motion tracking',
      description: 'Our computer vision AI analyzes your form in real-time, providing instant feedback to prevent injuries and optimize performance.',
      metrics: [
        { label: 'Accuracy', value: '99.2%', color: 'text-green-400' },
        { label: 'Response Time', value: '<50ms', color: 'text-cyan-400' },
        { label: 'Exercises Supported', value: '200+', color: 'text-purple-400' }
      ],
      visualization: (
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-cyan-500/20 rounded-lg p-4 border border-cyan-500/30">
                  <div className="text-cyan-400 text-sm font-semibold mb-2">Joint Tracking</div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Shoulder</span>
                    <span className="text-green-400">✓ Aligned</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Elbow</span>
                    <span className="text-green-400">✓ Aligned</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Wrist</span>
                    <span className="text-yellow-400">⚠ Adjust</span>
                  </div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-purple-400 text-sm font-semibold mb-2">Movement Pattern</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full w-4/5 transition-all duration-1000"></div>
                  </div>
                  <div className="text-xs text-gray-300 mt-2">Range of Motion: 85%</div>
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-white text-sm font-semibold">Live Analysis</div>
                  <div className="text-gray-400 text-xs">Bench Press</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Workout Optimization',
      subtitle: 'Adaptive training algorithms',
      description: 'Machine learning algorithms continuously optimize your workouts based on performance data, recovery metrics, and personal goals.',
      metrics: [
        { label: 'Performance Gain', value: '+34%', color: 'text-green-400' },
        { label: 'Injury Reduction', value: '78%', color: 'text-cyan-400' },
        { label: 'User Satisfaction', value: '4.9/5', color: 'text-purple-400' }
      ],
      visualization: (
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-6 border border-cyan-500/30">
                <div className="text-center mb-4">
                  <div className="text-cyan-400 text-lg font-bold">Next Workout Prediction</div>
                  <div className="text-gray-300 text-sm">Based on your recovery and progress</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">Upper Body</div>
                    <div className="text-cyan-400 text-sm">Recommended</div>
                    <div className="text-xs text-gray-400">Recovery: 89%</div>
                  </div>
                  <div className="text-center opacity-60">
                    <div className="text-xl font-bold text-gray-400">Cardio</div>
                    <div className="text-gray-500 text-sm">Skip</div>
                    <div className="text-xs text-gray-500">Recovery: 45%</div>
                  </div>
                  <div className="text-center opacity-60">
                    <div className="text-xl font-bold text-gray-400">Lower Body</div>
                    <div className="text-gray-500 text-sm">Skip</div>
                    <div className="text-xs text-gray-500">Recovery: 62%</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-green-400 text-sm font-semibold mb-2">Strength Progress</div>
                  <div className="text-2xl font-bold text-white">+15%</div>
                  <div className="text-xs text-gray-400">Last 30 days</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-purple-400 text-sm font-semibold mb-2">Goal Achievement</div>
                  <div className="text-2xl font-bold text-white">127%</div>
                  <div className="text-xs text-gray-400">Monthly target</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Recovery Intelligence',
      subtitle: 'Holistic health monitoring',
      description: 'Advanced algorithms analyze sleep, stress, heart rate variability, and training load to optimize your recovery and prevent overtraining.',
      metrics: [
        { label: 'Recovery Accuracy', value: '94%', color: 'text-green-400' },
        { label: 'Data Points', value: '50+', color: 'text-cyan-400' },
        { label: 'Prediction Window', value: '7 days', color: 'text-purple-400' }
      ],
      visualization: (
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 rounded-full opacity-20"></div>
                <div className="absolute inset-4 bg-gray-900 rounded-full flex items-center justify-center border-4 border-green-400">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">92%</div>
                    <div className="text-sm text-gray-400">Recovery</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 text-sm">Sleep Quality</span>
                    <span className="text-white font-semibold">8.7/10</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 text-sm">Stress Level</span>
                    <span className="text-white font-semibold">Low</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-yellow-500 h-2 rounded-full w-1/4"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-sm">HRV Score</span>
                    <span className="text-white font-semibold">45ms</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 text-sm">Training Load</span>
                    <span className="text-white font-semibold">Optimal</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-purple-500 h-2 rounded-full w-3/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDemo((prev) => (prev + 1) % demos.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [demos.length]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Powered by Advanced
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"> Artificial Intelligence</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of fitness with cutting-edge AI technology that adapts, learns, and evolves with you
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
            {demos.map((demo, index) => (
              <button
                key={index}
                onClick={() => setCurrentDemo(index)}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  currentDemo === index
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        {/* Current Demo */}
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <div className="text-cyan-400 text-sm font-semibold mb-2 uppercase tracking-wider">
                  {demos[currentDemo].subtitle}
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                  {demos[currentDemo].title}
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {demos[currentDemo].description}
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {demos[currentDemo].metrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl lg:text-3xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </div>
                    <div className="text-sm text-gray-400">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Tech Stack */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold mb-4">Powered By</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span>TensorFlow</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Computer Vision</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Machine Learning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Neural Networks</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {demos[currentDemo].visualization}
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-12 space-x-2">
          {demos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentDemo(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentDemo === index ? 'bg-cyan-400 w-8' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="#download"
            className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Experience AI-Powered Fitness
          </a>
        </div>
      </div>
    </section>
  );
}