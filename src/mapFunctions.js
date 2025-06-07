import axios from 'axios';

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

// Add point
export const addPoint = (points, setPoints, lat, lng) => {
  const pointId = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  const newPoints = new Set([...points, pointId]);
  setPoints(newPoints);
  saveToStorage('mapPoints', newPoints);

  axios.post('http://localhost:3001/add-point', {
    pointId,
    lat,
    lng
  }).catch(err => console.error('Failed to save point to backend:', err));

  return pointId;
};

// Add line
export const addLine = (lines, setLines, startPointId, endPointId) => {
  const lineId = `${startPointId}|${endPointId}`;
  const reverseLineId = `${endPointId}|${startPointId}`;

  if (!lines.has(lineId) && !lines.has(reverseLineId)) {
    const newLines = new Set([...lines, lineId]);
    setLines(newLines);
    saveToStorage('mapLines', newLines);

    axios.post('http://localhost:3001/add-line', {
      lineId,
      start: startPointId,
      end: endPointId
    }).catch(err => console.error('Failed to save line to backend:', err));

    return lineId;
  }
  return null;
};

// Remove point (frontend + backend)
export const removePoint = async (points, setPoints, lines, setLines, pointId) => {
  const newPoints = new Set(points);
  newPoints.delete(pointId);
  setPoints(newPoints);

  const newLines = new Set();
  lines.forEach(line => {
    const [start, end] = line.split('|');
    if (start !== pointId && end !== pointId) {
      newLines.add(line);
    } else {
      axios.post('http://localhost:3001/remove-line', { lineId: line })
        .catch(err => console.error('Failed to mark line as removed:', err));
    }
  });
  setLines(newLines);

  axios.post('http://localhost:3001/remove-point', { pointId })
    .catch(err => console.error('Failed to mark point as removed:', err));

  saveToStorage('mapPoints', newPoints);
  saveToStorage('mapLines', newLines);
};

// Remove line (frontend + backend)
export const removeLine = async (lines, setLines, lineId) => {
  const newLines = new Set(lines);
  newLines.delete(lineId);
  setLines(newLines);

  axios.post('http://localhost:3001/remove-line', { lineId })
    .catch(err => console.error('Failed to mark line as removed:', err));

  saveToStorage('mapLines', newLines);
};

// Add point by text
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

export const restorePoint = (points, setPoints, pointId) => {
  const newPoints = new Set([...points, pointId]);
  setPoints(newPoints);
  saveToStorage('mapPoints', newPoints);
};

export const restoreLine = (lines, setLines, lineId) => {
  const newLines = new Set([...lines, lineId]);
  setLines(newLines);
  saveToStorage('mapLines', newLines);
};

export const parseCoords = (pointId) => {
  const [lat, lng] = pointId.split(',').map(Number);
  return [lat, lng];
};

export const clearAll = async (points, setPoints, lines, setLines) => {
  const pointArray = [...points];
  const lineArray = [...lines];

  // Mark all lines as removed in the backend
  await Promise.all(lineArray.map(lineId =>
    axios.post('http://localhost:3001/remove-line', { lineId })
      .catch(err => console.error('❌ Failed to mark line as removed:', err))
  ));

  // Mark all points as removed in the backend
  await Promise.all(pointArray.map(pointId =>
    axios.post('http://localhost:3001/remove-point', { pointId })
      .catch(err => console.error('❌ Failed to mark point as removed:', err))
  ));

  // Clear frontend + sessionStorage
  const newPoints = new Set();
  const newLines = new Set();
  setPoints(newPoints);
  setLines(newLines);
  saveToStorage('mapPoints', newPoints);
  saveToStorage('mapLines', newLines);
  sessionStorage.removeItem('savedPoints');
  sessionStorage.removeItem('savedLines');
};
