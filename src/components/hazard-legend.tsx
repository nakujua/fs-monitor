
import React from 'react';
import { hazardIcons } from '../config/hazard-icons';

const HazardsLegend: React.FC = () => {
  return (
    <div className="legend hazards-legend">
      <h3>Hazard Types</h3>
      {hazardIcons.map(({ type, iconUrl, label }) => (
        <div key={type} className="legend-item">
          <img src={iconUrl} alt={label} className="legend-icon" />
          <span className="legend-label">{label}</span>
        </div>
      ))}
    </div>
  );
};

export default HazardsLegend;