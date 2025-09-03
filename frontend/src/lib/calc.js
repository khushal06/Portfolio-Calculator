// Calculation utilities for the frontend

export function invested(assets) {
  return assets.reduce((total, asset) => total + (asset.buy_price * asset.shares), 0);
}

export function cash(capital, investedAmount) {
  return capital - investedAmount;
}

export function safeEval(expr) {
  // Safe evaluation of mathematical expressions
  // Only allows basic arithmetic operations and numbers
  try {
    // Remove any non-numeric, non-operator characters except for basic math
    const cleanExpr = expr.replace(/[^0-9+\-*/().\s]/g, '');
    
    // Use Function constructor for safer evaluation than eval
    const result = new Function('return ' + cleanExpr)();
    
    // Ensure result is a number
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null;
    }
    
    return result;
  } catch (error) {
    return null;
  }
}

export function roundShares(shares, precision = 0) {
  return Math.round(shares * Math.pow(10, precision)) / Math.pow(10, precision);
}

export function formatCurrency(amount, currency = '$') {
  return `${currency}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

export function calculatePortfolioMetrics(assets) {
  const totalValue = invested(assets);
  const totalShares = assets.reduce((sum, asset) => sum + asset.shares, 0);
  const avgPrice = totalShares > 0 ? totalValue / totalShares : 0;
  
  return {
    totalValue,
    totalShares,
    avgPrice,
    assetCount: assets.length
  };
}

export function calculateSectorAllocation(assets) {
  const sectorTotals = {};
  
  assets.forEach(asset => {
    const sector = asset.sector || 'Other';
    const value = asset.buy_price * asset.shares;
    sectorTotals[sector] = (sectorTotals[sector] || 0) + value;
  });
  
  const totalValue = Object.values(sectorTotals).reduce((sum, value) => sum + value, 0);
  
  return Object.entries(sectorTotals).map(([sector, value]) => ({
    sector,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  }));
}

export function validateAsset(asset) {
  const errors = [];
  
  if (!asset.ticker || asset.ticker.trim().length === 0) {
    errors.push('Ticker is required');
  }
  
  if (!asset.buy_price || asset.buy_price <= 0) {
    errors.push('Buy price must be greater than 0');
  }
  
  if (asset.shares < 0) {
    errors.push('Shares cannot be negative');
  }
  
  if (asset.take_profit_pct !== null && (asset.take_profit_pct < 0 || asset.take_profit_pct > 1000)) {
    errors.push('Take profit percentage must be between 0 and 1000');
  }
  
  if (asset.stop_loss_pct !== null && (asset.stop_loss_pct < 0 || asset.stop_loss_pct > 100)) {
    errors.push('Stop loss percentage must be between 0 and 100');
  }
  
  if (asset.fee_override !== null && (asset.fee_override < 0 || asset.fee_override > 100)) {
    errors.push('Fee override must be between 0 and 100');
  }
  
  return errors;
}

export function validatePortfolio(capital, assets, fees) {
  const errors = [];
  
  if (!capital || capital <= 0) {
    errors.push('Capital must be greater than 0');
  }
  
  if (!assets || assets.length === 0) {
    errors.push('At least one asset is required');
  }
  
  const investedAmount = invested(assets);
  if (investedAmount > capital) {
    errors.push('Invested amount cannot exceed capital');
  }
  
  if (fees.percentage < 0 || fees.percentage > 100) {
    errors.push('Fee percentage must be between 0 and 100');
  }
  
  if (fees.flat < 0) {
    errors.push('Flat fee cannot be negative');
  }
  
  return errors;
}
