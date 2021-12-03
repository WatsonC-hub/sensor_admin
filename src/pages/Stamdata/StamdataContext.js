import React, { useState } from "react";

let data = {
  location: {
    locid: "",
    locname: "",
    mainloc: "",
    subloc: "",
    subsubloc: "",
    x: "",
    y: "",
    terrainqual: "",
    description: "",
  },
  station: {
    stationname: "",
    stationtypename: "",
    parameter: "",
    maalepunktskote: "",
    terrainlevel: "",
  },
  udstyr: {
    terminal: "",
    terminal_id: "",
    sensor_id: "",
    sensorinfo: "",
    calypso_id: "",
    batteriskift: "",
    startdato: "",
    slutdato: "",
    uuid: "",
  },
};

const StamdataContext = React.createContext([
  0,
  () => {},
  {},
  () => {},
  () => {
    console.log("I am still empty");
  },
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
]);

const StamdataProvider = (props) => {
  const [formData, setFormData] = React.useState({
    location: {
      locid: "",
      locname: "",
      mainloc: "",
      subloc: "",
      subsubloc: "",
      x: "",
      y: "",
      terrainqual: "",
      description: "",
    },
    station: {
      stationname: "",
      stationtypename: "",
      parameter: "",
      maalepunktskote: "",
      terrainlevel: "",
    },
    udstyr: {
      terminal: "",
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
    console.log("setlocationvalue: ", key, "=>", value);
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
    console.log("I was called from context ", part);
    Object.keys(keyValues).forEach((k) => {
      if (part === "location") {
        console.log(k, " => ", keyValues[k]);
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
      stationname: station.ts_name,
      tstype_name: station.tstype_name,
      maalepunktskote: station.maalepunktskote,
      terrainlevel: station.terrainlevel,
    });
  };

  const saveUdstyrFormData = (unitData) => {
    setValues("udstyr", {
      terminal: unitData.terminal,
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
      locname: locationData.loc_name,
      mainloc: locationData.mainloc,
      subloc: locationData.subloc,
      subsubloc: locationData.subsubloc,
      x: locationData.x,
      y: locationData.y,
      terrainqual: locationData.terrainqual,
      terrainlevel: locationData.terrainlevel,
      description: locationData.description,
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
