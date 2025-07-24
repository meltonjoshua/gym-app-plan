'use client';

export default function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Workouts',
      description: 'Personalized workout plans that adapt to your progress, preferences, and goals in real-time.',
      highlights: ['Dynamic progression', 'Goal optimization', 'Performance tracking']
    },
    {
      icon: '📹',
      title: 'Real-Time Form Analysis',
      description: 'Computer vision technology analyzes your form and provides instant feedback to prevent injuries.',
      highlights: ['Motion capture', 'Injury prevention', 'Technique improvement']
    },
    {
      icon: '🧠',
      title: 'Recovery Optimization',
      description: 'Advanced algorithms monitor your recovery and optimize rest periods for maximum gains.',
      highlights: ['Sleep tracking', 'Stress monitoring', 'Recovery scoring']
    },
    {
      icon: '🍎',
      title: 'Nutrition Intelligence',
      description: 'AI-powered nutrition recommendations based on your workouts, goals, and dietary preferences.',
      highlights: ['Meal planning', 'Macro tracking', 'Smart suggestions']
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your fitness journey with predictive analytics and trend analysis.',
      highlights: ['Progress prediction', 'Performance insights', 'Goal forecasting']
    },
    {
      icon: '🏆',
      title: 'Adaptive Challenges',
      description: 'Dynamic challenges and achievements that evolve with your fitness level and preferences.',
      highlights: ['Personal milestones', 'Social challenges', 'Reward system']
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Revolutionary Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of fitness with our cutting-edge AI technology designed to maximize your potential
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
              
              <div className="space-y-2">
                {feature.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20 bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FitTracker Pro?
            </h3>
            <p className="text-gray-600">
              See how we compare to traditional fitness apps
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-cyan-600">FitTracker Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-500">Traditional Apps</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-900">AI-Powered Personalization</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-red-500 font-semibold">✗</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-900">Real-Time Form Analysis</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-red-500 font-semibold">✗</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-900">Recovery Optimization</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-yellow-500 font-semibold">Basic</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6 text-gray-900">Nutrition Intelligence</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-yellow-500 font-semibold">Limited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 text-gray-900">Predictive Analytics</td>
                  <td className="py-4 px-6 text-center text-green-600 font-semibold">✓</td>
                  <td className="py-4 px-6 text-center text-red-500 font-semibold">✗</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <a
            href="#download"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Experience These Features
          </a>
        </div>
      </div>
    </section>
  );
}