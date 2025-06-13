import {MenuItem, Typography, InputAdornment, TextField} from '@mui/material';
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
} from '../../schema';
import {getDTMQuota} from '~/pages/field/fieldAPI';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '~/components/Autocomplete';
import {Borehole, useSearchBorehole} from '../../api/useBorehole';
import {utm} from '~/features/map/mapConsts';
import {useAtom} from 'jotai';
import {boreholeSearchAtom} from '~/state/atoms';
import {postElasticSearch} from '~/pages/field/boreholeAPI';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import {stationPages} from '~/helpers/EnumHelper';

import {useAppContext} from '~/state/contexts';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';

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
    enabled: x !== undefined && y !== undefined && terrainqual === 'DTM',
  });

  useEffect(() => {
    if (isSuccess && DTMData.HentKoterRespons.data[0].kote !== null && terrainqual === 'DTM') {
      setValue('terrainlevel', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)), {
        shouldDirty: true,
      });
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
    <>
      {data && (
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
      )}
    </>
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
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Typography>m</Typography>
            </InputAdornment>
          ),
        },
      }}
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

const Boreholeno = (props: Partial<AutoCompleteFieldProps<Borehole>>) => {
  const [pageToShow] = useStationPages();
  const {
    setValue,
    formState: {errors},
    watch,
    trigger,
  } = useFormContext<BoreholeAddLocation | BoreholeEditLocation>();
  const [search, setSearch] = useAtom(boreholeSearchAtom);
  const [filteredOptions, setFilteredOptions] = React.useState<Borehole[]>([]);
  const loctype_id = watch('loctype_id', 9);
  const boreholeno = watch('boreholeno');

  const {data: searchOptions, isFetching} = useSearchBorehole(boreholeno);

  useEffect(() => {
    if (
      boreholeno !== undefined &&
      searchOptions &&
      searchOptions.length > 0 &&
      pageToShow !== stationPages.GENERELTLOKATION
    ) {
      const borehole = searchOptions?.find((opt) => opt.boreholeno === boreholeno);
      // @ts-expect-error error in type definition
      const latlng = utm.convertLatLngToUtm(borehole?.latitude, borehole?.longitude, 32);

      setValue('x', parseFloat(latlng.Easting.toFixed(1)));
      setValue('y', parseFloat(latlng.Northing.toFixed(1)));
      trigger('x');
      trigger('y');
    }
  }, [searchOptions]);

  return (
    <>
      {loctype_id && (
        <ExtendedAutocomplete<Borehole>
          {...props}
          options={filteredOptions ?? []}
          loading={isFetching}
          labelKey="boreholeno"
          onChange={(option) => {
            console.log(option);
            if (option == null) {
              setValue('boreholeno', undefined);
              trigger('boreholeno');
              return;
            }
            if ('boreholeno' in option) {
              setValue('boreholeno', option.boreholeno, {shouldDirty: true});
              trigger('boreholeno');
            }
          }}
          error={errors.boreholeno?.message}
          selectValue={boreholeno !== undefined ? ({boreholeno: boreholeno} as Borehole) : null}
          // selectValue={boreholeno !== undefined ? ({boreholeno: boreholeno} as Borehole) : null}
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
          onInputChange={(event, searchValue) => {
            const searchString = {
              query: {
                bool: {
                  must: {
                    query_string: {
                      query: searchValue,
                    },
                  },
                },
              },
            };

            if (searchValue !== '' && loctype_id)
              postElasticSearch(searchString).then((res) => {
                setFilteredOptions(
                  res.data.hits.hits.map((hit: any) => {
                    return {
                      boreholeno: hit._source.properties.boreholeno,
                    };
                  })
                );
              });
            if (searchValue === '' && loctype_id) {
              setValue('boreholeno', undefined);
            }
            setSearch(searchValue);
          }}
        />
      )}
    </>
  );
};

const BoreholeSuffix = (
  props: Omit<FormInputProps<BoreholeAddLocation | BoreholeEditLocation>, 'name' | 'label'>
) => {
  const {getValues} = useFormContext<BoreholeAddLocation | BoreholeEditLocation>();
  const boreholeno = getValues('boreholeno');
  return (
    <FormInput
      name="suffix"
      label="Lokationsnavn"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              {boreholeno !== undefined && boreholeno + ' - '}
            </InputAdornment>
          ),
        },
      }}
      placeholder="f.eks. A"
      fullWidth
      {...props}
    />
  );
};

const Groups = (
  props: Omit<
    FormInputProps<
      DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
    >,
    'name'
  >
) => {
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
  const {data: units} = useUnitHistory();
  const unitPresent = units && units.length > 0 ? true : false;

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
          disable={user?.superUser === false || props.disabled || unitPresent}
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

const LocationID = () => {
  const {loc_id} = useAppContext(['loc_id']);
  return (
    <TextField
      value={loc_id}
      disabled
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      label="Lokations ID"
      sx={{
        pb: 0.6,
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: '#000000',
        },
        '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
        '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
        '& .MuiOutlinedInput-root': {
          '& > fieldset': {borderColor: 'primary.main'},
        },
        '.MuiFormHelperText-root': {
          position: 'absolute',
          top: 'calc(100% - 8px)',
        },
      }}
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
StamdataLocation.Boreholeno = Boreholeno;
StamdataLocation.BoreholeSuffix = BoreholeSuffix;
StamdataLocation.LocationID = LocationID;

export default StamdataLocation;
