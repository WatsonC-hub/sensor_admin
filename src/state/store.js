import create from "zustand";
import { devtools } from "zustand/middleware";

export const initialState = {
  location: {
    loc_id: "",
    loc_name: "",
    mainloc: "",
    subloc: "",
    subsubloc: "",
    x: 0,
    y: 0,
    terrainqual: "",
    terrainlevel: 0,
    description: "",
    loctype_id: -1,
  },
  timeseries: {
    ts_id: "",
    ts_name: "",
    tstype_id: 1,
    parameter: "",
    maalepunktskote: 0,
    mp_description: "",
    sensor_depth_m: 0,
    unit: "",
  },
  unit: {
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
};

let stamdataStore = (set) => ({
  ...initialState,
  resetLocation: () => set({ location: initialState.location }),
  resetUnit: () => set({ unit: initialState.unit }),
  setLocation: (locationData) =>
    set({ location: locationData }, false, "setLocation"),
  setTimeseries: (timeseriesdata) =>
    set({ timeseries: timeseriesdata }, false, "setTimeseries"),
  setUnit: (unitdata) => set({ unit: unitdata }, false, "setUnit"),
  setUnitValue: (key, value) =>
    set(
      (state) => ({
        unit: {
          ...state.unit,
          [key]: value,
        },
      }),
      false,
      "setUnitValue"
    ),
  setLocationValue: (key, value) =>
    set(
      (state) => ({
        location: {
          ...state.location,
          [key]: value,
        },
      }),
      false,
      "setLocationValue"
    ),
  setTimeseriesValue: (key, value) =>
    set(
      (state) => ({
        timeseries: {
          ...state.timeseries,
          [key]: value,
        },
      }),
      false,
      "setTimeseriesValue"
    ),
});

stamdataStore = devtools(stamdataStore);

export default create(stamdataStore);
