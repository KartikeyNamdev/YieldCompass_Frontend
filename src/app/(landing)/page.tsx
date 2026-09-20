import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/HeroSection'
import { MarqueeTrack } from '@/components/landing/MarqueeTrack'
import { TheGapSection } from '@/components/landing/TheGapSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { BentoDifferentiators } from '@/components/landing/BentoDifferentiators'
import { FixedTermVaultSection } from '@/components/landing/FixedTermVaultSection'
import { RiskScoreSection } from '@/components/landing/RiskScoreSection'
import { BuiltWithSection } from '@/components/landing/BuiltWithSection'
import { HonestCardsSection } from '@/components/landing/HonestCardsSection'
import { FinalCtaAndFooter } from '@/components/landing/FinalCtaAndFooter'

export const metadata: Metadata = {
  title: 'YieldCompass — Realized APY Explorer for Solana',
  description:
    'YieldCompass ranks Solana stablecoin yield by what pools really earned, scores their risk with cited sources, and offers a fixed-term vault with a target rate backed by a first-loss buffer.',
  keywords: ['Solana', 'DeFi', 'yield', 'realized yield', 'fixed-term vault', 'stablecoin', 'risk scoring'],
  openGraph: {
    title: 'YieldCompass — Realized Yield, Not Headline Yield',
    description:
      'See what DeFi pools actually paid. Deterministic risk scores, verifiable citations, and structured vaults with first-loss protection.',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1 & 2: Floating Navbar + Hero Section */}
      <HeroSection />

      {/* 3: Marquee Yield Sources We Track */}
      <MarqueeTrack />

      {/* 4: The Gap (Headline vs Realized) */}
      <TheGapSection />

      {/* 5: How It Works */}
      <HowItWorksSection />

      {/* 6: Bento Grid Differentiators */}
      <BentoDifferentiators />

      {/* 7: Fixed-Term Vault & Waterfall Scenario Simulator */}
      <FixedTermVaultSection />

      {/* 8: Risk Score & 7 Factor Breakdown */}
      <RiskScoreSection />

      {/* 9: Built With Stack Chips */}
      <BuiltWithSection />

      {/* 10: Honest Cards: What this is and is not */}
      <HonestCardsSection />

      {/* 11: Final CTA + Full Legal Disclaimer Footer */}
      <FinalCtaAndFooter />
    </div>
  )
}
