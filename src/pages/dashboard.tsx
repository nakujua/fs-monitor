import React from "react";
import Map from "../components/fs-map"; // Retain the Map component

const Dashboard: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "100%" }}>
        <Map />
      </div>
    </div>
  );
};

export default Dashboard;
