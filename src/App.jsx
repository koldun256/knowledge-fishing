import React, { useState } from 'react';
import Layout from './components/common/Layout';
import Pond from './components/Pond';
import PondList from './pages/PondList'
import Admin from './pages/Admin'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [currentPondId, setCurrentPondId] = useState(1);

  const handlePondSelect = (pondId) => {
    setCurrentPondId(pondId);
  };

  const handleBackToPonds = () => {
    setCurrentPondId(null);
  };

  // return (
  //   <Layout showBackButton={!!currentPondId} onBack={handleBackToPonds}>
  //     <Pond pondId={currentPondId} />
  //   </Layout>
  // );

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<PondList />} />
          <Route path="/pond/:pondId" element={<Pond />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;