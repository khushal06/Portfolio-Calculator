import React from 'react';
import { invested, cash, formatCurrency } from '../lib/calc';

const TotalsBar = ({ capital, assets, fees, calculationResult }) => {
  const investedAmount = invested(assets);
  const cashAmount = cash(capital, investedAmount);
  const entryValue = investedAmount + cashAmount;

  return (
    <div className="totals-bar">
      <div className="totals-bar__content">
        <div className="totals-item">
          <span className="totals-item__label">Invested:</span>
          <span className="totals-item__value">{formatCurrency(investedAmount)}</span>
        </div>
        
        <div className="totals-item">
          <span className="totals-item__label">Cash:</span>
          <span className="totals-item__value">{formatCurrency(cashAmount)}</span>
        </div>
        
        <div className="totals-item">
          <span className="totals-item__label">Entry Value:</span>
          <span className="totals-item__value">{formatCurrency(entryValue)}</span>
        </div>
        
        <div className="totals-item">
          <span className="totals-item__label">Capital:</span>
          <span className="totals-item__value">{formatCurrency(capital)}</span>
        </div>

        {calculationResult && (
          <>
            {calculationResult.targets_total && (
              <div className="totals-item">
                <span className="totals-item__label">Targets Total:</span>
                <span className="totals-item__value">{formatCurrency(calculationResult.targets_total)}</span>
              </div>
            )}
            
            {calculationResult.blended_total && (
              <div className="totals-item">
                <span className="totals-item__label">Blended Total:</span>
                <span className="totals-item__value">{formatCurrency(calculationResult.blended_total)}</span>
              </div>
            )}
          </>
        )}

        <div className="totals-item">
          <span className="totals-item__label">Fees:</span>
          <span className="totals-item__value">
            {fees.percentage > 0 && `${fees.percentage}%`}
            {fees.percentage > 0 && fees.flat > 0 && ' + '}
            {fees.flat > 0 && formatCurrency(fees.flat)}
            {fees.percentage === 0 && fees.flat === 0 && 'None'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TotalsBar;
