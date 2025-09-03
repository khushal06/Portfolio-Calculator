import React from 'react';
import { formatCurrency, formatPercentage } from '../lib/calc';

const ScenarioTable = ({ results, fees }) => {
  if (!results || results.length === 0) {
    return (
      <div className="scenario-table">
        <h2>Scenario Results</h2>
        <div className="scenario-table__empty">
          <p>No scenario results available. Add assets and run calculations to see results.</p>
        </div>
      </div>
    );
  }

  const getPLClass = (pl) => {
    if (pl >= 0) return 'pl-positive';
    return 'pl-negative';
  };

  const getPLNetClass = (plNet) => {
    if (plNet >= 0) return 'pl-positive';
    return 'pl-negative';
  };

  return (
    <div className="scenario-table">
      <h2>Scenario Results</h2>
      
      <div className="table-container">
        <table className="scenario-table__table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Total Value</th>
              <th>P/L (Gross)</th>
              <th>P/L (Net)</th>
              <th>Return %</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => {
              const returnPct = result.total_value > 0 ? 
                ((result.total_value - (result.total_value - result.pl)) / (result.total_value - result.pl)) * 100 : 0;
              
              return (
                <tr key={index}>
                  <td className="scenario-cell">
                    <span className={`scenario-badge ${result.scenario_pct >= 0 ? 'scenario-badge--positive' : 'scenario-badge--negative'}`}>
                      {formatPercentage(result.scenario_pct)}
                    </span>
                  </td>
                  <td className="value-cell">
                    {formatCurrency(result.total_value)}
                  </td>
                  <td className={`pl-cell ${getPLClass(result.pl)}`}>
                    {formatCurrency(result.pl)}
                  </td>
                  <td className={`pl-cell ${getPLNetClass(result.pl_net)}`}>
                    {formatCurrency(result.pl_net)}
                  </td>
                  <td className={`return-cell ${getPLClass(returnPct)}`}>
                    {formatPercentage(returnPct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="scenario-table__summary">
        <div className="summary-item">
          <span className="summary-label">Best Case:</span>
          <span className="summary-value">
            {formatCurrency(Math.max(...results.map(r => r.pl_net)))}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Worst Case:</span>
          <span className="summary-value">
            {formatCurrency(Math.min(...results.map(r => r.pl_net)))}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Range:</span>
          <span className="summary-value">
            {formatCurrency(Math.max(...results.map(r => r.pl_net)) - Math.min(...results.map(r => r.pl_net)))}
          </span>
        </div>
      </div>

      {fees.percentage > 0 || fees.flat > 0 ? (
        <div className="scenario-table__fees">
          <p><strong>Note:</strong> Net P/L includes fees: 
            {fees.percentage > 0 && ` ${fees.percentage}%`}
            {fees.percentage > 0 && fees.flat > 0 && ' + '}
            {fees.flat > 0 && formatCurrency(fees.flat)}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ScenarioTable;
