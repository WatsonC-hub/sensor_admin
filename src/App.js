import React, { useEffect, useState } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";
// import "./App.css";
// import { getSensorData } from "./api";
// import SimpleTabs from "./components/SimpleTabs";
// import LocationDrawer from "./LocationDrawer";
// import LocationContext from "./LocationContext";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
*/

function App() {
  const [token, setToken] = useState(
    sessionStorage.getItem("sessionId") || null
  );

  const [user, setUser] = useState(sessionStorage.getItem("user") || null);

  if (!user) {
    return <UnAuntenticatedApp setUser={setUser} />;
  }

  return <AuthenticatedApp setUser={setUser} />;
  // const [sensors, setSensors] = useState([]);
  // const [userId, setUserId] = useState(0);
  // const [locationId, setLocationId] = useState(-1);
  // const [stationId, setStationId] = useState(-1);
  // const [tabValue, setTabValue] = useState(0);

  // useEffect(() => {
  //   getSensorData().then((res) => {
  //     setSensors(res.data);
  //   });
  // }, [userId]);

  // return (
  //   <LocationContext.Provider
  //     value={{
  //       locationId,
  //       setLocationId,
  //       stationId,
  //       setStationId,
  //       tabValue,
  //       setTabValue,
  //     }}
  //   >
  //     <div className='App'>
  //       {locationId === -1 ? (
  //         <SimpleTabs sensors={sensors} />
  //       ) : (
  //         <LocationDrawer />
  //       )}
  //     </div>
  //   </LocationContext.Provider>
  // );
}

export default App;
