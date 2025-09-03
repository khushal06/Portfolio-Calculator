import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { calculateSectorAllocation, formatCurrency, formatPercentage } from '../lib/calc';

const ChartsPanel = ({ assets, scenarios, calculationResult }) => {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [sectorData, setSectorData] = useState([]);
  const [scenarioData, setScenarioData] = useState([]);
  const [assetValueData, setAssetValueData] = useState([]);

  // Calculate sector allocation
  useEffect(() => {
    if (assets.length > 0) {
      const allocation = calculateSectorAllocation(assets);
      setSectorData(allocation);
    }
  }, [assets]);

  // Prepare scenario data for line chart
  useEffect(() => {
    if (calculationResult && calculationResult.results) {
      const data = calculationResult.results.map(result => ({
        scenario: result.scenario_pct,
        pl: result.pl_net,
        totalValue: result.total_value,
        returnPct: result.total_value > 0 ? 
          ((result.total_value - (result.total_value - result.pl)) / (result.total_value - result.pl)) * 100 : 0
      }));
      setScenarioData(data);
    }
  }, [calculationResult]);

  // Prepare asset value data for selected scenario
  useEffect(() => {
    if (assets.length > 0 && calculationResult && calculationResult.results && calculationResult.results[selectedScenario]) {
      const scenario = calculationResult.results[selectedScenario];
      const data = assets.map(asset => ({
        ticker: asset.ticker,
        value: asset.shares * asset.buy_price * (1 + scenario.scenario_pct / 100),
        sector: asset.sector || 'Other'
      }));
      setAssetValueData(data);
    }
  }, [assets, selectedScenario, calculationResult]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip__label">{`${label}%`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="chart-tooltip__value" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const SectorTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip__label">{data.sector}</p>
          <p className="chart-tooltip__value">
            {`Value: ${formatCurrency(data.value)}`}
          </p>
          <p className="chart-tooltip__value">
            {`Percentage: ${formatPercentage(data.percentage)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (assets.length === 0) {
    return (
      <div className="charts-panel">
        <h2>Charts & Analysis</h2>
        <div className="charts-panel__empty">
          <p>Add assets to see portfolio charts and analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-panel">
      <h2>Charts & Analysis</h2>
      
      <div className="charts-grid">
        {/* Sector Allocation Donut Chart */}
        {sectorData.length > 0 && (
          <div className="chart-container">
            <h3>Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<SectorTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* P/L vs Scenario Line Chart */}
        {scenarioData.length > 0 && (
          <div className="chart-container">
            <h3>P/L vs Market Scenario</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scenarioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="scenario" 
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pl" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="P/L (Net)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Asset Values Bar Chart */}
        {assetValueData.length > 0 && (
          <div className="chart-container">
            <h3>Asset Values by Scenario</h3>
            <div className="scenario-selector">
              <label htmlFor="scenario-select">Select Scenario:</label>
              <select
                id="scenario-select"
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(parseInt(e.target.value))}
              >
                {calculationResult?.results?.map((result, index) => (
                  <option key={index} value={index}>
                    {formatPercentage(result.scenario_pct)}
                  </option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ticker" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Value']}
                  labelFormatter={(label) => `Ticker: ${label}`}
                />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Portfolio Metrics */}
      <div className="charts-panel__metrics">
        <h3>Portfolio Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Total Assets:</span>
            <span className="metric-value">{assets.length}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Sectors:</span>
            <span className="metric-value">
              {new Set(assets.map(a => a.sector || 'Other')).size}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total Shares:</span>
            <span className="metric-value">
              {assets.reduce((sum, asset) => sum + asset.shares, 0).toFixed(2)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Average Price:</span>
            <span className="metric-value">
              {formatCurrency(
                assets.reduce((sum, asset) => sum + asset.buy_price, 0) / assets.length
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;
