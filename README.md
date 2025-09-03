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

## Project Structure

```
portfolio-calculator/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── models.py           # Pydantic models
│   ├── services.py         # Calculation logic
│   ├── utils.py            # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── tests/
│       └── test_math.py    # Unit tests
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles.css
        ├── components/     # React components
        └── lib/           # Utility libraries
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn app:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### POST /calc/scenario
Calculate portfolio values for different market scenarios.

**Input:**
```json
{
  "capital": 10000,
  "assets": [
    {
      "ticker": "AAPL",
      "buy_price": 150.0,
      "shares": 10,
      "sector": "Technology"
    }
  ],
  "scenarios": [-30, -20, -10, 0, 10, 20, 30, 50],
  "fees": {
    "percentage": 1.0,
    "flat": 10.0
  }
}
```

### POST /calc/targets
Calculate portfolio value using target prices.

### POST /calc/blended
Calculate blended portfolio value using TP/SL if present.

### POST /calc/rebalance
Calculate rebalancing orders to achieve target weights.

## Usage

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

## Testing

Run backend tests:
```bash
cd backend
python -m pytest tests/
```

## Features in Detail

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

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the GitHub repository.
# Portfolio-Calculator
