import create from "zustand";
import { devtools, persist } from "zustand/middleware";

export const authStore = create(
  persist(
    devtools((set, get) => ({
      authenticated: false,
      user: null,
      sessionId: null,
      loginExpired: false,
      setAuthenticated: (authenticated) =>
        set(
          {
            authenticated: authenticated,
          },
          false,
          "setAuthenticated"
        ),
      setUser: (user) =>
        set(
          {
            user: user,
          },
          false,
          "setUser"
        ),
      setSessionId: (sessionId) =>
        set(
          {
            sessionId: sessionId,
          },
          false,
          "setSessionId"
        ),
      setLoginExpired: (loginexpired) =>
        set(
          {
            loginExpired: loginexpired,
          },
          false,
          "setLoginExpired"
        ),
    })),
    {
      name: "auth-storage", // name of item in the storage (must be unique)
      getStorage: () => sessionStorage, // (optional) by default the 'localStorage' is used
    }
  )
);

const initialState = {
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
  resetTimeseries: () => set({ timeseries: initialState.timeseries }),
  resetUnit: () => set({ unit: initialState.unit }),
  setLocation: (locationData) =>
    set(
      {
        location: {
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
        },
      },
      false,
      "setLocation"
    ),
  setTimeseries: (timeseriesdata) =>
    set(
      {
        timeseries: {
          ts_id: timeseriesdata.ts_id,
          ts_name: timeseriesdata.ts_name,
          tstype_name: timeseriesdata.tstype_name,
          tstype_id: timeseriesdata.tstype_id,
          maalepunktskote: timeseriesdata.maalepunktskote,
          mp_description: timeseriesdata.mp_description,
          sensor_depth_m: timeseriesdata.sensor_depth_m,
          unit: timeseriesdata.unit,
        },
      },
      false,
      "setTimeseries"
    ),
  setUnit: (unitData) =>
    set(
      {
        unit: {
          terminal_type: unitData.terminal_type,
          terminal_id: unitData.terminal_id,
          sensor_id: unitData.sensor_id,
          sensorinfo: unitData.sensorinfo,
          calypso_id: unitData.calypso_id,
          batteriskift: unitData.batteriskift,
          startdato: unitData.startdato,
          slutdato: unitData.slutdato,
          uuid: unitData.uuid,
        },
      },
      false,
      "setUnit"
    ),
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

stamdataStore = create(devtools(stamdataStore));

export { initialState, stamdataStore };
