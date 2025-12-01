import ActivationTimeline from "../sections/ActivationTimeline";
import ClaridaDifference from "../sections/ClaridaDifference";
import Footer from "../sections/Footer";
import GlobalCommunityImpact from "../sections/GlobalCommunityImpact";
import Hero from "../sections/Hero";
import InteractiveRegeneration from "../sections/InteractiveRegeneration";
import RegenerationTimeline from "../sections/RegenerationTimeline";
import Testimonials from "../sections/Testimonials";
import VisionaryGuarantee from "../sections/VisionaryGuarantee";


export default function Homepage() {
  return (
    <>
      <Hero />
      <Footer />
      <InteractiveRegeneration />
      <Testimonials />
      <ClaridaDifference />
      <RegenerationTimeline />
      <ActivationTimeline />
      <VisionaryGuarantee />
      <GlobalCommunityImpact />
    </>
  );
}
