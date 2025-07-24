import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Screenshots from '@/components/Screenshots';
import AIShowcase from '@/components/AIShowcase';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Download from '@/components/Download';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Screenshots />
      <AIShowcase />
      <Testimonials />
      <Pricing />
      <Download />
      <Footer />
    </div>
  );
}
