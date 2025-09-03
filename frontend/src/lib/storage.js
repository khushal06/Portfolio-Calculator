// LocalStorage utilities for persistence

const STORAGE_KEY = 'portfolio_calculator_v1';

export function saveToStorage(data) {
  try {
    const serialized = JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
}

export function loadFromStorage() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }
    
    const data = JSON.parse(serialized);
    
    // Validate the loaded data structure
    if (!data || typeof data !== 'object') {
      return null;
    }
    
    // Ensure required fields exist with defaults
    return {
      capital: data.capital || 10000,
      fees: data.fees || { percentage: 0.0, flat: 0.0 },
      assets: data.assets || [],
      scenarios: data.scenarios || [-30, -20, -10, 0, 10, 20, 30, 50],
      scenarioPresets: data.scenarioPresets || {
        'Conservative': [-20, -10, 0, 10, 20],
        'Moderate': [-30, -15, 0, 15, 30],
        'Aggressive': [-50, -25, 0, 25, 50],
        'Custom': [-30, -20, -10, 0, 10, 20, 30, 50]
      },
      targetWeights: data.targetWeights || {},
      highContrast: data.highContrast || false,
      lastSaved: data.lastSaved || null
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

export function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
}

export function exportToJSON(data) {
  try {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to export JSON:', error);
    return false;
  }
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Validate imported data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid JSON format');
        }
        
        // Extract and validate the data
        const importedData = {
          capital: data.capital || 10000,
          fees: data.fees || { percentage: 0.0, flat: 0.0 },
          assets: data.assets || [],
          scenarios: data.scenarios || [-30, -20, -10, 0, 10, 20, 30, 50],
          scenarioPresets: data.scenarioPresets || {
            'Conservative': [-20, -10, 0, 10, 20],
            'Moderate': [-30, -15, 0, 15, 30],
            'Aggressive': [-50, -25, 0, 25, 50],
            'Custom': [-30, -20, -10, 0, 10, 20, 30, 50]
          },
          targetWeights: data.targetWeights || {},
          highContrast: data.highContrast || false,
          lastSaved: new Date().toISOString()
        };
        
        resolve(importedData);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
