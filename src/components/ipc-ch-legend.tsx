import React from 'react';
import { ipcLevels } from '../config/color-config';

const IPCLegend: React.FC = () => {
  return (
    <div className="legend ipc-legend">
      <h3>IPC/CH Phase Classification</h3>
      {ipcLevels.map(({ level, color }) => (
        <div key={level} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: color }}></span>
          <span className="legend-label">{level}</span>
        </div>
      ))}
    </div>
  );
};

export default IPCLegend;