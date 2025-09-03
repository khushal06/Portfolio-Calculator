import React, { useState, useRef, useEffect } from 'react';
import { safeEval, roundShares, validateAsset } from '../lib/calc';

const AssetsTable = ({ assets, setAssets, onToast }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [duplicateIndex, setDuplicateIndex] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const addAsset = () => {
    const newAsset = {
      ticker: '',
      buy_price: 0,
      shares: 0,
      sector: '',
      take_profit_pct: null,
      stop_loss_pct: null,
      fee_override: null
    };
    setAssets([...assets, newAsset]);
    setEditingCell({ row: assets.length, field: 'ticker' });
  };

  const removeAsset = (index) => {
    if (window.confirm(`Remove ${assets[index].ticker || 'this asset'}?`)) {
      setAssets(assets.filter((_, i) => i !== index));
      onToast('Asset removed', 'info');
    }
  };

  const duplicateAsset = (index) => {
    const asset = assets[index];
    const duplicatedAsset = {
      ...asset,
      ticker: asset.ticker + '_COPY'
    };
    setAssets([...assets.slice(0, index + 1), duplicatedAsset, ...assets.slice(index + 1)]);
    setDuplicateIndex(index + 1);
    onToast('Asset duplicated', 'info');
  };

  const updateAsset = (index, field, value) => {
    const updatedAssets = [...assets];
    let processedValue = value;

    // Handle special cases for different fields
    if (field === 'ticker') {
      processedValue = value.toUpperCase().trim();
    } else if (field === 'buy_price' || field === 'shares') {
      // Try to evaluate mathematical expressions
      if (typeof value === 'string' && value.includes('/')) {
        const result = safeEval(value);
        if (result !== null) {
          processedValue = result;
        }
      } else {
        processedValue = parseFloat(value) || 0;
      }
    } else if (field === 'take_profit_pct' || field === 'stop_loss_pct' || field === 'fee_override') {
      processedValue = value === '' ? null : parseFloat(value);
    } else if (field === 'sector') {
      processedValue = value.trim();
    }

    // Round shares to reasonable precision
    if (field === 'shares') {
      processedValue = roundShares(processedValue, 4);
    }

    updatedAssets[index] = {
      ...updatedAssets[index],
      [field]: processedValue
    };

    setAssets(updatedAssets);
  };

  const handleKeyDown = (event, index, field) => {
    if (event.key === 'Enter') {
      setEditingCell(null);
      // Move to next field or add new asset
      if (field === 'ticker') {
        setEditingCell({ row: index, field: 'buy_price' });
      } else if (field === 'buy_price') {
        setEditingCell({ row: index, field: 'shares' });
      } else if (field === 'shares') {
        setEditingCell({ row: index, field: 'sector' });
      } else {
        setEditingCell(null);
        if (index === assets.length - 1) {
          addAsset();
        }
      }
    } else if (event.key === 'Escape') {
      setEditingCell(null);
    } else if (event.key === 'Delete' && !editingCell) {
      removeAsset(index);
    }
  };

  const handleCellClick = (row, field) => {
    setEditingCell({ row, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const renderCell = (asset, index, field) => {
    const isEditing = editingCell?.row === index && editingCell?.field === field;
    const value = asset[field];

    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type={field === 'ticker' || field === 'sector' ? 'text' : 'number'}
          value={value || ''}
          onChange={(e) => updateAsset(index, field, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, index, field)}
          onBlur={handleCellBlur}
          className="asset-input"
          placeholder={field === 'ticker' ? 'AAPL' : field === 'buy_price' ? '150.00' : field === 'shares' ? '10' : field === 'sector' ? 'Technology' : ''}
        />
      );
    }

    const displayValue = value === null ? '' : value;
    const className = `asset-cell ${field === 'ticker' ? 'asset-cell--ticker' : ''}`;

    return (
      <div
        className={className}
        onClick={() => handleCellClick(index, field)}
        onKeyDown={(e) => handleKeyDown(e, index, field)}
        tabIndex={0}
        role="button"
        aria-label={`Edit ${field} for ${asset.ticker || 'asset'}`}
      >
        {displayValue}
      </div>
    );
  };

  const getRowClass = (index) => {
    let className = 'asset-row';
    if (duplicateIndex === index) {
      className += ' asset-row--duplicated';
    }
    return className;
  };

  return (
    <div className="assets-table">
      <div className="assets-table__header">
        <h2>Assets</h2>
        <button onClick={addAsset} className="btn btn--primary">
          Add Asset
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="assets-table__empty">
          <p>No assets added yet. Click "Add Asset" to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="assets-table__table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Buy Price ($)</th>
                <th>Shares</th>
                <th>Sector</th>
                <th>Take Profit (%)</th>
                <th>Stop Loss (%)</th>
                <th>Fee Override (%)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset, index) => (
                <tr key={index} className={getRowClass(index)}>
                  <td>{renderCell(asset, index, 'ticker')}</td>
                  <td>{renderCell(asset, index, 'buy_price')}</td>
                  <td>{renderCell(asset, index, 'shares')}</td>
                  <td>{renderCell(asset, index, 'sector')}</td>
                  <td>{renderCell(asset, index, 'take_profit_pct')}</td>
                  <td>{renderCell(asset, index, 'stop_loss_pct')}</td>
                  <td>{renderCell(asset, index, 'fee_override')}</td>
                  <td>
                    <div className="asset-actions">
                      <button
                        onClick={() => duplicateAsset(index)}
                        className="btn btn--small btn--secondary"
                        title="Duplicate asset (Ctrl+D)"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => removeAsset(index)}
                        className="btn btn--small btn--danger"
                        title="Remove asset (Delete)"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="assets-table__help">
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Click any cell to edit inline</li>
          <li>Use mathematical expressions in price/shares fields (e.g., "500/36")</li>
          <li>Press Enter to move to next field</li>
          <li>Press Delete to remove an asset</li>
          <li>Use Ctrl/Cmd+D to duplicate a row</li>
        </ul>
      </div>
    </div>
  );
};

export default AssetsTable;
