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
    terminalid: "",
    sensorid: "",
    sensorinfo: "",
    calypso_id: "",
    batteriskift: "",
    startdato: "",
    slutdato: "",
  },
};

const StamdataContext =
  React.createContext(/*[
  0,
  () => {},
  {},
  () => {},
  () => {},
  () => {},
  () => {},
  () => {},
]*/);

const StamdataProvider = (props) => {
  const [formData, setFormData] = React.useState(data);

  const [locality, setLocality] = React.useState(0);

  const setLocationValue = (key, value) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [key]: value,
      },
    });
  };

  const setStationValue = (key, value) => {
    setFormData({
      ...formData,
      station: {
        ...formData.station,
        [key]: value,
      },
    });
  };

  const setUdstyrValue = (key, value) => {
    setFormData({
      ...formData,
      udstyr: {
        ...formData.udstyr,
        [key]: value,
      },
    });
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
      ]}
    >
      {props.children}
    </StamdataContext.Provider>
  );
};

export { StamdataContext /*, StamdataProvider*/ };
