import {MenuItem, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {ChangeEvent, useEffect} from 'react';
import {useFormContext, Controller} from 'react-hook-form';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {useUser} from '~/features/auth/useUser';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import LocationProjects from '~/features/stamdata/components/stamdata/LocationProjects';
import {
  BoreholeAddLocation,
  BoreholeEditLocation,
  DefaultAddLocation,
  DefaultEditLocation,
  dynamicSchemaType,
} from '../../schema';
import {getDTMQuota} from '~/pages/field/fieldAPI';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '~/components/Autocomplete';
import {Borehole, useSearchBorehole} from '../../api/useBorehole';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {utm} from '~/features/map/mapConsts';
import {useAtom} from 'jotai';
import {boreholeSearchAtom} from '~/state/atoms';

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
  const {setValue, watch} = useFormContext<
    DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
  >();

  const x = watch('x');
  const y = watch('y');
  const terrainqual = watch('terrainqual', '');
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
      setValue('terrainlevel', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)));
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

const LoctypeSelect = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
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

const X = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
  const {watch} = useFormContext<
    DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
  >();
  const {refetchDTM} = React.useContext(LocationContext);
  const watchTerrainqual = watch('terrainqual', '');

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

const Y = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
  const {watch} = useFormContext<
    DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
  >();
  const {refetchDTM} = React.useContext(LocationContext);
  const watchTerrainqual = watch('terrainqual', '');

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

const TerrainQuote = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
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

const TerrainQuality = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
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

const Locname = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
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

const boreholeno = (props: Partial<AutoCompleteFieldProps<Borehole>>) => {
  const {setValue, reset, control} = useFormContext<BoreholeAddLocation | BoreholeEditLocation>();
  const [search, setSearch] = useAtom(boreholeSearchAtom);
  const deboundedSearch = useDebouncedValue(search, 500);

  const {data, isFetched} = useSearchBorehole(deboundedSearch);

  return (
    <Controller
      name="boreholeno"
      control={control}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <ExtendedAutocomplete<Borehole>
          {...props}
          options={data ?? []}
          labelKey="boreholeno"
          loading={isFetched}
          onChange={(option) => {
            if (option == null) {
              onChange(null);
              reset({loctype_id: 9});
              return;
            }
            if ('boreholeno' in option) {
              // @ts-expect-error error in type definition
              const latlng = utm.convertLatLngToUtm(option.latitude, option.longitude, 32);
              onChange(option.boreholeno);
              setValue('x', parseFloat(latlng.Easting.toFixed(1)));
              setValue('y', parseFloat(latlng.Northing.toFixed(1)));
            }
          }}
          error={error?.message}
          selectValue={data?.find((borehole) => borehole.boreholeno === value) ?? null}
          // filterOptions={(options) => {
          //   return options;
          // }}
          filterOptions={(options, params) => {
            const {inputValue} = params;

            const filter = options.filter((option) => option.boreholeno?.includes(inputValue));

            return filter;
          }}
          inputValue={search}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.boreholeno}>
                <Typography>{option.boreholeno}</Typography>
              </li>
            );
          }}
          textFieldsProps={{
            label: 'DGU nummer',
            placeholder: 'Søg efter DGU boringer...',
          }}
          onInputChange={(event, value) => {
            setSearch(value);
          }}
        />
      )}
    />
  );
};

const boreholeSuffix = (
  props: Omit<FormInputProps<BoreholeAddLocation | BoreholeEditLocation>, 'name'>
) => {
  return <FormInput name="suffix" label="Suffiks" placeholder="f.eks. A" fullWidth {...props} />;
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

const InitialProjectNo = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
  const user = useUser();
  const {control} = useFormContext<
    DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
  >();

  return (
    <Controller
      name="initial_project_no"
      control={control}
      render={({field: {onChange, value, onBlur}, fieldState: {error}}) => (
        <LocationProjects
          {...props}
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
    />
  );
};

const Description = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
  return (
    <FormInput
      name="description"
      label="Beskrivelse"
      placeholder="f.eks. Engsø ved Aarhus"
      fullWidth
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
StamdataLocation.Description = Description;
StamdataLocation.Boreholeno = boreholeno;
StamdataLocation.BoreholeSuffix = boreholeSuffix;

export default StamdataLocation;
