import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { HeroSection } from '../components/HomePage/HeroSection';
import { DemoSection } from '../components/HomePage/DemoSection';
import { FeaturesSection } from '../components/HomePage/FeaturesSection';
import { CTASection } from '../components/HomePage/CTASection';

const CyberGrid = () => (
  <div 
    className="fixed inset-0 pointer-events-none opacity-[0.45] z-[0]"
    style={{
        backgroundImage: 'linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
    }}
  />
);

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="Git Profile eXchanger - switch between git identities instantly"
    >
      <CyberGrid />
      <div className="relative z-10">
        <HeroSection />
        <DemoSection />
        <FeaturesSection />
        <CTASection />
      </div>
    </Layout>
  );
}