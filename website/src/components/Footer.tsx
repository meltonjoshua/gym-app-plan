export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Screenshots', href: '#screenshots' },
      { name: 'AI Technology', href: '#ai' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Download', href: '#download' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'System Status', href: '/status' },
      { name: 'Release Notes', href: '/releases' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Data Processing', href: '/data' },
      { name: 'Compliance', href: '/compliance' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: '🐦' },
    { name: 'Instagram', href: '#', icon: '📸' },
    { name: 'YouTube', href: '#', icon: '📺' },
    { name: 'TikTok', href: '#', icon: '🎵' },
    { name: 'LinkedIn', href: '#', icon: '💼' },
    { name: 'Discord', href: '#', icon: '💬' }
  ];

  const certifications = [
    { name: 'HIPAA Compliant', icon: '🏥' },
    { name: 'GDPR Ready', icon: '🇪🇺' },
    { name: 'SOC 2 Type II', icon: '🔒' },
    { name: 'FDA Cleared', icon: '✅' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">FT</span>
              </div>
              <span className="text-2xl font-bold">FitTracker Pro</span>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Transform your fitness journey with AI-powered form analysis, personalized workouts, 
              and intelligent recovery recommendations. Your complete fitness companion.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg font-semibold transition-all text-sm">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    title={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* App Download Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div>
              <h4 className="font-semibold mb-4">Download FitTracker Pro</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="flex items-center space-x-2 bg-black hover:bg-gray-800 rounded-lg px-4 py-2 transition-colors"
                >
                  <span className="text-xl">🍎</span>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 bg-black hover:bg-gray-800 rounded-lg px-4 py-2 transition-colors"
                >
                  <span className="text-xl">📱</span>
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <h4 className="font-semibold mb-4 text-center lg:text-right">Security & Compliance</h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-1">{cert.icon}</div>
                    <div className="text-xs text-gray-400">{cert.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <h4 className="font-semibold mb-6 text-center">Awards & Recognition</h4>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-sm font-semibold">App of the Year</div>
              <div className="text-xs text-gray-400">Apple App Store 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm font-semibold">Editor's Choice</div>
              <div className="text-xs text-gray-400">Google Play 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🥇</div>
              <div className="text-sm font-semibold">Best Health App</div>
              <div className="text-xs text-gray-400">TechCrunch 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-sm font-semibold">Innovation Award</div>
              <div className="text-xs text-gray-400">CES 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm font-semibold">Design Excellence</div>
              <div className="text-xs text-gray-400">UX Awards 2024</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-semibold">Startup of Year</div>
              <div className="text-xs text-gray-400">Forbes 2024</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-6 text-sm text-gray-400">
              <p>&copy; {currentYear} FitTracker Pro. All rights reserved.</p>
              <div className="flex space-x-4">
                <span>Made with ❤️ in San Francisco</span>
                <span>•</span>
                <span>Trusted by 1M+ users worldwide</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>v2.0.1</span>
              <span>•</span>
              <a href="/status" className="hover:text-white transition-colors">
                <span className="inline-flex items-center space-x-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>All systems operational</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}