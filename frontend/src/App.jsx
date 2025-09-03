import React, { useState, useEffect, useCallback } from 'react';
import { api } from './lib/api';
import { saveToStorage, loadFromStorage } from './lib/storage';
import { validatePortfolio } from './lib/calc';
import PortfolioForm from './components/PortfolioForm';
import AssetsTable from './components/AssetsTable';
import ScenariosPanel from './components/ScenariosPanel';
import TotalsBar from './components/TotalsBar';
import ScenarioTable from './components/ScenarioTable';
import TargetsPanel from './components/TargetsPanel';
import ChartsPanel from './components/ChartsPanel';
import RebalancePanel from './components/RebalancePanel';
import Toast from './components/Toast';

function App() {
  // State
  const [capital, setCapital] = useState(10000);
  const [fees, setFees] = useState({ percentage: 0.0, flat: 0.0 });
  const [assets, setAssets] = useState([]);
  const [scenarios, setScenarios] = useState([-30, -20, -10, 0, 10, 20, 30, 50]);
  const [targetWeights, setTargetWeights] = useState({});
  const [highContrast, setHighContrast] = useState(false);
  const [calculationResult, setCalculationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setCapital(savedData.capital);
      setFees(savedData.fees);
      setAssets(savedData.assets);
      setScenarios(savedData.scenarios);
      setTargetWeights(savedData.targetWeights);
      setHighContrast(savedData.highContrast);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data = {
      capital,
      fees,
      assets,
      scenarios,
      targetWeights,
      highContrast
    };
    saveToStorage(data);
  }, [capital, fees, assets, scenarios, targetWeights, highContrast]);

  // Toast management
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Calculate scenarios
  const calculateScenarios = useCallback(async () => {
    if (assets.length === 0) {
      addToast('No assets to calculate scenarios for', 'warning');
      return;
    }

    const validationErrors = validatePortfolio(capital, assets, fees);
    if (validationErrors.length > 0) {
      addToast(`Validation errors: ${validationErrors.join(', ')}`, 'error');
      return;
    }

    setLoading(true);
    try {
      const request = {
        capital,
        assets,
        scenarios,
        fees
      };

      const result = await api.calculateScenario(request);
      setCalculationResult(result);
      addToast('Scenarios calculated successfully', 'success');
    } catch (error) {
      addToast(`Failed to calculate scenarios: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [capital, assets, scenarios, fees, addToast]);

  // Reset portfolio
  const resetPortfolio = useCallback(() => {
    setCapital(10000);
    setFees({ percentage: 0.0, flat: 0.0 });
    setAssets([]);
    setScenarios([-30, -20, -10, 0, 10, 20, 30, 50]);
    setTargetWeights({});
    setCalculationResult(null);
  }, []);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + D to duplicate selected asset
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        // This would need to be implemented in AssetsTable
      }
      
      // Enter to add asset (if focused on last row)
      if (event.key === 'Enter' && event.target.tagName !== 'INPUT') {
        // This would need to be implemented in AssetsTable
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-calculate scenarios when relevant data changes
  useEffect(() => {
    if (assets.length > 0 && scenarios.length > 0) {
      const timeoutId = setTimeout(() => {
        calculateScenarios();
      }, 1000); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [assets, scenarios, capital, fees, calculateScenarios]);

  return (
    <div className={`app ${highContrast ? 'app--high-contrast' : ''}`}>
      <header className="app__header">
        <h1>Portfolio Calculator</h1>
        <p>Advanced portfolio analysis and rebalancing tool</p>
      </header>

      <main className="app__main">
        <div className="app__grid">
          {/* Left Column */}
          <div className="app__column">
            <PortfolioForm
              capital={capital}
              setCapital={setCapital}
              fees={fees}
              setFees={setFees}
              assets={assets}
              setAssets={setAssets}
              onReset={resetPortfolio}
              onHighContrastToggle={toggleHighContrast}
              highContrast={highContrast}
              onToast={addToast}
            />

            <AssetsTable
              assets={assets}
              setAssets={setAssets}
              onToast={addToast}
            />

            <ScenariosPanel
              scenarios={scenarios}
              setScenarios={setScenarios}
              onToast={addToast}
            />
          </div>

          {/* Right Column */}
          <div className="app__column">
            <TotalsBar
              capital={capital}
              assets={assets}
              fees={fees}
              calculationResult={calculationResult}
            />

            <ScenarioTable
              results={calculationResult?.results}
              fees={fees}
            />

            <TargetsPanel
              assets={assets}
              capital={capital}
              fees={fees}
              onToast={addToast}
            />

            <RebalancePanel
              assets={assets}
              capital={capital}
              fees={fees}
              onToast={addToast}
            />

            <ChartsPanel
              assets={assets}
              scenarios={scenarios}
              calculationResult={calculationResult}
            />
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Calculating...</p>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
