import React, { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import { GeoJsonFeatureCollection, CountryInfo, CountryInfoResponse } from "../packages/types/country-types";
import { FoodSecurityResponse } from "../packages/types/food-security-types";
import { IPCResponse, IPCPeak } from "../packages/types/ipc-ch-types";
import { HazardResponse, Hazard } from "../packages/types/hazard-types";
import CountryInfoLegend from "./country-Info-legend";
import FCSLegend from "./fcs-legend";
import IPCLegend from "./ipc-ch-legend";
import HazardsLegend from "./hazard-legend";
import { getIncomeColor, getFcsColor, getIPCColor, getHoverStyle } from "../config/color-config";
import { getHazardIcon, getHazardLabel } from "../config/hazard-icons";
import "leaflet/dist/leaflet.css";
import "./fs-map.css";

import { FaGlobe, FaUtensils, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';

const defaultStyle = {
  color: "#000",
  fillColor: "#fff",
  weight: 2,
  fillOpacity: 0.9,
};

// Define the bounding box for Africa
const AFRICA_BOUNDS = {
  north: 37.5,   // Northernmost point (approximately)
  south: -34.5,  // Southernmost point (approximately)
  west: -17.5,   // Westernmost point (approximately)
  east: 51.5     // Easternmost point (approximately)
};

const Map: React.FC = () => {
  const [geoData, setGeoData] = useState<GeoJsonFeatureCollection | null>(null);
  const [countryInfo, setCountryInfo] = useState<Record<string, CountryInfo>>({});
  const [fcsData, setFcsData] = useState<Record<string, number>>({});
  const [ipcData, setIpcData] = useState<Record<string, IPCPeak>>({});
  const [hazardsData, setHazardsData] = useState<Hazard[]>([]);
  const [isCountryInfoReady, setIsCountryInfoReady] = useState<boolean>(false);
  const [isFcsDataReady, setIsFcsDataReady] = useState<boolean>(false);
  const [isIpcDataReady, setIsIpcDataReady] = useState<boolean>(false);
  const [isHazardsDataReady, setIsHazardsDataReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const [activeDataset, setActiveDataset] = useState<"country" | "fcs" | "ipc">("country");
  const [showHazards, setShowHazards] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch GeoJSON data
        const geoResponse = await fetch("/africa.json");
        if (!geoResponse.ok) {
          throw new Error(`Failed to load GeoJSON data: ${geoResponse.status}`);
        }
        const geoData: GeoJsonFeatureCollection = await geoResponse.json();
        setGeoData(geoData);

        // Fetch country info data
        const countryResponse = await fetch("https://api.hungermapdata.org/v2/info/country");
        const countryData: CountryInfoResponse = await countryResponse.json();

        if (countryData.statusCode === "200") {
          const countryInfoMap = countryData.body.countries.reduce(
            (acc: Record<string, CountryInfo>, country: CountryInfo) => {
              acc[country.country.iso2] = country;
              return acc;
            },
            {}
          );
          setCountryInfo(countryInfoMap);
          setIsCountryInfoReady(true);
          setLoading(false);
        } else {
          setIsCountryInfoReady(true);
          setLoading(false);
          console.log("Failed to load country info data");
        }

        // Start loading FCS data in the background
        fetchFcsData(geoData);
        fetchIpcData(geoData);
        fetchHazardsData();
      } catch (error) {
        setError("An error occurred while loading initial data.");
        console.error(error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchFcsData = async (geoData: GeoJsonFeatureCollection) => {
    try {
      const newFcsData: Record<string, number> = {};
      const fetchPromises = geoData.features.map(async (feature) => {
        const iso3 = feature.properties?.iso_a3;
        if (iso3) {
          const url = `https://api.hungermapdata.org/v1/foodsecurity/country/${iso3}`;
          try {
            const response = await fetch(url);
            const data: FoodSecurityResponse = await response.json();
            if (data.statusCode === "200") {
              newFcsData[iso3] = data.body.metrics.fcs.prevalence;
            }
          } catch (error) {
            console.error(`Error fetching FCS data for ${iso3}:`, error);
          }
        }
      });

      await Promise.all(fetchPromises);
      setFcsData(newFcsData);
      setIsFcsDataReady(true);
    } catch (error) {
      console.error("Error loading FCS data:", error);
      setError("An error occurred while loading FCS data.");
    }
  };

  const fetchIpcData = async (geoData: GeoJsonFeatureCollection) => {
    try {
      const response = await fetch("https://api.hungermapdata.org/v1/ipc/peaks");
      const data: IPCResponse = await response.json();
      
      if (data.statusCode === "200") {
        const ipcDataMap: Record<string, IPCPeak> = {};
        data.body.ipc_peaks.forEach(peak => {
          const phase_3_plus_percent = peak.analyzed_population_number > 0
            ? peak.phase_3_plus_number / peak.analyzed_population_number
            : 0;
          
          ipcDataMap[peak.iso3] = {
            ...peak,
            phase_3_plus_percent
          };
        });
        setIpcData(ipcDataMap);
        setIsIpcDataReady(true);
      } else {
        throw new Error("Failed to load IPC data");
      }
    } catch (error) {
      console.error("Error loading IPC data:", error);
      setError("An error occurred while loading IPC data.");
    }
  };

  const fetchHazardsData = async () => {
    try {
      const response = await fetch("https://api.hungermapdata.org/v1/climate/hazards");
      const data: HazardResponse = await response.json();
      
      if (data.statusCode === "200") {
        const filteredHazards = filterHazardsWithinAfrica(data.body.hazards);
        setHazardsData(filteredHazards);
        setIsHazardsDataReady(true);
      } else {
        throw new Error("Failed to load hazards data");
      }
    } catch (error) {
      console.error("Error loading hazards data:", error);
      setError("An error occurred while loading hazards data.");
    }
  };

  const isPointInAfrica = (lat: number, lon: number): boolean => {
    return lat >= AFRICA_BOUNDS.south && lat <= AFRICA_BOUNDS.north &&
           lon >= AFRICA_BOUNDS.west && lon <= AFRICA_BOUNDS.east;
  };

  const filterHazardsWithinAfrica = (hazards: Hazard[]): Hazard[] => {
    return hazards.filter(hazard => 
      isPointInAfrica(hazard.latitude, hazard.longitude)
    );
  };

  const createHazardIcon = (type: string) => {
    const iconSize = [25, 25];
    const iconUrl = getHazardIcon(type);

    return L.icon({ iconUrl, iconSize: [25, 25] });
  };

  const toggleHazards = () => {
    setShowHazards(!showHazards);
  };

  const getFeatureStyle = useCallback((feature: any) => {
    const iso3 = feature?.properties?.iso_a3;
    const iso2 = feature?.properties?.iso_a2;
    
    switch (activeDataset) {
      case "fcs":
        if (isFcsDataReady) {
          const fcsPrevalence = fcsData[iso3];
          return {
            ...defaultStyle,
            fillColor: fcsPrevalence !== undefined ? getFcsColor(fcsPrevalence) : "#ccc",
          };
        }
        break;
      case "ipc":
        if (isIpcDataReady) {
          const ipcPeak = ipcData[iso3];
          return {
            ...defaultStyle,
            fillColor: ipcPeak ? getIPCColor(ipcPeak.phase_3_plus_percent) : "#ccc",
          };
        }
        break;
      default:
        const country = countryInfo[iso2];
        return {
          ...defaultStyle,
          fillColor: country ? getIncomeColor(country.income_group.level) : "#ccc",
        };
    }
    return defaultStyle;
  }, [fcsData, ipcData, countryInfo, activeDataset, isFcsDataReady, isIpcDataReady]);

  const onEachFeature = useCallback((feature: any, layer: any) => {
    const iso3 = feature?.properties?.iso_a3;
    const iso2 = feature?.properties?.iso_a2;
    const countryName = feature?.properties?.name;
    
    const getTooltipContent = () => {
      switch (activeDataset) {
        case "fcs":
          if (isFcsDataReady) {
            const fcsPrevalence = fcsData[iso3];
            return fcsPrevalence !== undefined 
              ? `<strong>${countryName}</strong><br/>FCS Prevalence: ${(fcsPrevalence * 100).toFixed(2)}%`
              : `<strong>${countryName}</strong><br/>FCS data not available`;
          }
          break;
        case "ipc":
          if (isIpcDataReady) {
            const ipcPeak = ipcData[iso3];
            return ipcPeak
              ? `<strong>${countryName}</strong><br/>` +
                `IPC Phase 3+: ${(ipcPeak.phase_3_plus_percent * 100).toFixed(2)}%<br/>` +
                `Analysis Period: ${ipcPeak.analysis_period_from} to ${ipcPeak.analysis_period_to}`
              : `<strong>${countryName}</strong><br/>IPC data not available`;
          }
          break;
        default:
          const info = countryInfo[iso2];
          return info
            ? `<strong>${info.country.name}</strong><br/>` +
              `Population: ${info.population.number.toLocaleString()} (${info.population.year})<br/>` +
              `Income Group: ${info.income_group.level}`
            : `<strong>${countryName}</strong><br/>Country info not available`;
      }
      return `<strong>${countryName}</strong><br/>Data not available`;
    };

    layer.bindTooltip(getTooltipContent(), {
      sticky: true,
      direction: "auto",
      className: "custom-tooltip",
    });

    layer.on({
      mouseover: (e: any) => {
        const target = e.target;
        const style = getFeatureStyle(feature);
        target.setStyle(getHoverStyle(style.fillColor));
        target.openTooltip();
        target.bringToFront();
      },
      mouseout: (e: any) => {
        const target = e.target;
        target.setStyle(getFeatureStyle(feature));
        target.closeTooltip();
      },
    });
  }, [fcsData, ipcData, countryInfo, activeDataset, isFcsDataReady, isIpcDataReady, getFeatureStyle]);

  const toggleDataset = (dataset: "country" | "fcs" | "ipc") => {
    if ((dataset === "fcs" && !isFcsDataReady) || (dataset === "ipc" && !isIpcDataReady)) {
      alert(`${dataset.toUpperCase()} data is still loading. Please wait.`);
      return;
    }
    setActiveDataset(dataset);
    setGeoJsonKey(prev => prev + 1);
  };

  return (
    <div className="map-container">
      {loading && <div className="loading-message">Loading initial data, please wait...</div>}
      {/* {error && <div className="error-message">Error: {error}</div>}
      {!isFcsDataReady && <div className="loading-message">FCS data is still loading...</div>}
      {!isIpcDataReady && <div className="loading-message">IPC/CH data is still loading...</div>} */}

      <MapContainer
        center={[0, 20]}
        zoom={3}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer
          //url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
        />

        {isCountryInfoReady && geoData && (
          <GeoJSON
            key={geoJsonKey}
            data={geoData}
            style={getFeatureStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {showHazards && isHazardsDataReady && hazardsData.map((hazard, index) => (
          <Marker
            key={index}
            position={[hazard.latitude, hazard.longitude]}
            icon={createHazardIcon(hazard.type)}
          >
            <Popup>
              <strong>{hazard.name}</strong><br />
              Type: {hazard.type}<br />
              Severity: {hazard.severity}<br />
              Last Update: {hazard.lastUpdate}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Context-aware legends */}
      {activeDataset === "country" && <CountryInfoLegend />}
      {activeDataset === "fcs" && isFcsDataReady && <FCSLegend />}
      {activeDataset === "ipc" && isIpcDataReady && <IPCLegend />}
      {showHazards && isHazardsDataReady && <HazardsLegend />}

      <div className="button-container">
        <button 
          className={`toggle-button ${activeDataset === "country" ? "active" : ""}`} 
          onClick={() => toggleDataset("country")}
          disabled={activeDataset === "country"}
        >
          <span className="button-title">Country Info</span>
          <FaGlobe className="button-icon" />
        </button>
        <button 
          className={`toggle-button ${activeDataset === "fcs" ? "active" : ""}`} 
          onClick={() => toggleDataset("fcs")}
          disabled={activeDataset === "fcs" || !isFcsDataReady}
        >
          <span className="button-title">Food Consumption Score</span>
          <FaUtensils className="button-icon" />
          {!isFcsDataReady && <span className="loading-indicator">(Loading...)</span>}
        </button>
        <button 
          className={`toggle-button ${activeDataset === "ipc" ? "active" : ""}`} 
          onClick={() => toggleDataset("ipc")}
          disabled={activeDataset === "ipc" || !isIpcDataReady}
        >
          <span className="button-title">IPC/CH</span>
          <FaChartBar className="button-icon" />
          {!isIpcDataReady && <span className="loading-indicator">(Loading...)</span>}
        </button>
        <button 
          className={`toggle-button ${showHazards ? "active" : ""}`} 
          onClick={toggleHazards}
          disabled={!isHazardsDataReady}
        >
          <span className="button-title">Hazards</span>
          <FaExclamationTriangle className="button-icon" />
          {!isHazardsDataReady && <span className="loading-indicator">(Loading...)</span>}
        </button>
      </div>
    </div>
  );
};

export default Map;