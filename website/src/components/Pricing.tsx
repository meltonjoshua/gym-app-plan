'use client';

import { useState } from 'react';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for beginners starting their fitness journey',
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        'Basic workout tracking',
        'Exercise library (50+ exercises)',
        'Progress charts',
        'Community access',
        'Basic nutrition tips',
        'Standard support'
      ],
      limitations: [
        'No AI coaching',
        'No form analysis',
        'No personalized plans'
      ],
      cta: 'Get Started Free',
      ctaStyle: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      name: 'Pro',
      description: 'Advanced AI features for serious fitness enthusiasts',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      popular: true,
      features: [
        'Everything in Basic',
        'AI-powered workout plans',
        'Real-time form analysis',
        'Recovery optimization',
        'Nutrition intelligence',
        'Advanced analytics',
        'Injury prevention AI',
        'Progress predictions',
        'Priority support',
        'Offline mode'
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      ctaStyle: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
    },
    {
      name: 'Elite',
      description: 'Professional-grade features for athletes and trainers',
      monthlyPrice: 39.99,
      yearlyPrice: 399.99,
      popular: false,
      features: [
        'Everything in Pro',
        'Personal AI coach',
        'Advanced biometric integration',
        'Custom exercise creation',
        'Team management tools',
        'White-label options',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 premium support'
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
    }
  ];

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! Pro and Elite plans come with a 14-day free trial. No credit card required.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.'
    },
    {
      question: 'What happens to my data if I cancel?',
      answer: 'Your workout data remains accessible for 30 days after cancellation. You can export it anytime.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes! Students get 50% off Pro and Elite plans with valid student ID verification.'
    },
    {
      question: 'Is the AI coaching really personalized?',
      answer: 'Yes, our AI analyzes your performance, preferences, recovery, and goals to create truly personalized experiences.'
    }
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Fitness Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            From free basic tracking to professional-grade AI coaching, we have the perfect plan for your fitness goals
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 bg-gray-100 rounded-2xl p-2 inline-flex">
            <span className={`px-4 py-2 text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                isYearly ? 'bg-cyan-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`px-4 py-2 text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-500 shadow-xl scale-105'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-4xl font-bold text-gray-900">Free</div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold text-gray-900">
                        ${isYearly ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice}
                        <span className="text-lg text-gray-500 font-normal">/month</span>
                      </div>
                      {isYearly && (
                        <div className="text-sm text-gray-500">
                          Billed annually (${plan.yearlyPrice}/year)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className={`w-full py-3 px-6 rounded-xl text-white font-semibold transition-all transform hover:scale-105 ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}

                {plan.limitations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h5 className="font-medium text-gray-500 mb-2 text-sm">Not included:</h5>
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-start space-x-3 mb-2">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-white text-xs">✗</span>
                        </div>
                        <span className="text-gray-500 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-gray-50 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Detailed Feature Comparison
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-600">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-cyan-600">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-purple-600">Elite</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Workout Tracking', basic: true, pro: true, elite: true },
                  { feature: 'Exercise Library', basic: 'Basic', pro: 'Full', elite: 'Full + Custom' },
                  { feature: 'AI Coaching', basic: false, pro: true, elite: 'Advanced' },
                  { feature: 'Form Analysis', basic: false, pro: true, elite: true },
                  { feature: 'Recovery Optimization', basic: false, pro: true, elite: true },
                  { feature: 'Nutrition Intelligence', basic: false, pro: true, elite: true },
                  { feature: 'Team Management', basic: false, pro: false, elite: true },
                  { feature: 'API Access', basic: false, pro: false, elite: true },
                  { feature: 'Priority Support', basic: false, pro: true, elite: '24/7' }
                ].map((row, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-gray-900 font-medium">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {row.basic === true ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : row.basic === false ? (
                        <span className="text-red-500 font-semibold">✗</span>
                      ) : (
                        <span className="text-gray-600 text-sm">{row.basic}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.pro === true ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : row.pro === false ? (
                        <span className="text-red-500 font-semibold">✗</span>
                      ) : (
                        <span className="text-cyan-600 text-sm font-semibold">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.elite === true ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : row.elite === false ? (
                        <span className="text-red-500 font-semibold">✗</span>
                      ) : (
                        <span className="text-purple-600 text-sm font-semibold">{row.elite}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <span className={`text-gray-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`}>
                    ↓
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              30-Day Money-Back Guarantee
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Try FitTracker Pro risk-free. If you're not completely satisfied within 30 days, 
              we'll refund your money, no questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}