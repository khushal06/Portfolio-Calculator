import React, { useState } from 'react';
import { saveToStorage, loadFromStorage } from '../lib/storage';

const ScenariosPanel = ({ scenarios, setScenarios, onToast }) => {
  const [editingScenario, setEditingScenario] = useState(null);
  const [newScenarioValue, setNewScenarioValue] = useState('');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState(() => {
    const stored = loadFromStorage();
    return stored?.scenarioPresets || {
      'Conservative': [-20, -10, 0, 10, 20],
      'Moderate': [-30, -15, 0, 15, 30],
      'Aggressive': [-50, -25, 0, 25, 50],
      'Custom': [-30, -20, -10, 0, 10, 20, 30, 50]
    };
  });

  const addScenario = () => {
    const value = parseFloat(newScenarioValue);
    if (isNaN(value) || value < -100) {
      onToast('Invalid scenario value. Must be a number >= -100', 'error');
      return;
    }
    
    if (scenarios.includes(value)) {
      onToast('Scenario already exists', 'warning');
      return;
    }
    
    const newScenarios = [...scenarios, value].sort((a, b) => a - b);
    setScenarios(newScenarios);
    setNewScenarioValue('');
    onToast(`Added scenario: ${value}%`, 'success');
  };

  const removeScenario = (index) => {
    if (scenarios.length <= 1) {
      onToast('At least one scenario is required', 'warning');
      return;
    }
    
    const removed = scenarios[index];
    const newScenarios = scenarios.filter((_, i) => i !== index);
    setScenarios(newScenarios);
    onToast(`Removed scenario: ${removed}%`, 'info');
  };

  const updateScenario = (index, newValue) => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value < -100) {
      onToast('Invalid scenario value. Must be a number >= -100', 'error');
      return;
    }
    
    if (scenarios.includes(value) && scenarios[index] !== value) {
      onToast('Scenario already exists', 'warning');
      return;
    }
    
    const newScenarios = [...scenarios];
    newScenarios[index] = value;
    newScenarios.sort((a, b) => a - b);
    setScenarios(newScenarios);
    setEditingScenario(null);
    onToast(`Updated scenario to: ${value}%`, 'success');
  };

  const loadPreset = (presetName) => {
    if (savedPresets[presetName]) {
      setScenarios([...savedPresets[presetName]]);
      onToast(`Loaded preset: ${presetName}`, 'success');
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      onToast('Please enter a preset name', 'warning');
      return;
    }
    
    const newPresets = {
      ...savedPresets,
      [presetName]: [...scenarios]
    };
    
    setSavedPresets(newPresets);
    
    // Save to localStorage
    const currentData = loadFromStorage() || {};
    saveToStorage({
      ...currentData,
      scenarioPresets: newPresets
    });
    
    setPresetName('');
    onToast(`Saved preset: ${presetName}`, 'success');
  };

  const deletePreset = (presetName) => {
    if (window.confirm(`Delete preset "${presetName}"?`)) {
      const newPresets = { ...savedPresets };
      delete newPresets[presetName];
      setSavedPresets(newPresets);
      
      // Update localStorage
      const currentData = loadFromStorage() || {};
      saveToStorage({
        ...currentData,
        scenarioPresets: newPresets
      });
      
      onToast(`Deleted preset: ${presetName}`, 'info');
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter') {
      updateScenario(index, event.target.value);
    } else if (event.key === 'Escape') {
      setEditingScenario(null);
    }
  };

  return (
    <div className="scenarios-panel">
      <h2>Market Scenarios</h2>
      
      <div className="scenarios-panel__section">
        <h3>Current Scenarios</h3>
        <div className="scenarios-list">
          {scenarios.map((scenario, index) => (
            <div key={index} className="scenario-item">
              {editingScenario === index ? (
                <input
                  type="number"
                  step="0.1"
                  defaultValue={scenario}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onBlur={(e) => updateScenario(index, e.target.value)}
                  className="scenario-input"
                  autoFocus
                />
              ) : (
                <span 
                  className="scenario-value"
                  onClick={() => setEditingScenario(index)}
                >
                  {scenario}%
                </span>
              )}
              <button
                onClick={() => removeScenario(index)}
                className="btn btn--small btn--danger"
                disabled={scenarios.length <= 1}
                title="Remove scenario"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="add-scenario">
          <input
            type="number"
            step="0.1"
            value={newScenarioValue}
            onChange={(e) => setNewScenarioValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addScenario()}
            placeholder="Enter scenario %"
            className="scenario-input"
          />
          <button onClick={addScenario} className="btn btn--primary">
            Add
          </button>
        </div>
      </div>

      <div className="scenarios-panel__section">
        <h3>Presets</h3>
        
        <div className="presets-list">
          {Object.keys(savedPresets).map(preset => (
            <div key={preset} className="preset-item">
              <button
                onClick={() => loadPreset(preset)}
                className="btn btn--small btn--secondary"
              >
                Load
              </button>
              <span className="preset-name">{preset}</span>
              <span className="preset-scenarios">
                {savedPresets[preset].map(s => `${s}%`).join(', ')}
              </span>
              <button
                onClick={() => deletePreset(preset)}
                className="btn btn--small btn--danger"
                title="Delete preset"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="save-preset">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && savePreset()}
            placeholder="Preset name"
            className="preset-input"
          />
          <button onClick={savePreset} className="btn btn--primary">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScenariosPanel;
