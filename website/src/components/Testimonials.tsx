'use client';

import { useState } from 'react';

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Athlete',
      location: 'Los Angeles, CA',
      image: '👩‍🦰',
      rating: 5,
      text: "FitTracker Pro completely revolutionized my training. The AI form analysis caught issues my coaches missed, and I've improved my performance by 30% in just 3 months. The recovery insights are game-changing for professional athletes.",
      highlights: ['30% performance improvement', 'AI form analysis', 'Recovery optimization'],
      results: {
        before: 'Struggling with form consistency',
        after: 'Perfect form + 30% stronger'
      }
    },
    {
      name: 'Michael Chen',
      role: 'Busy Professional',
      location: 'New York, NY',
      image: '👨‍💼',
      rating: 5,
      text: "As someone with a hectic schedule, FitTracker Pro's AI optimization ensures I get maximum results from my limited workout time. The app adapts perfectly to my recovery needs and stress levels from work.",
      highlights: ['Time-efficient workouts', 'Stress-aware training', 'Busy schedule optimization'],
      results: {
        before: 'Inconsistent workouts, low energy',
        after: 'Consistent gains, high energy'
      }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Fitness Enthusiast',
      location: 'Miami, FL',
      image: '👩‍🏋️',
      rating: 5,
      text: "I've tried every fitness app out there, but nothing comes close to FitTracker Pro. The personalized nutrition recommendations and workout adaptations based on my progress are incredible. I finally broke through my plateau!",
      highlights: ['Broke through plateau', 'Personalized nutrition', 'Adaptive workouts'],
      results: {
        before: 'Stuck at fitness plateau',
        after: 'New personal records weekly'
      }
    },
    {
      name: 'David Thompson',
      role: 'Former Injury Rehabilitation',
      location: 'Seattle, WA',
      image: '👨‍⚕️',
      rating: 5,
      text: "After my knee injury, I was afraid to return to intense training. FitTracker Pro's injury prevention AI and gradual progression algorithms helped me come back stronger than ever while staying safe.",
      highlights: ['Injury prevention', 'Safe progression', 'Stronger than before'],
      results: {
        before: 'Fear of re-injury',
        after: 'Confident, injury-free training'
      }
    },
    {
      name: 'Jessica Park',
      role: 'New Mom',
      location: 'Austin, TX',
      image: '👩‍👶',
      rating: 5,
      text: "Getting back into fitness after pregnancy was challenging. FitTracker Pro understood my changing energy levels and created workouts that fit my new lifestyle. The recovery tracking helped me listen to my body.",
      highlights: ['Post-pregnancy fitness', 'Energy level adaptation', 'Body awareness'],
      results: {
        before: 'No time for proper workouts',
        after: 'Consistent fitness routine'
      }
    },
    {
      name: 'Robert Kim',
      role: 'Senior Fitness Enthusiast',
      location: 'Phoenix, AZ',
      image: '👨‍🦳',
      rating: 5,
      text: "At 55, I thought my best fitness days were behind me. FitTracker Pro's age-appropriate AI adjustments and joint-friendly modifications helped me achieve the best shape of my life safely and effectively.",
      highlights: ['Age-appropriate training', 'Joint-friendly workouts', 'Best shape ever'],
      results: {
        before: 'Declining fitness with age',
        after: 'Fittest at 55'
      }
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '4.9/5', label: 'App Store Rating' },
    { number: '98%', label: 'User Satisfaction' },
    { number: '2M+', label: 'Workouts Completed' }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Real Results from Real People
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of users who have transformed their fitness journey with FitTracker Pro
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-cyan-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Testimonial */}
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 mb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="text-6xl mr-4">{testimonials[currentTestimonial].image}</div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{testimonials[currentTestimonial].name}</h3>
                  <p className="text-cyan-600 font-semibold">{testimonials[currentTestimonial].role}</p>
                  <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].location}</p>
                </div>
              </div>
              
              {/* Star Rating */}
              <div className="flex items-center mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
                <span className="ml-2 text-gray-600 font-medium">5.0/5</span>
              </div>

              <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>

              {/* Highlights */}
              <div className="space-y-2">
                {testimonials[currentTestimonial].highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Before/After */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Transformation Story</h4>
                
                <div className="space-y-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 font-semibold text-sm mb-2">BEFORE</div>
                    <div className="text-gray-700">{testimonials[currentTestimonial].results.before}</div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">→</span>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 font-semibold text-sm mb-2">AFTER</div>
                    <div className="text-gray-700">{testimonials[currentTestimonial].results.after}</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="bg-cyan-500 text-white rounded-full px-4 py-2 text-sm font-semibold inline-block">
                    🏆 Success Story
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`p-4 rounded-xl transition-all ${
                    currentTestimonial === index
                      ? 'bg-cyan-100 border-2 border-cyan-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="text-3xl mb-2">{testimonial.image}</div>
                  <div className="text-xs font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.filter((_, index) => index !== currentTestimonial).slice(0, 3).map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.image}</div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-cyan-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                "{testimonial.text.substring(0, 120)}..."
              </p>
              
              <button
                onClick={() => setCurrentTestimonial(testimonials.indexOf(testimonial))}
                className="mt-4 text-cyan-600 text-sm font-semibold hover:text-cyan-700 transition-colors"
              >
                Read Full Story →
              </button>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Trusted & Secure</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="font-semibold text-gray-900">HIPAA Compliant</div>
                <div className="text-sm text-gray-600">Your health data is secure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏥</div>
                <div className="font-semibold text-gray-900">Medical Grade</div>
                <div className="text-sm text-gray-600">FDA approved algorithms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-semibold text-gray-900">Science-Based</div>
                <div className="text-sm text-gray-600">Peer-reviewed research</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌟</div>
                <div className="font-semibold text-gray-900">Award Winning</div>
                <div className="text-sm text-gray-600">Best Fitness App 2024</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Transformation?
          </h3>
          <a
            href="#download"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Join 10,000+ Success Stories
          </a>
        </div>
      </div>
    </section>
  );
}