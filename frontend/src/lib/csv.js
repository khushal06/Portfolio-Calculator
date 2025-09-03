// CSV utilities for import/export

export function generateCSVTemplate() {
  const headers = ['ticker', 'buy_price', 'shares', 'sector'];
  const sampleData = [
    ['AAPL', '150.00', '10', 'Technology'],
    ['GOOGL', '2800.00', '2', 'Technology'],
    ['TSLA', '200.00', '5', 'Automotive']
  ];
  
  const csvContent = [headers, ...sampleData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'portfolio-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const requiredHeaders = ['ticker', 'buy_price', 'shares'];
  
  // Check for required headers
  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`Missing required header: ${required}`);
    }
  }
  
  const assets = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
    }
    
    const asset = {};
    headers.forEach((header, index) => {
      asset[header] = values[index];
    });
    
    // Validate and convert required fields
    if (!asset.ticker || asset.ticker.trim().length === 0) {
      throw new Error(`Row ${i + 1}: Ticker is required`);
    }
    
    const buyPrice = parseFloat(asset.buy_price);
    if (isNaN(buyPrice) || buyPrice <= 0) {
      throw new Error(`Row ${i + 1}: Invalid buy_price`);
    }
    
    const shares = parseFloat(asset.shares);
    if (isNaN(shares) || shares < 0) {
      throw new Error(`Row ${i + 1}: Invalid shares`);
    }
    
    assets.push({
      ticker: asset.ticker.trim().toUpperCase(),
      buy_price: buyPrice,
      shares: shares,
      sector: asset.sector ? asset.sector.trim() : '',
      take_profit_pct: null,
      stop_loss_pct: null,
      fee_override: null
    });
  }
  
  return assets;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

export function exportToCSV(assets) {
  const headers = ['ticker', 'buy_price', 'shares', 'sector'];
  const csvContent = [headers, ...assets.map(asset => [
    asset.ticker,
    asset.buy_price.toString(),
    asset.shares.toString(),
    asset.sector || ''
  ])]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importCSVFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const assets = parseCSV(event.target.result);
        resolve(assets);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };
    
    reader.readAsText(file);
  });
}
