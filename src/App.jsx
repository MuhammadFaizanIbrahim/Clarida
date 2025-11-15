import './App.css'
import Header from './sections/Header';
import Hero from './sections/Hero';
import Testimonials from './sections/Testimonials';

function App() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <Header />
      <Hero />
      <Testimonials />
    </div>
  );
}

export default App;
