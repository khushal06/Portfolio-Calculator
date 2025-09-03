import React, { useRef } from 'react';
import { generateCSVTemplate, exportToCSV, importCSVFromFile } from '../lib/csv';
import { importFromJSON, exportToJSON } from '../lib/storage';

const PortfolioForm = ({ 
  capital, 
  setCapital, 
  fees, 
  setFees, 
  assets, 
  setAssets, 
  onReset,
  onHighContrastToggle,
  highContrast,
  onToast 
}) => {
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const handleExportJSON = () => {
    const data = {
      capital,
      fees,
      assets,
      scenarios: [-30, -20, -10, 0, 10, 20, 30, 50],
      targetWeights: {}
    };
    
    if (exportToJSON(data)) {
      onToast('Portfolio exported to JSON', 'success');
    } else {
      onToast('Failed to export portfolio', 'error');
    }
  };

  const handleImportJSON = () => {
    jsonInputRef.current?.click();
  };

  const handleJSONFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await importFromJSON(file);
      setCapital(data.capital);
      setFees(data.fees);
      setAssets(data.assets);
      onToast('Portfolio imported from JSON', 'success');
    } catch (error) {
      onToast(`Import failed: ${error.message}`, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleCSVTemplate = () => {
    generateCSVTemplate();
    onToast('CSV template downloaded', 'info');
  };

  const handleExportCSV = () => {
    if (assets.length === 0) {
      onToast('No assets to export', 'warning');
      return;
    }
    exportToCSV(assets);
    onToast('Assets exported to CSV', 'success');
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleCSVFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedAssets = await importCSVFromFile(file);
      setAssets(importedAssets);
      onToast(`Imported ${importedAssets.length} assets from CSV`, 'success');
    } catch (error) {
      onToast(`CSV import failed: ${error.message}`, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the portfolio? This will clear all data.')) {
      onReset();
      onToast('Portfolio reset', 'info');
    }
  };

  return (
    <div className="portfolio-form">
      <div className="portfolio-form__section">
        <h2>Portfolio Settings</h2>
        
        <div className="form-group">
          <label htmlFor="capital">Total Capital ($)</label>
          <input
            id="capital"
            type="number"
            min="0"
            step="0.01"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value) || 0)}
            placeholder="10000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fee-percentage">Fee Percentage (%)</label>
          <input
            id="fee-percentage"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={fees.percentage}
            onChange={(e) => setFees({ ...fees, percentage: parseFloat(e.target.value) || 0 })}
            placeholder="1.0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fee-flat">Flat Fee ($)</label>
          <input
            id="fee-flat"
            type="number"
            min="0"
            step="0.01"
            value={fees.flat}
            onChange={(e) => setFees({ ...fees, flat: parseFloat(e.target.value) || 0 })}
            placeholder="10.00"
          />
        </div>
      </div>

      <div className="portfolio-form__section">
        <h3>Data Management</h3>
        
        <div className="button-group">
          <button onClick={handleExportJSON} className="btn btn--secondary">
            Export JSON
          </button>
          <button onClick={handleImportJSON} className="btn btn--secondary">
            Import JSON
          </button>
        </div>

        <div className="button-group">
          <button onClick={handleCSVTemplate} className="btn btn--secondary">
            CSV Template
          </button>
          <button onClick={handleExportCSV} className="btn btn--secondary">
            Export CSV
          </button>
          <button onClick={handleImportCSV} className="btn btn--secondary">
            Import CSV
          </button>
        </div>

        <div className="button-group">
          <button onClick={handleReset} className="btn btn--danger">
            Reset Portfolio
          </button>
          <button 
            onClick={onHighContrastToggle} 
            className={`btn btn--secondary ${highContrast ? 'btn--active' : ''}`}
          >
            High Contrast
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCSVFileChange}
        style={{ display: 'none' }}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={handleJSONFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default PortfolioForm;