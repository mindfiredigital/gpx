import type { ReactNode } from 'react';
import Layout from '@theme/Layout';
import { HeroSection } from '../components/HomePage/HeroSection'
import { FeaturesSection } from '../components/HomePage/FeaturesSection';
import { CTASection } from '../components/HomePage/CTASection';

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="Git Profile eXchanger - switch between git identities instantly"
    >
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </Layout>
  );
}