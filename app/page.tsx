import FeaturesGridSection from "./components/FeaturesGridSection";
import FinalCtaSection from "./components/FinalCtaSection";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import PopularDestinationsSection from "./components/PopularDestinationsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FAQSection from "./components/FAQSection";
import WaveDivider from "./components/WaveDivider";
import WaveDividerAlt from "./components/WaveDividerAlt";
import WhyChooseSection from "./components/WhyChooseSection";

export default function Page() {
  return (
    <main>
      <HeroSection />
      <WhyChooseSection />
      <WaveDivider />
      <FeaturesGridSection />
      <PopularDestinationsSection />
      <WaveDividerAlt />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCtaSection />
    </main>
  );
}
