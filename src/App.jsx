import axios from 'axios';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Sidebar from './Sidebar';
import {
  addPoint,
  addLine,
  addPointFromText,
  parseCoords,
  loadFromStorage,
  clearAll,
  removePoint,
  removeLine
} from './mapFunctions';
import './App.css';

// Fix Leaflet icon path for markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map click handler
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
}

function App() {
  const [points, setPoints] = useState(() => loadFromStorage('mapPoints'));
  const [lines, setLines] = useState(() => loadFromStorage('mapLines'));
  const [mode, setMode] = useState('add');
  const [selectedForLine, setSelectedForLine] = useState([]);

  const handleMapClick = (latlng) => {
    if (mode === 'add') {
      addPoint(points, setPoints, latlng.lat, latlng.lng);
    }
  };

  const handlePointClick = (pointId) => {
    if (mode === 'line') {
      if (selectedForLine.includes(pointId)) {
        setSelectedForLine(selectedForLine.filter(id => id !== pointId));
      } else {
        const newSelected = [...selectedForLine, pointId];
        setSelectedForLine(newSelected);

        if (newSelected.length === 2) {
          addLine(lines, setLines, newSelected[0], newSelected[1]);
          setSelectedForLine([]);
        }
      }
    } else if (mode === 'remove') {
      removePoint(points, setPoints, lines, setLines, pointId);
    }
  };

  const handleClearAll = () => {
    clearAll(setPoints, setLines);
    setSelectedForLine([]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Map Section */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[40.7128, -74.0060]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* Render Points */}
          {Array.from(points).map((pointId) => {
            const [lat, lng] = parseCoords(pointId);
            const isSelectedForLine = selectedForLine.includes(pointId);
            return (
              <Marker
                key={pointId}
                position={[lat, lng]}
                eventHandlers={{
                  click: () => handlePointClick(pointId)
                }}
                opacity={isSelectedForLine ? 0.5 : 1.0}
              />
            );
          })}

          {/* Render Lines */}
          {Array.from(lines).map((lineId) => {
            const [start, end] = lineId.split('|');
            const startCoords = parseCoords(start);
            const endCoords = parseCoords(end);
            return (
              <Polyline
                key={lineId}
                positions={[startCoords, endCoords]}
                color="blue"
                weight={3}
                eventHandlers={{
                  click: () => {
                    if (mode === 'remove') {
                      removeLine(lines, setLines, lineId);
                    }
                  }
                }}
              />
            );
          })}
        </MapContainer>

        {/* Mode Display */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Mode: {mode.toUpperCase()}
          {mode === 'line' && selectedForLine.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: 'normal' }}>
              Selected: {selectedForLine.length}/2
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        mode={mode}
        setMode={setMode}
        points={points}
        setPoints={setPoints}
        lines={lines}
        setLines={setLines}
        onClearAll={() => clearAll(points, setPoints, lines, setLines)}
        addPointFromText={addPointFromText}
      />
    </div>
  );
}

export default App;