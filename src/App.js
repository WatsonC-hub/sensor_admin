import React, { useEffect, useState } from "react";
import "./App.css";
import { getSensorData } from "./api";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./LocationDrawer";
import LocationContext from "./LocationContext";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
*/

function App() {
  const [sensors, setSensors] = useState([]);
  const [userId, setUserId] = useState(0);
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);

  useEffect(() => {
    getSensorData().then((res) => {
      setSensors(res.data);
    });
  }, [userId]);

  return (
    <LocationContext.Provider
      value={{ locationId, setLocationId, stationId, setStationId }}
    >
      <div className='App'>
        {locationId === -1 ? (
          <SimpleTabs sensors={sensors} />
        ) : (
          <LocationDrawer />
        )}
      </div>
    </LocationContext.Provider>
  );
}

export default App;
