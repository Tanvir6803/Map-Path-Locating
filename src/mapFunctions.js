// Session storage helpers
export const saveToStorage = (key, data) => {
  sessionStorage.setItem(key, JSON.stringify(Array.from(data)));
};

export const loadFromStorage = (key) => {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Add point function - given coordinates, add point to map
export const addPoint = (points, setPoints, lat, lng) => {
  const pointId = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const newPoints = new Set([...points, pointId]);
  setPoints(newPoints);
  saveToStorage('mapPoints', newPoints);
  return pointId;
};

// Remove point function - remove point from map and connected lines
export const removePoint = (points, setPoints, lines, setLines, pointId) => {
  const newPoints = new Set(points);
  newPoints.delete(pointId);
  setPoints(newPoints);
  
  // Remove lines connected to this point
  const newLines = new Set();
  lines.forEach(line => {
    const [start, end] = line.split('|');
    if (start !== pointId && end !== pointId) {
      newLines.add(line);
    }
  });
  setLines(newLines);
  
  saveToStorage('mapPoints', newPoints);
  saveToStorage('mapLines', newLines);
};

// Add line function - given start and end coordinates, draw line
export const addLine = (lines, setLines, startPointId, endPointId) => {
  const lineId = `${startPointId}|${endPointId}`;
  const reverseLineId = `${endPointId}|${startPointId}`;
  
  // Don't add if line already exists
  if (!lines.has(lineId) && !lines.has(reverseLineId)) {
    const newLines = new Set([...lines, lineId]);
    setLines(newLines);
    saveToStorage('mapLines', newLines);
    return lineId;
  }
  return null;
};

// Remove line function
export const removeLine = (lines, setLines, lineId) => {
  const newLines = new Set(lines);
  newLines.delete(lineId);
  setLines(newLines);
  saveToStorage('mapLines', newLines);
};

// Add point from text input (lat, lng as string)
export const addPointFromText = (points, setPoints, latText, lngText) => {
  const lat = parseFloat(latText);
  const lng = parseFloat(lngText);
  
  if (isNaN(lat) || isNaN(lng)) {
    return { success: false, error: 'Invalid coordinates' };
  }
  
  if (lat < -90 || lat > 90) {
    return { success: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { success: false, error: 'Longitude must be between -180 and 180' };
  }
  
  const pointId = addPoint(points, setPoints, lat, lng);
  return { success: true, pointId };
};

// Restore saved point to map
export const restorePoint = (points, setPoints, pointId) => {
  const newPoints = new Set([...points, pointId]);
  setPoints(newPoints);
  saveToStorage('mapPoints', newPoints);
};

// Restore saved line to map
export const restoreLine = (lines, setLines, lineId) => {
  const newLines = new Set([...lines, lineId]);
  setLines(newLines);
  saveToStorage('mapLines', newLines);
};

// Utility functions
export const parseCoords = (pointId) => {
  const [lat, lng] = pointId.split(',').map(Number);
  return [lat, lng];
};

export const clearAll = (setPoints, setLines) => {
  setPoints(new Set());
  setLines(new Set());
  sessionStorage.removeItem('mapPoints');
  sessionStorage.removeItem('mapLines');
  sessionStorage.removeItem('savedPoints');
  sessionStorage.removeItem('savedLines');
};