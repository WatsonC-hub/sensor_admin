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

const LocationContext = React.createContext(
  {} as {
    refetchDTM: () => void;
  }
);

const StamdataLocation = ({children}: Props) => {
  const {setValue, watch} = useFormContext();

  const x = watch('x');
  const y = watch('y');
  const terrainqual = watch('terrainQuality', '');
  const {
    data: DTMData,
    isSuccess,
    refetch: refetchDTM,
  } = useQuery({
    queryKey: ['dtm'],
    queryFn: () => getDTMQuota(x, y),
    refetchOnWindowFocus: false,
    enabled: x !== undefined && y !== undefined,
  });

  useEffect(() => {
    if (isSuccess && DTMData.HentKoterRespons.data[0].kote !== null) {
      setValue('terrainQuote', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)));
    }
  }, [DTMData, terrainqual]);

  return (
    <LocationContext.Provider
      value={{
        refetchDTM,
      }}
    >
      {children}
    </LocationContext.Provider>
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
      name="loctype_id"
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

const X = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext();
  const {refetchDTM} = React.useContext(LocationContext);
  const watchTerrainqual = watch('terrainQuality', '');

  return (
    <FormInput
      name="x"
      label="X koordinat"
      type="number"
      required
      placeholder="Indtast X-koordinat"
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

const Y = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {watch} = useFormContext();
  const {refetchDTM} = React.useContext(LocationContext);
  const watchTerrainqual = watch('terrainQuality', '');

  return (
    <FormInput
      name="y"
      label="Y koordinat"
      type="number"
      required
      placeholder="Indtast Y-koordinat"
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

const TerrainQuote = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  return (
    <FormInput
      name="terrainlevel"
      label="Terræn kote"
      type="number"
      required
      placeholder="Indtast terræn kote"
      {...props}
    />
  );
};

const TerrainQuality = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {refetchDTM} = React.useContext(LocationContext);

  return (
    <FormInput
      name="terrainqual"
      label="Type af terrænkote"
      select
      fullWidth
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

const Locname = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  return (
    <FormInput
      name="loc_name"
      label="Lokationsnavn"
      required
      placeholder="f.eks. Engsø"
      fullWidth
      {...props}
    />
  );
};

const Groups = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {control} = useFormContext();
  return (
    <Controller
      name="groups"
      control={control}
      render={({field: {onChange, value, onBlur}}) => (
        <LocationGroups
          value={value}
          setValue={onChange}
          onBlur={onBlur}
          disable={props.disabled}
        />
      )}
      {...props}
    />
  );
};

const InitialProjectNo = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const user = useUser();
  const {control} = useFormContext();

  return (
    <Controller
      name="initial_project_no"
      control={control}
      render={({field: {onChange, value, onBlur}, fieldState: {error}}) => (
        <LocationProjects
          value={value}
          setValue={onChange}
          onBlur={onBlur}
          error={error}
          disable={user?.superUser === false || props.disabled}
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
StamdataLocation.X = X;
StamdataLocation.Y = Y;
StamdataLocation.TerrainQuote = TerrainQuote;
StamdataLocation.TerrainQuality = TerrainQuality;
StamdataLocation.Locname = Locname;
StamdataLocation.Groups = Groups;
StamdataLocation.InitialProjectNo = InitialProjectNo;

export default StamdataLocation;
