import React from "react";

const StamdataContext = React.createContext([
  0,
  () => {},
  {},
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
]);

const StamdataProvider = (props) => {
  const [formData, setFormData] = React.useState({
    location: {
      loc_id: "",
      loc_name: "",
      mainloc: "",
      subloc: "",
      subsubloc: "",
      x: "",
      y: "",
      terrainqual: "",
      description: "",
      loctype_id: -1,
    },
    station: {
      ts_id: "",
      ts_name: "",
      tstype_id: "",
      parameter: "",
      maalepunktskote: "",
      mp_description: "",
      sensor_depth_m: "",
    },
    udstyr: {
      terminal_type: "",
      terminal_id: "",
      sensor_id: "",
      sensorinfo: "",
      calypso_id: "",
      batteriskift: "",
      startdato: "",
      slutdato: "",
      uuid: "",
    },
  });

  const [locality, setLocality] = React.useState(0);

  const setLocationValue = (key, value) => {
    // console.log("setlocationvalue: ", key, "=>", value);
    setFormData((formData) => ({
      ...formData,
      location: {
        ...formData.location,
        [key]: value,
      },
    }));
  };

  const setStationValue = (key, value) => {
    setFormData((formData) => ({
      ...formData,
      station: {
        ...formData.station,
        [key]: value,
      },
    }));
  };

  const setUdstyrValue = (key, value) => {
    setFormData((formData) => ({
      ...formData,
      udstyr: {
        ...formData.udstyr,
        [key]: value,
      },
    }));
  };

  const setValues = (part, keyValues) => {
    Object.keys(keyValues).forEach((k) => {
      if (part === "location") {
        setLocationValue(k, keyValues[k]);
      } else if (part === "station") {
        setStationValue(k, keyValues[k]);
      } else if (part === "udstyr") {
        setUdstyrValue(k, keyValues[k]);
      }
    });
  };

  const saveStationFormData = (station) => {
    setValues("station", {
      ts_id: station.ts_id,
      ts_name: station.ts_name,
      tstype_name: station.tstype_name,
      tstype_id: station.tstype_id,
      maalepunktskote: station.maalepunktskote,
      mp_description: station.mp_description,
      sensor_depth_m: station.sensor_depth_m,
    });
  };

  const saveUdstyrFormData = (unitData) => {
    setValues("udstyr", {
      terminal_type: unitData.terminal_type,
      terminal_id: unitData.terminal_id,
      sensor_id: unitData.sensor_id,
      sensorinfo: unitData.sensorinfo,
      calypso_id: unitData.calypso_id,
      batteriskift: unitData.batteriskift,
      startdato: unitData.startdato,
      slutdato: unitData.slutdato,
      uuid: unitData.uuid,
    });
  };

  const saveLocationFormData = (locationData) => {
    setValues("location", {
      loc_id: locationData.loc_id,
      loc_name: locationData.loc_name,
      mainloc: locationData.mainloc,
      subloc: locationData.subloc,
      subsubloc: locationData.subsubloc,
      x: locationData.x,
      y: locationData.y,
      terrainqual: locationData.terrainqual,
      terrainlevel: locationData.terrainlevel,
      description: locationData.description,
      loctype_id: locationData.loctype_id,
    });
  };

  return (
    <StamdataContext.Provider
      value={[
        locality,
        setLocality,
        formData,
        setFormData,
        setValues,
        setLocationValue,
        setStationValue,
        setUdstyrValue,
        saveUdstyrFormData,
        saveLocationFormData,
        saveStationFormData,
      ]}
    >
      {props.children}
    </StamdataContext.Provider>
  );
};

export { StamdataContext, StamdataProvider };
