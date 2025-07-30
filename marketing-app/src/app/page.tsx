'use client'

import { useState } from 'react'
import styles from '../styles/marketing.module.css'
import {
  Menu,
  X,
  ChevronRight,
  Clock,
  Award,
  Shield,
  TrendingUp,
  BarChart,
  Smartphone,
  Users,
  Clipboard,
  DollarSign,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'react-feather'
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.page}>
      <header className={styles.headerMain}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h2>Seams & Status</h2>
          </div>

          <nav className={styles.nav}>
            <div className={styles.navLinks}>
              <a href="#features">Features</a>
              <a href="#how-it-works">How it Works</a>
              <a href="#benefits">Benefits</a>
            </div>
            <div className={styles.authButtons}>
              <a href={`${mainAppUrl}/login`} className={styles.loginButton} target="_blank" rel="noopener noreferrer">Login</a>
              <ThemeToggle />
              <a href={`${mainAppUrl}/signup`} className={`${styles.button} ${styles.primaryButton}`} target="_blank" rel="noopener noreferrer">
                Get Started
              </a>
            </div>
          </nav>

          <div className={styles.mobileNav}>
            <ThemeToggle />
            <button className={styles.hamburgerButton} onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`} onClick={toggleSidebar}></div>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Menu</h3>
          <button className={styles.closeButton} onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="#features" onClick={toggleSidebar}>Features</a>
          <a href="#how-it-works" onClick={toggleSidebar}>How it Works</a>
          <a href="#benefits" onClick={toggleSidebar}>Benefits</a>
        </nav>
        <div className={styles.sidebarCta}>
          <a href={`${mainAppUrl}/signup`} className={`${styles.button} ${styles.primaryButton}`} target="_blank" rel="noopener noreferrer">
            Get Started
          </a>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Hero Section */}
          <section className={`${styles.section} ${styles.hero}`}>
            <div className={styles.heroText}>
              <h1>
                Ditch the Pen and Paper.
                Modernize Your Tailoring Business.
              </h1>
              <p>
                The simple, modern way for tailors to manage customers,
                measurements, orders, and payments. All in one place.
              </p>
              <div className={styles.heroButtons}>
                <a href={`${mainAppUrl}/signup`} className={`${styles.button} ${styles.primaryButton} ${styles.largeButton}`} target="_blank" rel="noopener noreferrer">
                  Start Free Today
                </a>
                <a href="#features" className={`${styles.button} ${styles.secondaryButton} ${styles.largeButton}`}>
                  Learn More <ChevronRight size={20} />
                </a>
              </div>
            </div>
            <div
              className={styles.heroImage}
              style={{ backgroundImage: 'url(/header.png)' }}
            ></div>
          </section>

          {/* Problem Section */}
          <section className={styles.section}>
            <div className={styles.problemSection}>
              <h2 className={styles.sectionTitle}>Common Tailoring Business Challenges</h2>
              <p className={styles.sectionSubtitle}>
                We understand the daily struggles that tailors face when managing their business manually.
              </p>
              <div className={styles.problemGrid}>
                <div className={styles.problemCard}>
                  <h3>Lost Paperwork</h3>
                  <p>Customer measurements and order details get misplaced, causing delays and frustration.</p>
                </div>
                <div className={styles.problemCard}>
                  <h3>Payment Confusion</h3>
                  <p>Tracking deposits, payments, and outstanding balances becomes a nightmare with manual records.</p>
                </div>
                <div className={styles.problemCard}>
                  <h3>Order Mix-ups</h3>
                  <p>Without clear tracking, orders get mixed up, delivery dates are missed, and customers get upset.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className={styles.section}>
            <h2 className={styles.sectionTitle}>Everything You Need to Run Your Business</h2>
            <p className={styles.sectionSubtitle}>
              Powerful features designed specifically for tailoring businesses, yet simple enough to use every day.
            </p>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <Users size={32} color="var(--primary-600)" />
                <h3>Customer Management</h3>
                <p>Store customer profiles with contact information and access their complete measurement history instantly.</p>
              </div>
              <div className={styles.featureCard}>
                <Clipboard size={32} color="var(--primary-600)" />
                <h3>Digital Measurements</h3>
                <p>Gender-specific measurement forms with validation. Reuse previous measurements for returning customers.</p>
              </div>
              <div className={styles.featureCard}>
                <CheckCircle size={32} color="var(--primary-600)" />
                <h3>Order Tracking</h3>
                <p>Track orders from creation to completion with clear status updates and fitting appointments.</p>
              </div>
              <div className={styles.featureCard}>
                <DollarSign size={32} color="var(--primary-600)" />
                <h3>Payment Management</h3>
                <p>Record deposits, track payments, and automatically calculate outstanding balances for every order.</p>
              </div>
            </div>
          </section>

          {/* How it Works Section */}
          <section id="how-it-works" className={styles.section}>
            <h2 className={styles.sectionTitle}>How Seams & Status Works</h2>
            <p className={styles.sectionSubtitle}>
              Get started in minutes with our simple, intuitive workflow designed for busy tailors.
            </p>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <h3>Add Your Customer</h3>
                <p>Create a customer profile with their name, contact information, and preferred measurement units.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <h3>Take Measurements</h3>
                <p>Use our gender-specific forms to record measurements digitally. No more lost paper notes!</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <h3>Create Order</h3>
                <p>Link measurements to orders, set delivery dates, record material costs and initial payments.</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>4</div>
                <h3>Track Progress</h3>
                <p>Update order status, schedule fittings, and mark orders as completed when delivered.</p>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section id="benefits" className={styles.section}>
            <div className={styles.benefitsSection}>
              <h2 className={styles.sectionTitle}>Why Tailors Love Seams & Status</h2>
              <p className={styles.sectionSubtitle}>
                We built our app from the ground up to solve the real-world problems that tailors face every day.
              </p>
              <div className={styles.benefitsGrid}>
                <div className={styles.benefitCard}>
                  <Clock size={32} color="var(--success-600)" />
                  <h3>Save 2+ Hours Daily</h3>
                  <p>No more searching through papers, calculating balances manually, or trying to remember order statuses.</p>
                </div>
                <div className={styles.benefitCard}>
                  <Shield size={32} color="var(--success-600)" />
                  <h3>Reduce Errors by 90%</h3>
                  <p>Digital records mean no more lost measurements, forgotten payments, or missed deadlines.</p>
                </div>
                <div className={styles.benefitCard}>
                  <TrendingUp size={32} color="var(--success-600)" />
                  <h3>Serve More Customers</h3>
                  <p>Streamlined workflow means you can handle more orders without the stress and confusion.</p>
                </div>
                <div className={styles.benefitCard}>
                  <Award size={32} color="var(--success-600)" />
                  <h3>Professional Image</h3>
                  <p>Impress customers with organized digital records and timely order updates.</p>
                </div>
                <div className={styles.benefitCard}>
                  <BarChart size={32} color="var(--success-600)" />
                  <h3>Clear Financial Overview</h3>
                  <p>Instantly see outstanding balances and full payment histories for every single order. Never lose track of a payment again.</p>
                </div>
                <div className={styles.benefitCard}>
                  <Smartphone size={32} color="var(--success-600)" />
                  <h3>Access Anywhere</h3>
                  <p>Your business data is securely stored in the cloud, available on your phone, tablet, or computer.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonial */}
          <section className={styles.section}>
            <div className={styles.testimonial}>
              <p>
                &quot;Seams & Status transformed my tailoring business. I can now serve twice as many customers
                with half the stress. My customers love how organized and professional I&apos;ve become!&quot;
              </p>
              <footer>
                Funmilayo Ibiteye, CEO Of Exxential D'Services
              </footer>
            </div>
          </section>

          {/* CTA Section */}
          <section className={styles.section}>
            <div className={styles.ctaSection}>
              <h2 className={styles.sectionTitle}>Ready to Modernize Your Business?</h2>
              <p className={styles.sectionSubtitle}>
                Join hundreds of tailors who have already transformed their businesses with Seams & Status.
              </p>
              <div className={styles.ctaButtons}>
                <a href={`${mainAppUrl}/signup`} className={`${styles.button} ${styles.largeButton}`} target="_blank" rel="noopener noreferrer">
                  Start Your Free Trial
                </a>
                <p className={styles.ctaNote}>No credit card required • Setup in under 5 minutes</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>Seams & Status</h3>
            <p>Modernizing tailoring businesses, one stitch at a time.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="/pricing">Pricing</a>
              <a href="/demo">Demo</a>
              <a href="/support">Support</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="/about">About</a>
              <a href="/contact">Contact</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
          </div>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={20} />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © 2024 Seams & Status. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
