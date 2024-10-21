import React from 'react';
import { incomeLevels } from '../config/color-config';

const CountryInfoLegend: React.FC = () => {
  return (
    <div className="legend country-info-legend">
      <h3>Country Income Levels</h3>
      {incomeLevels.map(({ level, color }) => (
        <div key={level} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: color }}></span>
          <span className="legend-label">{level}</span>
        </div>
      ))}
    </div>
  );
};

export default CountryInfoLegend;