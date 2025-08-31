import React, { useState } from 'react';
import Layout from './components/common/Layout';
import PondList from './components/pond/PondList';
import Pond from './components/pond/Pond';

function App() {
  const [currentPondId, setCurrentPondId] = useState(null);

  const handlePondSelect = (pondId) => {
    setCurrentPondId(pondId);
  };

  const handleBackToPonds = () => {
    setCurrentPondId(null);
  };

  return (
    <Layout showBackButton={!!currentPondId} onBack={handleBackToPonds}>
      {currentPondId ? (
        <Pond pondId={currentPondId} />
      ) : (
        <PondList onPondSelect={handlePondSelect} />
      )}
    </Layout>
  );
}

export default App;