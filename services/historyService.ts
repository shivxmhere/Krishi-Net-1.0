
import { ScanRecord, DiseaseAnalysis } from '../types';

const HISTORY_KEY = 'krishi_scan_history';

export const saveScan = (crop: string, image: string, analysis: DiseaseAnalysis, location: string): ScanRecord => {
  const newScan: ScanRecord = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    image,
    crop,
    analysis,
    location
  };

  const history = getScanHistory();
  const updatedHistory = [newScan, ...history];
  
  // Limit to 50 items to prevent localStorage overflow
  if (updatedHistory.length > 50) updatedHistory.pop();
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return newScan;
};

export const getScanHistory = (): ScanRecord[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const deleteScan = (id: string) => {
  const history = getScanHistory();
  const updated = history.filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getStats = () => {
  const history = getScanHistory();
  const total = history.length;
  const healthy = history.filter(h => h.analysis.severity.toLowerCase() === 'healthy').length;
  const issues = total - healthy;
  
  return { total, healthy, issues };
};
