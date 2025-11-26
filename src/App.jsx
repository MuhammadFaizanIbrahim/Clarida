import './App.css'
import ActivationTimeline from './sections/ActivationTimeline';
import ClaridaDifference from './sections/ClaridaDifference';
import Header from './sections/Header';
import Hero from './sections/Hero';
import InteractiveRegeneration from './sections/InteractiveRegeneration';
import RegenerationTimeline from './sections/RegenerationTimeline';
import Testimonials from './sections/Testimonials';
import VisionaryGuarantee from './sections/VisionaryGuarantee';

function App() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <Header />
      <Hero />
      <InteractiveRegeneration />
      <Testimonials />
      <ClaridaDifference />
      <RegenerationTimeline />
      <ActivationTimeline />
      <VisionaryGuarantee />
    </div>
  );
}

export default App;
