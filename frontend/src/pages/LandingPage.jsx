import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/contact/submit', contactForm);
      toast.success('Message sent! We will get back to you.');
      setShowContact(false);
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                CogniCare+
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowContact(true)} className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Contact Us
              </button>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Empowering Children Through
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"> Digital Therapy</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                A gamified therapy platform designed for children with cognitive disorders. Make therapy fun, engaging, and effective.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="btn-primary text-lg">
                  Start Free Trial
                </Link>
                <Link to="/login" className="btn-secondary text-lg">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl">
                    <span>🔥</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">7 Day Streak!</p>
                    <p className="text-gray-500">Keep it up, Superstar!</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-xl">
                    <span className="text-3xl">🧩</span>
                    <div>
                      <p className="font-semibold text-gray-900">Memory Match</p>
                      <p className="text-sm text-gray-500">Completed - Score: 95</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <p className="font-semibold text-gray-900">Color Sorting</p>
                      <p className="text-sm text-gray-500">In Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects children with certified therapists through engaging, gamified activities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '👨‍👩‍👧‍👦', title: '1. Parent Registration', desc: 'Parents sign up and register their child with medical details' },
              { icon: '👨‍⚕️', title: '2. Doctor Assignment', desc: 'Our system matches your child with a certified therapist' },
              { icon: '🎮', title: '3. Fun Therapy', desc: 'Children engage in gamified activities prescribed by doctors' },
            ].map((step, i) => (
              <div key={i} className="card text-center hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              Features That Make a Difference
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📊', title: 'Progress Tracking', desc: 'Real-time analytics for parents and doctors' },
              { icon: '🎁', title: 'Rewards System', desc: 'Badges and rewards to motivate children' },
              { icon: '📹', title: 'Video Sessions', desc: 'Google Meet integration for live sessions' },
              { icon: '🥽', title: 'VR Therapy', desc: 'Immersive YouTube-based relaxation content' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
              What Parents Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah M.', text: 'My daughter looks forward to her therapy sessions! The gamification keeps her engaged.' },
              { name: 'James D.', text: 'The progress reports help us understand our son\'s improvement. Highly recommend!' },
              { name: 'Emily R.', text: 'Best investment we\'ve made for our child\'s development. The doctors are amazing.' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {'★★★★★'.split('').map((star, j) => <span key={j}>{star}</span>)}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-gray-900">- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about CogniCare+? We'd love to hear from you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">support@cognicare.com</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-gray-600">123 Wellness Ave, Health City</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button onClick={() => setShowContact(true)} className="btn-primary text-lg">
              Send us a Message
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="font-display font-bold text-2xl">CogniCare+</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 CogniCare+. All rights reserved. Making therapy fun for children.
            </p>
          </div>
        </div>
      </footer>

      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">Contact Us</h3>
              <button onClick={() => setShowContact(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <input placeholder="Your Name *" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="input-field" required />
              <input type="email" placeholder="Email *" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="input-field" required />
              <input placeholder="Phone" value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} className="input-field" />
              <input placeholder="Subject" value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} className="input-field" />
              <textarea placeholder="Your Message *" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="input-field" rows="4" required />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
                <button type="button" onClick={() => setShowContact(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
