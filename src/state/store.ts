import * as Sentry from '@sentry/react';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';

import {Ressourcer} from '~/features/stamdata/components/stationDetails/multiselect/types';
import {Access, ContactInfo} from '~/types';

type AuthState = {
  authenticated: boolean;
  user_id: number | null;
  org_id: number | null;
  loginExpired: boolean;
  boreholeAccess: boolean;
  iotAccess: boolean;
  adminAccess: boolean;
  superUser: boolean;
  properties: any;
  resetState: () => void;
  setAuthenticated: (authenticated: boolean) => void;
  setAuthorization: (user: any) => void;
  setLoginExpired: (loginexpired: boolean) => void;
};

const authInitialState = {
  authenticated: false,
  user_id: null,
  org_id: null,
  loginExpired: false,
  boreholeAccess: false,
  iotAccess: false,
  adminAccess: false,
  superUser: false,
  properties: {},
};

export const authStore = create<AuthState>()(
  persist(
    devtools((set) => ({
      ...authInitialState,
      resetState: () => {
        set(authInitialState, false, 'resetState');
        Sentry.setUser(null);
      },
      setAuthenticated: (authenticated) =>
        set(
          {
            authenticated: authenticated,
          },
          false,
          'setAuthenticated'
        ),
      setAuthorization: (user) => {
        set(
          {
            properties: user.properties,
            boreholeAccess: user.boreholeAccess,
            user_id: user.user_id,
            org_id: user.org_id,
            iotAccess: user.iotAccess,
            adminAccess: user.adminAccess,
            superUser: user.superUser,
          },
          false,
          'setAuthorization'
        );
        Sentry.setUser({id: user.user_id});
      },
      setLoginExpired: (loginexpired) =>
        set(
          {
            loginExpired: loginexpired,
          },
          false,
          'setLoginExpired'
        ),
    })),
    {
      name: 'calypso-auth-storage', // name of item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
    }
  )
);

type LocationState = {
  location: {
    loc_id?: number;
    loc_name: string;
    mainloc: string;
    subloc: string;
    subsubloc: string;
    x: number;
    y: number;
    groups: string[];
    terrainqual: string;
    terrainlevel: number;
    description: string;
    loctype_id: number;
    initial_project_no: string | null;
  };
  timeseries: {
    ts_id: number;
    ts_name: string;
    tstype_id: number;
    tstype_name: string;
    maalepunktskote: number;
    mp_description: string;
    sensor_depth_m: number;
    unit: string;
  };
  unit: {
    terminal_type: string;
    terminal_id: string;
    sensor_id: string;
    sensorinfo: string;
    calypso_id: string;
    batteriskift: string;
    startdato: string;
    slutdato: string;
    uuid: string;
    gid: number;
  };
  resetLocation: () => void;
  resetTimeseries: () => void;
  resetUnit: () => void;
  setLocation: (locationData: any) => void;
  setTimeseries: (timeseriesdata: any) => void;
  setUnit: (unitData: any) => void;
  setUnitValue: (key: string, value: any) => void;
  setLocationValue: (key: string, value: any) => void;
  setTimeseriesValue: (key: string, value: any) => void;
};

const initialState = {
  location: {
    loc_name: '',
    mainloc: '',
    subloc: '',
    subsubloc: '',
    x: 0,
    y: 0,
    groups: [],
    terrainqual: '',
    terrainlevel: 0,
    description: '',
    loctype_id: -1,
    initial_project_no: null,
  },
  timeseries: {
    ts_id: 0,
    ts_name: '',
    tstype_id: 1,
    tstype_name: '',
    maalepunktskote: 0,
    mp_description: '',
    sensor_depth_m: 0,
    unit: '',
  },
  unit: {
    terminal_type: '',
    terminal_id: '',
    sensor_id: '',
    sensorinfo: '',
    calypso_id: '',
    batteriskift: '',
    startdato: '',
    slutdato: '',
    uuid: '',
    gid: -1,
  },
};

const stamdataStore = create<LocationState>()(
  devtools((set) => ({
    ...initialState,
    resetLocation: () => set({location: initialState.location}),
    resetTimeseries: () => set({timeseries: initialState.timeseries}),
    resetUnit: () => set({unit: initialState.unit}),
    setLocation: (locationData) =>
      set(
        {
          location: {
            loc_id: locationData.loc_id,
            loc_name: locationData.loc_name,
            mainloc: locationData.mainloc,
            subloc: locationData.subloc,
            subsubloc: locationData.subsubloc,
            groups: locationData.groups,
            x: locationData.x,
            y: locationData.y,
            terrainqual: locationData.terrainqual,
            terrainlevel: locationData.terrainlevel,
            description: locationData.description,
            loctype_id: locationData.loctype_id,
            initial_project_no: locationData.initial_project_no,
          },
        },
        false,
        'setLocation'
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
        'setTimeseries'
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
            gid: unitData.gid,
          },
        },
        false,
        'setUnit'
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
        'setUnitValue'
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
        'setLocationValue'
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
        'setTimeseriesValue'
      ),
  }))
);

export const parkingStore = create<{
  selectedLocId: number | null;
  setSelectedLocId: (loc_id: number | null) => void;
}>((set) => ({
  selectedLocId: null,
  setSelectedLocId: (loc_id: number | null) => set({selectedLocId: loc_id}),
}));

export {initialState, stamdataStore};
