import React from 'react';
import { fcsLevels } from '../config/color-config';

const FCSLegend: React.FC = () => {
  return (
    <div className="legend fcs-legend">
      <h3>Food Consumption Score Prevalence</h3>
      {fcsLevels.map(({ level, color }) => (
        <div key={level} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: color }}></span>
          <span className="legend-label">{level}</span>
        </div>
      ))}
    </div>
  );
};

export default FCSLegend;