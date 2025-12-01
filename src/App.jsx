import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './sections/Header';
import Homepage from './pages/Homepage';
import Secondpage from './pages/Secondpage';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/store" element={<Secondpage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
