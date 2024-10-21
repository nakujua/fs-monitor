export interface HazardIconConfig {
    type: string;
    iconUrl: string;
    label: string;
  }
      //Severities: {'WATCH', 'WARNING', 'INFORMATION', 'ADVISORY'}  
  export const hazardIcons: HazardIconConfig[] = [
    { type: 'FLOOD', iconUrl: '/icons/flood-icon.png', label: 'Flood' },
    { type: 'VOLCANO', iconUrl: '/icons/volcano-icon.png', label: 'Volcano' },
    { type: 'HIGHWIND', iconUrl: '/icons/highwind-icon.png', label: 'High Wind' },
    { type: 'SEVEREWEATHER', iconUrl: '/icons/severeweather-icon.png', label: 'Severe Weather' },
    { type: 'CYCLONE', iconUrl: '/icons/cyclone-icon.png', label: 'Cyclone' },
    { type: 'CIVILUNREST', iconUrl: '/icons/civilunrest-icon.png', label: 'Civil Unrest' },
    { type: 'STORM', iconUrl: '/icons/storm-icon.png', label: 'Storm' },
    { type: 'LANDSLIDE', iconUrl: '/icons/landslide-icon.png', label: 'Landslide' },
    { type: 'EXTREMETEMPERATURE', iconUrl: '/icons/extremetemperature-icon.png', label: 'Extreme Temperature' },
    { type: 'EARTHQUAKE', iconUrl: '/icons/earthquake-icon.png', label: 'Earthquake' },
    { type: 'BIOMEDICAL', iconUrl: '/icons/biomedical-icon.png', label: 'Biomedical Hazard' },
    { type: 'INCIDENT', iconUrl: '/icons/incident-icon.png', label: 'Incident' },
    { type: 'DROUGHT', iconUrl: '/icons/drought-icon.png', label: 'Drought' },
    { type: 'COMBAT', iconUrl: '/icons/combat-icon.png', label: 'Combat' },
    { type: 'TERRORISM', iconUrl: '/icons/terrorism-icon.png', label: 'Terrorism' },
    { type: 'WILDFIRE', iconUrl: '/icons/wildfire-icon.png', label: 'Wildfire' },
    { type: 'EQUIPMENT', iconUrl: '/icons/equipment-icon.png', label: 'Equipment Failure' },
    { type: 'ACCIDENT', iconUrl: '/icons/accident-icon.png', label: 'Accident' },
  ];
  
  export const getHazardIcon = (type: string): string => {
    const icon = hazardIcons.find(icon => icon.type === type.toUpperCase());
    return icon ? icon.iconUrl : '/icons/default-icon.png';
  };
  
  export const getHazardLabel = (type: string): string => {
    const icon = hazardIcons.find(icon => icon.type === type.toUpperCase());
    return icon ? icon.label : 'Unknown Hazard';
  };