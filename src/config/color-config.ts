export const incomeColors = {
    HIGH: '#4CAF50',
    UPMID: '#8BC34A',
    LOWMID: '#FFC107',
    LOW: '#FF5722',
  };
  
  export const fcsColors = {
    VERY_HIGH: '#FF0000',
    HIGH: '#FF4500',
    MODERATELY_HIGH: '#FF8C00',
    MODERATELY_LOW: '#FFD700',
    LOW: '#ADFF2F',
    VERY_LOW: '#00FF00',
  };
  
  export const getIncomeColor = (incomeLevel: string) => {
    return incomeColors[incomeLevel as keyof typeof incomeColors] || '#9E9E9E';
  };
  
  export const getFcsColor = (prevalence: number) => {
    if (prevalence > 0.4) return fcsColors.VERY_HIGH;
    if (prevalence > 0.3) return fcsColors.HIGH;
    if (prevalence > 0.2) return fcsColors.MODERATELY_HIGH;
    if (prevalence > 0.1) return fcsColors.MODERATELY_LOW;
    if (prevalence > 0.05) return fcsColors.LOW;
    return fcsColors.VERY_LOW;
  };
  
  export const incomeLevels = [
    { level: 'High income', color: incomeColors.HIGH },
    { level: 'Upper middle income', color: incomeColors.UPMID },
    { level: 'Lower middle income', color: incomeColors.LOWMID },
    { level: 'Low income', color: incomeColors.LOW },
  ];
  
  export const fcsLevels = [
    { level: 'Very high (>40%)', color: fcsColors.VERY_HIGH },
    { level: 'High (30-40%)', color: fcsColors.HIGH },
    { level: 'Moderately high (20-30%)', color: fcsColors.MODERATELY_HIGH },
    { level: 'Moderately low (10-20%)', color: fcsColors.MODERATELY_LOW },
    { level: 'Low (5-10%)', color: fcsColors.LOW },
    { level: 'Very low (<5%)', color: fcsColors.VERY_LOW },
  ];

  export const ipcColors = {
    PHASE1: '#99C140',
    PHASE2: '#F9BC45',
    PHASE3: '#F99245',
    PHASE4: '#E32F27',
    PHASE5: '#5E0A17',
  };
  
  export const getIPCColor = (phase3PlusPercent: number) => {
    if (phase3PlusPercent >= 0.20) return ipcColors.PHASE5;
    if (phase3PlusPercent >= 0.15) return ipcColors.PHASE4;
    if (phase3PlusPercent >= 0.10) return ipcColors.PHASE3;
    if (phase3PlusPercent >= 0.05) return ipcColors.PHASE2;
    return ipcColors.PHASE1;
  };
  
  export const ipcLevels = [
    { level: 'Phase 5 (≥20%)', color: ipcColors.PHASE5 },
    { level: 'Phase 4 (15-19%)', color: ipcColors.PHASE4 },
    { level: 'Phase 3 (10-14%)', color: ipcColors.PHASE3 },
    { level: 'Phase 2 (5-9%)', color: ipcColors.PHASE2 },
    { level: 'Phase 1 (<5%)', color: ipcColors.PHASE1 },
  ];

  export const getHoverStyle = (baseColor: string) => ({
    fillColor: baseColor,
    fillOpacity: 0.9,
    weight: 3,
    color: '#333',
    opacity: 1
  });