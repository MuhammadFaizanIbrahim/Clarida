import ActivationTimeline from "../sections/ActivationTimeline";
import ClaridaDifference from "../sections/ClaridaDifference";
import GlobalCommunityImpact from "../sections/GlobalCommunityImpact";
import Hero from "../sections/Hero";
import InteractiveRegeneration from "../sections/InteractiveRegeneration";
import RegenerationTimeline from "../sections/RegenerationTimeline";
import Testimonials from "../sections/Testimonials";
import VisionaryGuarantee from "../sections/VisionaryGuarantee";
import ClaridaDifferenceTestimonialsScroll from "../transitions/ClaridaDifferenceTestimonialsScroll";
import HeroInteractiveScroll from "../transitions/HeroInteractiveScroll";


export default function Homepage() {
  return (
    <>
      {/* <Hero />
      <InteractiveRegeneration />
      <Testimonials />
      <ClaridaDifference />
      <RegenerationTimeline />
      <ActivationTimeline />
      <VisionaryGuarantee />
      <GlobalCommunityImpact /> */}
      <HeroInteractiveScroll />
      <ClaridaDifferenceTestimonialsScroll />
    </>
  );
}
