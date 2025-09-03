// Type definitions for the portfolio calculator

export const Asset = {
  ticker: '',
  buy_price: 0,
  shares: 0,
  sector: '',
  take_profit_pct: null,
  stop_loss_pct: null,
  fee_override: null
};

export const Fees = {
  percentage: 0.0,
  flat: 0.0
};

export const AppState = {
  capital: 10000,
  fees: Fees,
  assets: [],
  scenarios: [-30, -20, -10, 0, 10, 20, 30, 50],
  scenarioPresets: {
    'Conservative': [-20, -10, 0, 10, 20],
    'Moderate': [-30, -15, 0, 15, 30],
    'Aggressive': [-50, -25, 0, 25, 50],
    'Custom': [-30, -20, -10, 0, 10, 20, 30, 50]
  },
  targetWeights: {},
  highContrast: false,
  lastSaved: null
};

export const CalculationResult = {
  invested: 0,
  cash: 0,
  total_capital: 0,
  results: [],
  targets_total: null,
  targets_pl: null,
  targets_pl_net: null,
  blended_total: null,
  blended_pl: null,
  blended_pl_net: null,
  orders: []
};

export const Order = {
  ticker: '',
  side: '', // 'buy' or 'sell'
  qty: 0,
  cost: 0,
  new_shares: 0
};

export const Toast = {
  id: '',
  message: '',
  type: 'info', // 'info', 'success', 'error', 'warning'
  duration: 3000
};
