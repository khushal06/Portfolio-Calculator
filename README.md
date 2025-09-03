# Portfolio Calculator

A comprehensive portfolio analysis and rebalancing tool built with React (Vite) frontend and Python FastAPI backend.

## Features

- **Portfolio Management**: Add, edit, and manage assets with real-time calculations
- **Scenario Analysis**: Test portfolio performance across different market scenarios
- **Target Analysis**: Set target prices and analyze potential outcomes
- **Rebalancing**: Calculate optimal buy/sell orders to achieve target allocations
- **Data Visualization**: Interactive charts showing sector allocation, P/L trends, and asset values
- **Data Persistence**: LocalStorage for saving portfolio data
- **Import/Export**: JSON and CSV support for data portability
- **Responsive Design**: Modern dark theme with mobile-friendly interface

## Tech Stack

### Frontend
- React 18 with Vite
- Plain CSS (no frameworks) with modern dark theme
- Recharts for data visualization
- LocalStorage for persistence

### Backend
- Python FastAPI with Uvicorn
- Pydantic for data validation
- pandas + numpy for calculations
- No database (client-side state management)


1. **Set Portfolio Capital**: Enter your total available capital
2. **Add Assets**: Add stocks, ETFs, or other assets with buy prices and shares
3. **Configure Scenarios**: Set market scenarios to test (e.g., -30% to +50%)
4. **Run Calculations**: The app automatically calculates scenario results
5. **Set Targets**: Define target prices for potential outcomes
6. **Rebalance**: Set target weights and calculate rebalancing orders
7. **Visualize**: View charts showing sector allocation and performance

## Keyboard Shortcuts

- **Enter**: Add new asset or move to next field
- **Ctrl/Cmd + D**: Duplicate selected asset
- **Delete**: Remove selected asset (with confirmation)

## Data Management

- **Auto-save**: All data is automatically saved to localStorage
- **Export JSON**: Download portfolio data as JSON
- **Import JSON**: Load portfolio data from JSON file
- **CSV Template**: Download CSV template for bulk asset import
- **Export CSV**: Export current assets to CSV
- **Import CSV**: Import assets from CSV file

### Portfolio Calculations
- **Invested Amount**: Sum of (buy_price × shares) for all assets
- **Cash**: Capital - Invested amount
- **Scenario Value**: Shares × buy_price × (1 + scenario_pct/100)
- **P/L**: Scenario value - (invested + cash)
- **Net P/L**: P/L - (P/L × fee%) - flat fee

### Rebalancing Logic
- Calculates target values based on target weights
- Determines buy/sell orders needed
- Respects available cash constraints
- Converts to integer shares
- Prevents negative positions

### Data Validation
- Ticker symbols are automatically uppercased
- Buy prices must be positive
- Shares cannot be negative
- Take profit percentages: 0-1000%
- Stop loss percentages: 0-100%
- Target weights must sum to 100%
