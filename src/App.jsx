import React, { useState } from 'react';
import Layout from './components/common/Layout';
import Pond from './components/Pond';

function App() {
  const [currentPondId, setCurrentPondId] = useState(1);

  const handlePondSelect = (pondId) => {
    setCurrentPondId(pondId);
  };

  const handleBackToPonds = () => {
    setCurrentPondId(null);
  };

  return (
    <Layout showBackButton={!!currentPondId} onBack={handleBackToPonds}>
      <Pond pondId={currentPondId} />
    </Layout>
  );
}

export default App;