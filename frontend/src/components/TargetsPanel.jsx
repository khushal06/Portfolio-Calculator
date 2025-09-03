import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatPercentage } from '../lib/calc';

const TargetsPanel = ({ assets, capital, fees, onToast }) => {
  const [targetPrices, setTargetPrices] = useState({});
  const [targetsResult, setTargetsResult] = useState(null);
  const [blendedResult, setBlendedResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize target prices when assets change
  useEffect(() => {
    const newTargetPrices = {};
    assets.forEach(asset => {
      if (!targetPrices[asset.ticker]) {
        if (asset.take_profit_pct) {
          newTargetPrices[asset.ticker] = asset.buy_price * (1 + asset.take_profit_pct / 100);
        } else if (asset.stop_loss_pct) {
          newTargetPrices[asset.ticker] = asset.buy_price * (1 - asset.stop_loss_pct / 100);
        } else {
          newTargetPrices[asset.ticker] = asset.buy_price;
        }
      } else {
        newTargetPrices[asset.ticker] = targetPrices[asset.ticker];
      }
    });
    setTargetPrices(newTargetPrices);
  }, [assets]);

  const updateTargetPrice = (ticker, price) => {
    setTargetPrices(prev => ({
      ...prev,
      [ticker]: parseFloat(price) || 0
    }));
  };

  const calculateTargets = async () => {
    if (assets.length === 0) {
      onToast('No assets to calculate targets for', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Create assets with target prices
      const assetsWithTargets = assets.map(asset => ({
        ...asset,
        take_profit_pct: targetPrices[asset.ticker] ? 
          ((targetPrices[asset.ticker] - asset.buy_price) / asset.buy_price) * 100 : null,
        stop_loss_pct: null
      }));

      const request = {
        capital,
        assets: assetsWithTargets,
        fees
      };

      const result = await api.calculateTargets(request);
      setTargetsResult(result);
      onToast('Targets calculated successfully', 'success');
    } catch (error) {
      onToast(`Failed to calculate targets: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateBlended = async () => {
    if (assets.length === 0) {
      onToast('No assets to calculate blended for', 'warning');
      return;
    }

    setLoading(true);
    try {
      const request = {
        capital,
        assets,
        fees
      };

      const result = await api.calculateBlended(request);
      setBlendedResult(result);
      onToast('Blended calculation completed', 'success');
    } catch (error) {
      onToast(`Failed to calculate blended: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPLClass = (pl) => {
    if (pl >= 0) return 'pl-positive';
    return 'pl-negative';
  };

  return (
    <div className="targets-panel">
      <h2>Target Prices & Analysis</h2>
      
      <div className="targets-panel__section">
        <h3>Set Target Prices</h3>
        <div className="targets-list">
          {assets.map(asset => (
            <div key={asset.ticker} className="target-item">
              <div className="target-item__info">
                <span className="target-ticker">{asset.ticker}</span>
                <span className="target-current">
                  Current: {formatCurrency(asset.buy_price)}
                </span>
                {asset.take_profit_pct && (
                  <span className="target-tp">
                    TP: {formatPercentage(asset.take_profit_pct)}
                  </span>
                )}
                {asset.stop_loss_pct && (
                  <span className="target-sl">
                    SL: {formatPercentage(asset.stop_loss_pct)}
                  </span>
                )}
              </div>
              <div className="target-item__input">
                <label htmlFor={`target-${asset.ticker}`}>Target Price:</label>
                <input
                  id={`target-${asset.ticker}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrices[asset.ticker] || ''}
                  onChange={(e) => updateTargetPrice(asset.ticker, e.target.value)}
                  placeholder={formatCurrency(asset.buy_price)}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="targets-actions">
          <button 
            onClick={calculateTargets} 
            className="btn btn--primary"
            disabled={loading || assets.length === 0}
          >
            {loading ? 'Calculating...' : 'Calculate Targets'}
          </button>
          <button 
            onClick={calculateBlended} 
            className="btn btn--secondary"
            disabled={loading || assets.length === 0}
          >
            {loading ? 'Calculating...' : 'Calculate Blended'}
          </button>
        </div>
      </div>

      {targetsResult && (
        <div className="targets-panel__section">
          <h3>Targets Results</h3>
          <div className="targets-results">
            <div className="result-item">
              <span className="result-label">Targets Total:</span>
              <span className="result-value">{formatCurrency(targetsResult.targets_total)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">P/L (Gross):</span>
              <span className={`result-value ${getPLClass(targetsResult.targets_pl)}`}>
                {formatCurrency(targetsResult.targets_pl)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">P/L (Net):</span>
              <span className={`result-value ${getPLClass(targetsResult.targets_pl_net)}`}>
                {formatCurrency(targetsResult.targets_pl_net)}
              </span>
            </div>
          </div>
        </div>
      )}

      {blendedResult && (
        <div className="targets-panel__section">
          <h3>Blended Results</h3>
          <div className="blended-results">
            <div className="result-item">
              <span className="result-label">Blended Total:</span>
              <span className="result-value">{formatCurrency(blendedResult.blended_total)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">P/L (Gross):</span>
              <span className={`result-value ${getPLClass(blendedResult.blended_pl)}`}>
                {formatCurrency(blendedResult.blended_pl)}
              </span>
            </div>
            <div className="result-item">
              <span className="result-label">P/L (Net):</span>
              <span className={`result-value ${getPLClass(blendedResult.blended_pl_net)}`}>
                {formatCurrency(blendedResult.blended_pl_net)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="targets-panel__help">
        <p><strong>Target Prices:</strong> Set specific target prices for each asset to see potential outcomes.</p>
        <p><strong>Blended:</strong> Uses take profit/stop loss percentages if set, otherwise uses buy price.</p>
      </div>
    </div>
  );
};

export default TargetsPanel;
