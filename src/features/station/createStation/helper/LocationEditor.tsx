import React from 'react';
import {LocationManager} from '../controller/LocationManager';
import LocationForm from '../forms/LocationForm';

type Props = {
  manager: LocationManager | undefined;
};

const LocationEditor = ({manager}: Props) => {
  const controller = manager?.get()?.getController();

  return (
    <LocationForm
      controller={controller}
      onValidChange={(isValid, value) => {
        controller?.updateSlice('meta', isValid, value);
      }}
    />
  );
};

export default LocationEditor;
