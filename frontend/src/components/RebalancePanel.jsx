import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency, formatPercentage } from '../lib/calc';

const RebalancePanel = ({ assets, capital, fees, onToast }) => {
  const [targetWeights, setTargetWeights] = useState({});
  const [rebalanceResult, setRebalanceResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize target weights when assets change
  useEffect(() => {
    if (assets.length > 0) {
      const newWeights = {};
      const equalWeight = 100 / assets.length;
      
      assets.forEach(asset => {
        if (!targetWeights[asset.ticker]) {
          newWeights[asset.ticker] = equalWeight;
        } else {
          newWeights[asset.ticker] = targetWeights[asset.ticker];
        }
      });
      
      setTargetWeights(newWeights);
    }
  }, [assets]);

  const updateTargetWeight = (ticker, weight) => {
    setTargetWeights(prev => ({
      ...prev,
      [ticker]: parseFloat(weight) || 0
    }));
  };

  const calculateRebalance = async () => {
    if (assets.length === 0) {
      onToast('No assets to rebalance', 'warning');
      return;
    }

    // Validate weights sum to 100%
    const totalWeight = Object.values(targetWeights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      onToast('Target weights must sum to 100%', 'error');
      return;
    }

    setLoading(true);
    try {
      const request = {
        capital,
        assets,
        target_weights: targetWeights,
        fees
      };

      const result = await api.calculateRebalance(request);
      setRebalanceResult(result);
      onToast('Rebalance calculation completed', 'success');
    } catch (error) {
      onToast(`Failed to calculate rebalance: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const normalizeWeights = () => {
    const totalWeight = Object.values(targetWeights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return;

    const normalized = {};
    Object.keys(targetWeights).forEach(ticker => {
      normalized[ticker] = (targetWeights[ticker] / totalWeight) * 100;
    });
    
    setTargetWeights(normalized);
    onToast('Weights normalized to 100%', 'info');
  };

  const setEqualWeights = () => {
    if (assets.length === 0) return;
    
    const equalWeight = 100 / assets.length;
    const newWeights = {};
    assets.forEach(asset => {
      newWeights[asset.ticker] = equalWeight;
    });
    
    setTargetWeights(newWeights);
    onToast('Set equal weights for all assets', 'info');
  };

  const getTotalWeight = () => {
    return Object.values(targetWeights).reduce((sum, weight) => sum + weight, 0);
  };

  const getWeightClass = () => {
    const total = getTotalWeight();
    if (Math.abs(total - 100) < 0.01) return 'weight-valid';
    if (total > 100) return 'weight-over';
    return 'weight-under';
  };

  return (
    <div className="rebalance-panel">
      <h2>Portfolio Rebalancing</h2>
      
      <div className="rebalance-panel__section">
        <h3>Target Weights</h3>
        
        <div className="weights-header">
          <div className="weights-total">
            <span className="weights-label">Total Weight:</span>
            <span className={`weights-value ${getWeightClass()}`}>
              {formatPercentage(getTotalWeight())}
            </span>
          </div>
          <div className="weights-actions">
            <button onClick={normalizeWeights} className="btn btn--small btn--secondary">
              Normalize
            </button>
            <button onClick={setEqualWeights} className="btn btn--small btn--secondary">
              Equal Weights
            </button>
          </div>
        </div>

        <div className="weights-list">
          {assets.map(asset => {
            const currentValue = asset.buy_price * asset.shares;
            const currentWeight = capital > 0 ? (currentValue / capital) * 100 : 0;
            const targetWeight = targetWeights[asset.ticker] || 0;
            const weightDiff = targetWeight - currentWeight;
            
            return (
              <div key={asset.ticker} className="weight-item">
                <div className="weight-item__info">
                  <span className="weight-ticker">{asset.ticker}</span>
                  <span className="weight-current">
                    Current: {formatPercentage(currentWeight)}
                  </span>
                </div>
                <div className="weight-item__input">
                  <label htmlFor={`weight-${asset.ticker}`}>Target Weight (%):</label>
                  <input
                    id={`weight-${asset.ticker}`}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={targetWeight}
                    onChange={(e) => updateTargetWeight(asset.ticker, e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="weight-item__diff">
                  <span className={`weight-diff ${weightDiff >= 0 ? 'weight-diff--positive' : 'weight-diff--negative'}`}>
                    {weightDiff >= 0 ? '+' : ''}{formatPercentage(weightDiff)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="rebalance-actions">
          <button 
            onClick={calculateRebalance} 
            className="btn btn--primary"
            disabled={loading || assets.length === 0}
          >
            {loading ? 'Calculating...' : 'Calculate Rebalance'}
          </button>
        </div>
      </div>

      {rebalanceResult && rebalanceResult.orders && (
        <div className="rebalance-panel__section">
          <h3>Rebalance Orders</h3>
          
          {rebalanceResult.orders.length === 0 ? (
            <div className="rebalance-results__empty">
              <p>No rebalancing needed. Portfolio is already at target weights.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="rebalance-orders__table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Action</th>
                    <th>Quantity</th>
                    <th>Cost</th>
                    <th>New Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {rebalanceResult.orders.map((order, index) => (
                    <tr key={index}>
                      <td className="order-ticker">{order.ticker}</td>
                      <td>
                        <span className={`order-side order-side--${order.side}`}>
                          {order.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="order-qty">{order.qty}</td>
                      <td className="order-cost">{formatCurrency(order.cost)}</td>
                      <td className="order-shares">{order.new_shares.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="rebalance-summary">
            <div className="summary-item">
              <span className="summary-label">Total Buy Orders:</span>
              <span className="summary-value">
                {formatCurrency(
                  rebalanceResult.orders
                    .filter(order => order.side === 'buy')
                    .reduce((sum, order) => sum + order.cost, 0)
                )}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Sell Orders:</span>
              <span className="summary-value">
                {formatCurrency(
                  rebalanceResult.orders
                    .filter(order => order.side === 'sell')
                    .reduce((sum, order) => sum + order.cost, 0)
                )}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Net Cash Flow:</span>
              <span className="summary-value">
                {formatCurrency(
                  rebalanceResult.orders
                    .filter(order => order.side === 'sell')
                    .reduce((sum, order) => sum + order.cost, 0) -
                  rebalanceResult.orders
                    .filter(order => order.side === 'buy')
                    .reduce((sum, order) => sum + order.cost, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="rebalance-panel__help">
        <p><strong>Target Weights:</strong> Set the desired percentage allocation for each asset.</p>
        <p><strong>Rebalancing:</strong> Calculates the exact buy/sell orders needed to achieve target weights.</p>
        <p><strong>Note:</strong> Orders are calculated in whole shares and respect available cash.</p>
      </div>
    </div>
  );
};

export default RebalancePanel;
