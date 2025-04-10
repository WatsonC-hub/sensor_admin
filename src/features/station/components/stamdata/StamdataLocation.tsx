import {MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {ChangeEvent, useEffect} from 'react';
import {useFormContext, Controller} from 'react-hook-form';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import LocationProjects from '~/features/stamdata/components/stamdata/LocationProjects';
import {dynamicSchemaType} from '../../schema';
import {getDTMQuota} from '~/pages/field/fieldAPI';

type Props = {
  children: React.ReactNode;
};

type locationType = {
  loctype_id: number;
  loctypename: string;
};

const StamdataLocationContext = React.createContext(
  {} as {
    refetchDTM: () => void;
  }
);

const StamdataLocation = ({children}: Props) => {
  const {setValue, getValues, watch} = useFormContext<dynamicSchemaType>();

  const loctype_id = watch('location.loctype_id');

  const {
    data: DTMData,
    isSuccess,
    refetch: refetchDTM,
  } = useQuery({
    queryKey: ['dtm'],
    queryFn: () => getDTMQuota(getValues('location.x'), getValues('location.y')),
    refetchOnWindowFocus: false,
    enabled:
      (!loctype_id || loctype_id !== -1) &&
      getValues('location.x') !== undefined &&
      getValues('location.y') !== undefined,
  });

  useEffect(() => {
    if (isSuccess && DTMData.HentKoterRespons.data[0].kote !== null) {
      setValue('location.terrainQuote', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)));
    }
  }, [DTMData, getValues('location.terrainQuality')]);

  return (
    <StamdataLocationContext.Provider
      value={{
        refetchDTM: refetchDTM,
      }}
    >
      {children}
    </StamdataLocationContext.Provider>
  );
};

const LoctypeSelect = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {data} = useQuery({
    queryKey: ['location_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/location_types`);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <FormInput
      name="location.loctype_id"
      label="Lokationstype"
      placeholder="Vælg type"
      select
      required
      {...props}
    >
      <MenuItem value={-1} key={-1}>
        Vælg type
      </MenuItem>
      {data?.map((item: locationType) => (
        <MenuItem value={item.loctype_id} key={item.loctype_id}>
          {item.loctypename}
        </MenuItem>
      ))}
    </FormInput>
  );
};

const XInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext<dynamicSchemaType>();
  const {refetchDTM} = React.useContext(StamdataLocationContext);
  const loctype_id = watch('location.loctype_id');
  const watchTerrainqual = watch('location.terrainQuality', '');

  return (
    <FormInput
      name="location.x"
      label="X koordinat"
      type="number"
      required
      placeholder="Indtast X-koordinat"
      disabled={loctype_id === -1}
      warning={(value) => {
        if (value < 400000 || value > 900000) {
          return 'X-koordinat er uden for Danmark';
        }
      }}
      onChangeCallback={() => {
        if (watchTerrainqual === 'DTM') {
          refetchDTM();
        }
      }}
      {...props}
    />
  );
};

const YInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext<dynamicSchemaType>();
  const {refetchDTM} = React.useContext(StamdataLocationContext);
  const loctype_id = watch('location.loctype_id');
  const watchTerrainqual = watch('location.terrainQuality', '');

  return (
    <FormInput
      name="location.y"
      label="Y koordinat"
      type="number"
      required
      placeholder="Indtast Y-koordinat"
      disabled={loctype_id === -1}
      warning={(value) => {
        if (value < 600000 || value > 9000000) {
          return 'Y-koordinat er uden for Danmark';
        }
      }}
      onChangeCallback={() => {
        if (watchTerrainqual === 'DTM') {
          refetchDTM();
        }
      }}
      {...props}
    />
  );
};

const TerrainQuoteInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext<dynamicSchemaType>();
  const loctype_id = watch('location.loctype_id');

  return (
    <FormInput
      name="location.terrainQuote"
      label="Terræn kote"
      type="number"
      required
      placeholder="Indtast terræn kote"
      disabled={loctype_id === -1}
      {...props}
    />
  );
};

const TerrainQualityInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext<dynamicSchemaType>();
  const {refetchDTM} = React.useContext(StamdataLocationContext);
  const loctype_id = watch('location.loctype_id');
  const disable = loctype_id === -1;

  return (
    <FormInput
      name="location.terrainQuality"
      label="Type af terrænkote"
      select
      fullWidth
      disabled={disable}
      onChangeCallback={(e) => {
        if ((e as ChangeEvent<HTMLTextAreaElement>).target.value === 'DTM') {
          refetchDTM();
        }
      }}
      {...props}
    >
      <MenuItem value=""> Vælg type </MenuItem>
      <MenuItem value="dGPS">dGPS</MenuItem>
      <MenuItem value="DTM">DTM</MenuItem>
    </FormInput>
  );
};

const LocnameInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext<dynamicSchemaType>();
  const loctype_id = watch('location.loctype_id');
  return (
    <FormInput
      name="location.loc_name"
      label="Lokationsnavn"
      required
      placeholder="f.eks. Engsø"
      fullWidth
      disabled={loctype_id === -1}
      {...props}
    />
  );
};

const GroupsInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {control, watch} = useFormContext();
  const loctype_id = watch('location.loctype_id');
  return (
    <Controller
      name="location.groups"
      control={control}
      render={({field: {onChange, value, onBlur}}) => (
        <LocationGroups
          value={value}
          setValue={onChange}
          onBlur={onBlur}
          disable={loctype_id === -1}
        />
      )}
      disabled={loctype_id === -1}
      {...props}
    />
  );
};

const InitialProjectNoInput = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const user = useUser();
  const {control, watch} = useFormContext();
  const loctype_id = watch('location.loctype_id');

  return (
    <Controller
      name="location.initial_project_no"
      control={control}
      render={({field: {onChange, value, onBlur}, fieldState: {error}}) => (
        <LocationProjects
          value={value}
          setValue={onChange}
          onBlur={onBlur}
          error={error}
          disable={user?.superUser === false || loctype_id === -1}
          //   disable={
          //     disable ||
          //     (getValues().unit !== undefined &&
          //       getValues('unit').unit_uuid !== '' &&
          //       getValues().unit.unit_uuid !== null &&
          //       getValues().unit.unit_uuid !== undefined)
          //   }
        />
      )}
      {...props}
    />
  );
};

StamdataLocation.LoctypeSelect = LoctypeSelect;
StamdataLocation.XInput = XInput;
StamdataLocation.YInput = YInput;
StamdataLocation.TerrainQuoteInput = TerrainQuoteInput;
StamdataLocation.TerrainQualityInput = TerrainQualityInput;
StamdataLocation.LocnameInput = LocnameInput;
StamdataLocation.GroupsInput = GroupsInput;
StamdataLocation.InitialProjectNoInput = InitialProjectNoInput;

export default StamdataLocation;
