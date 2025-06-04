import { useState } from 'react';
import { parseCoords, removePoint, removeLine, restorePoint, restoreLine } from './mapFunctions';

function Sidebar({ 
  mode, 
  setMode, 
  points, 
  setPoints, 
  lines, 
  setLines, 
  onClearAll,
  addPointFromText
}) {
  const [savedPoints, setSavedPoints] = useState(() => {
    try {
      const stored = sessionStorage.getItem('savedPoints');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [savedLines, setSavedLines] = useState(() => {
    try {
      const stored = sessionStorage.getItem('savedLines');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [inputError, setInputError] = useState('');

  const savePoint = (pointId) => {
    const newSaved = new Set([...savedPoints, pointId]);
    setSavedPoints(newSaved);
    sessionStorage.setItem('savedPoints', JSON.stringify(Array.from(newSaved)));
  };

  const deleteSavedPoint = (pointId) => {
    const newSaved = new Set(savedPoints);
    newSaved.delete(pointId);
    setSavedPoints(newSaved);
    sessionStorage.setItem('savedPoints', JSON.stringify(Array.from(newSaved)));
  };

  const saveLine = (lineId) => {
    const newSaved = new Set([...savedLines, lineId]);
    setSavedLines(newSaved);
    sessionStorage.setItem('savedLines', JSON.stringify(Array.from(newSaved)));
  };

  const deleteSavedLine = (lineId) => {
    const newSaved = new Set(savedLines);
    newSaved.delete(lineId);
    setSavedLines(newSaved);
    sessionStorage.setItem('savedLines', JSON.stringify(Array.from(newSaved)));
  };

  const handleAddPointFromText = () => {
    const result = addPointFromText(points, setPoints, latInput, lngInput);
    if (result.success) {
      setLatInput('');
      setLngInput('');
      setInputError('');
    } else {
      setInputError(result.error);
    }
  };

  const restoreSavedPoint = (pointId) => {
    restorePoint(points, setPoints, pointId);
  };

  const restoreSavedLine = (lineId) => {
    restoreLine(lines, setLines, lineId);
  };

  return (
    <div style={{ 
      width: '350px', 
      height: '100vh', 
      background: '#f8f9fa', 
      padding: '20px',
      borderLeft: '1px solid #ddd',
      overflow: 'auto',
      color: '#333'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Map Controls</h2>
      
      {/* Mode Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Mode</h3>
        {['select', 'add', 'line', 'remove'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              margin: '5px',
              padding: '8px 12px',
              background: mode === m ? '#007bff' : '#ccc',
              color: mode === m ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {m.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ color: '#333' }}>Points: {points.size}</div>
        <div style={{ color: '#333' }}>Lines: {lines.size}</div>
        <div style={{ color: '#333' }}>Saved Points: {savedPoints.size}</div>
        <div style={{ color: '#333' }}>Saved Lines: {savedLines.size}</div>
      </div>

      {/* Add Point by Coordinates */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #ddd' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Add Point by Coordinates</h3>
        <div style={{ marginBottom: '8px' }}>
          <input
            type="number"
            placeholder="Latitude (-90 to 90)"
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              marginBottom: '5px'
            }}
          />
          <input
            type="number"
            placeholder="Longitude (-180 to 180)"
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px'
            }}
          />
        </div>
        {inputError && (
          <div style={{ color: '#dc3545', fontSize: '12px', marginBottom: '8px' }}>
            {inputError}
          </div>
        )}
        <button
          onClick={handleAddPointFromText}
          disabled={!latInput || !lngInput}
          style={{
            padding: '8px 12px',
            background: (!latInput || !lngInput) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!latInput || !lngInput) ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          Add Point
        </button>
      </div>

      <button 
        onClick={onClearAll}
        style={{
          padding: '10px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        Clear All
      </button>

      {/* Saved Points */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Saved Points</h3>
        {Array.from(savedPoints).map(pointId => {
          const [lat, lng] = parseCoords(pointId);
          return (
            <div key={pointId} style={{
              background: 'white',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '12px', color: '#333', marginBottom: '5px' }}>
                <strong>Lat:</strong> {lat.toFixed(6)}<br/>
                <strong>Lng:</strong> {lng.toFixed(6)}
              </div>
              <button
                onClick={() => restoreSavedPoint(pointId)}
                style={{
                  padding: '4px 8px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 4px 2px 0',
                  cursor: 'pointer'
                }}
              >
                Open
              </button>
              <button
                onClick={() => deleteSavedPoint(pointId)}
                style={{
                  padding: '4px 8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 0',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {/* Current Points */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Current Points</h3>
        {Array.from(points).map(pointId => {
          const [lat, lng] = parseCoords(pointId);
          return (
            <div key={pointId} style={{
              background: 'white',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '12px', color: '#333', marginBottom: '5px' }}>
                <strong>Lat:</strong> {lat.toFixed(6)}<br/>
                <strong>Lng:</strong> {lng.toFixed(6)}
              </div>
              <div>
                <button
                  onClick={() => savePoint(pointId)}
                  style={{
                    padding: '4px 8px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '11px',
                    margin: '4px 4px 0 0',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => removePoint(points, setPoints, lines, setLines, pointId)}
                  style={{
                    padding: '4px 8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '11px',
                    marginTop: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Lines */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Current Lines</h3>
        {Array.from(lines).map(lineId => {
          const [start, end] = lineId.split('|');
          const [startLat, startLng] = parseCoords(start);
          const [endLat, endLng] = parseCoords(end);
          return (
            <div key={lineId} style={{
              background: 'white',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '11px', color: '#333', marginBottom: '5px' }}>
                <strong>From:</strong> {startLat.toFixed(4)}, {startLng.toFixed(4)}<br/>
                <strong>To:</strong> {endLat.toFixed(4)}, {endLng.toFixed(4)}
              </div>
              <button
                onClick={() => saveLine(lineId)}
                style={{
                  padding: '4px 8px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 4px 2px 0',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => removeLine(lines, setLines, lineId)}
                style={{
                  padding: '4px 8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 0',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {/* Saved Lines */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#333', marginBottom: '10px' }}>Saved Lines</h3>
        {Array.from(savedLines).map(lineId => {
          const [start, end] = lineId.split('|');
          const [startLat, startLng] = parseCoords(start);
          const [endLat, endLng] = parseCoords(end);
          return (
            <div key={lineId} style={{
              background: 'white',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{ fontSize: '11px', color: '#333', marginBottom: '5px' }}>
                <strong>From:</strong> {startLat.toFixed(4)}, {startLng.toFixed(4)}<br/>
                <strong>To:</strong> {endLat.toFixed(4)}, {endLng.toFixed(4)}
              </div>
              <button
                onClick={() => restoreSavedLine(lineId)}
                style={{
                  padding: '4px 8px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 4px 2px 0',
                  cursor: 'pointer'
                }}
              >
                Open
              </button>
              <button
                onClick={() => deleteSavedLine(lineId)}
                style={{
                  padding: '4px 8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  fontSize: '11px',
                  margin: '2px 0',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;