import React, { useCallback, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import { getIncomeColor, getFcsColor, getIPCColor, getHoverStyle } from "../config/color-config";
import { getHazardIcon, getHazardLabel } from "../config/hazard-icons";
import { useMapData } from "../hooks/useMapData";
import ErrorBoundary from "./ErrorBoundary";
import LoadingSpinner from "./LoadingSpinner";
import MapButton from "./MapButton";
import CountryInfoLegend from "./CountryInfoLegend";
import FCSLegend from "./FCSLegend";
import IPCLegend from "./IPCLegend";
import HazardsLegend from "./HazardsLegend";
import "leaflet/dist/leaflet.css";
import "./Map.css";

interface MapProps {
  center: [number, number];
  zoom: number;
}

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const mapRef = useRef<L.Map | null>(null);
  
  const {
    geoData,
    countryInfo,
    fcsData,
    ipcData,
    hazardsData,
    isCountryInfoReady,
    isFcsDataReady,
    isIpcDataReady,
    isHazardsDataReady,
    loading,
    error,
    activeDataset,
    showHazards,
    toggleDataset,
    toggleHazards,
  } = useMapData();

  const getFeatureStyle = useCallback((feature: any) => {
    const iso3 = feature?.properties?.iso_a3;
    const iso2 = feature?.properties?.iso_a2;
    
    switch (activeDataset) {
      case "fcs":
        return {
          fillColor: isFcsDataReady && fcsData[iso3] !== undefined ? getFcsColor(fcsData[iso3]) : "#ccc",
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
      case "ipc":
        return {
          fillColor: isIpcDataReady && ipcData[iso3] ? getIPCColor(ipcData[iso3].phase_3_plus_percent) : "#ccc",
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
      default:
        return {
          fillColor: countryInfo[iso2] ? getIncomeColor(countryInfo[iso2].income_group.level) : "#ccc",
          weight: 1,
          opacity: 1,
          color: 'white',
          fillOpacity: 0.7
        };
    }
  }, [fcsData, ipcData, countryInfo, activeDataset, isFcsDataReady, isIpcDataReady]);

  const onEachFeature = useCallback((feature: any, layer: L.Layer) => {
    const iso3 = feature?.properties?.iso_a3;
    const iso2 = feature?.properties?.iso_a2;
    const countryName = feature?.properties?.name;
    
    const getTooltipContent = () => {
      switch (activeDataset) {
        case "fcs":
          return isFcsDataReady && fcsData[iso3] !== undefined 
            ? `<strong>${countryName}</strong><br/>FCS Prevalence: ${(fcsData[iso3] * 100).toFixed(2)}%`
            : `<strong>${countryName}</strong><br/>FCS data not available`;
        case "ipc":
          return isIpcDataReady && ipcData[iso3]
            ? `<strong>${countryName}</strong><br/>` +
              `IPC Phase 3+: ${(ipcData[iso3].phase_3_plus_percent * 100).toFixed(2)}%<br/>` +
              `Analysis Period: ${ipcData[iso3].analysis_period_from} to ${ipcData[iso3].analysis_period_to}`
            : `<strong>${countryName}</strong><br/>IPC data not available`;
        default:
          return countryInfo[iso2]
            ? `<strong>${countryInfo[iso2].country.name}</strong><br/>` +
              `Population: ${countryInfo[iso2].population.number.toLocaleString()} (${countryInfo[iso2].population.year})<br/>` +
              `Income Group: ${countryInfo[iso2].income_group.level}`
            : `<strong>${countryName}</strong><br/>Country info not available`;
      }
    };

    layer.bindTooltip(getTooltipContent(), {
      sticky: true,
      direction: "auto",
      className: "custom-tooltip",
    });

    layer.on({
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        const style = getFeatureStyle(feature);
        target.setStyle(getHoverStyle(style.fillColor));
        target.openTooltip();
        target.bringToFront();
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle(getFeatureStyle(feature));
        target.closeTooltip();
      },
    });
  }, [fcsData, ipcData, countryInfo, activeDataset, isFcsDataReady, isIpcDataReady, getFeatureStyle]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <ErrorBoundary>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          className="map-container"
          ref={mapRef}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com">Esri</a> contributors'
          />

          {isCountryInfoReady && geoData && (
            <GeoJSON
              data={geoData}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          )}

          {showHazards && isHazardsDataReady && hazardsData.map((hazard, index) => (
            <Marker
              key={index}
              position={[hazard.latitude, hazard.longitude]}
              icon={L.icon({ iconUrl: getHazardIcon(hazard.type), iconSize: [25, 25] })}
            >
              <Popup>
                <strong>{hazard.name}</strong><br />
                Type: {getHazardLabel(hazard.type)}<br />
                Severity: {hazard.severity}<br />
                Last Update: {new Date(hazard.lastUpdate).toLocaleDateString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {activeDataset === "country" && <CountryInfoLegend />}
        {activeDataset === "fcs" && isFcsDataReady && <FCSLegend />}
        {activeDataset === "ipc" && isIpcDataReady && <IPCLegend />}
        {showHazards && isHazardsDataReady && <HazardsLegend />}

        <div className="button-container">
          <MapButton
            title="Country Info"
            icon="FaGlobe"
            active={activeDataset === "country"}
            onClick={() => toggleDataset("country")}
            disabled={activeDataset === "country"}
          />
          <MapButton
            title="Food Consumption Score"
            icon="FaUtensils"
            active={activeDataset === "fcs"}
            onClick={() => toggleDataset("fcs")}
            disabled={activeDataset === "fcs" || !isFcsDataReady}
            loading={!isFcsDataReady}
          />
          <MapButton
            title="IPC/CH"
            icon="FaChartBar"
            active={activeDataset === "ipc"}
            onClick={() => toggleDataset("ipc")}
            disabled={activeDataset === "ipc" || !isIpcDataReady}
            loading={!isIpcDataReady}
          />
          <MapButton
            title="Hazards"
            icon="FaExclamationTriangle"
            active={showHazards}
            onClick={toggleHazards}
            disabled={!isHazardsDataReady}
            loading={!isHazardsDataReady}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(Map);