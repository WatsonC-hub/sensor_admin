import {MenuItem, Typography, InputAdornment, TextField} from '@mui/material';
import {RefetchOptions, useQuery} from '@tanstack/react-query';
import React, {ChangeEvent, useEffect, useState} from 'react';
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
import {Borehole} from '../../api/useBorehole';
import {utm} from '~/features/map/mapConsts';
import {postElasticSearch} from '~/pages/field/boreholeAPI';
import {useAppContext} from '~/state/contexts';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {queryClient} from '~/queryClient';

type Props = {
  children: React.ReactNode;
};

type locationType = {
  loctype_id: number;
  loctypename: string;
};

const LocationContext = React.createContext(
  {} as {
    refetchDTM: (options?: RefetchOptions | undefined) => void;
  }
);

const StamdataLocation = ({children}: Props) => {
  const {setValue, watch} = useFormContext<
    DefaultAddLocation | DefaultEditLocation | BoreholeAddLocation | BoreholeEditLocation
  >();

  const x = watch('x');
  const y = watch('y');
  const terrainqual = watch('terrainqual');
  const {
    data: DTMData,
    isSuccess,
    refetch: refetchDTM,
  } = useQuery({
    queryKey: queryKeys.dtm(),
    queryFn: () => getDTMQuota(x, y),
    refetchOnWindowFocus: false,
    enabled: x !== undefined && y !== undefined,
  });

  useEffect(() => {
    if (
      isSuccess &&
      DTMData.HentKoterRespons.data[0].kote !== null &&
      terrainqual === 'DTM' &&
      x &&
      y
    ) {
      setValue('terrainlevel', Number(DTMData.HentKoterRespons.data[0].kote.toFixed(3)), {
        shouldDirty: true,
      });
    }
  }, [DTMData, terrainqual]);

  useEffect(() => {
    if (terrainqual === 'DTM')
      queryClient.invalidateQueries({
        queryKey: ['dtm'],
      });
  }, [x, y]);

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
    queryKey: queryKeys.locationTypes(),
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
          infoText="Lokationstypen kan betyde hvilke muligheder der er for at tilføje data til lokationen. F.eks. kan DGU boringer oprettes smartere og synkroniseres til GEUS."
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
  const watchTerrainqual = watch('terrainqual');

  return (
    <FormInput
      name="x"
      label="X [UTM32]"
      type="number"
      required
      placeholder="Indtast X-koordinat"
      infoText="X-koordinaten er i UTM32 koordinatsystemet. For Danmark er det mellem 400000 og 900000."
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
  const watchTerrainqual = watch('terrainqual');

  return (
    <FormInput
      name="y"
      label="Y [UTM32]"
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
      slotProps={{
        select: {
          displayEmpty: true,
        },
      }}
      onChangeCallback={(e) => {
        if ((e as ChangeEvent<HTMLTextAreaElement>).target.value === 'DTM') {
          refetchDTM();
        }
      }}
      {...props}
    >
      <MenuItem value="dGPS" key="dGPS">
        dGPS
      </MenuItem>
      <MenuItem value="DTM" key="DTM">
        DTM
      </MenuItem>
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
  const {
    setValue,
    control,
    formState: {errors},
    watch,
    trigger,
  } = useFormContext<BoreholeAddLocation | BoreholeEditLocation>();
  const [selectedBorehole, setSelectedBorehole] = useState<Borehole | null>(null);
  const [search, setSearch] = useState<string>('');
  const [filteredOptions, setFilteredOptions] = React.useState<Borehole[]>([]);
  const loctype_id = watch('loctype_id', 9);

  return (
    <Controller
      name="boreholeno"
      control={control}
      render={({field: {onChange}}) => {
        return (
          <>
            {loctype_id === 9 && (
              <ExtendedAutocomplete<Borehole>
                {...props}
                options={filteredOptions ?? []}
                labelKey="boreholeno"
                onChange={async (option) => {
                  if (option == null) {
                    onChange(null);
                    setSelectedBorehole(null);
                    trigger('boreholeno');
                    return;
                  }
                  if ('boreholeno' in option) {
                    onChange(option.boreholeno);
                    setSelectedBorehole(option);
                    // @ts-expect-error error in type definition
                    const latlng = utm.convertLatLngToUtm(option.latitude, option.longitude, 32);
                    setValue('x', parseFloat(latlng.Easting.toFixed(1)), {shouldValidate: true});
                    setValue('y', parseFloat(latlng.Northing.toFixed(1)), {shouldValidate: true});
                    trigger('boreholeno');
                  }
                }}
                error={errors.boreholeno?.message}
                selectValue={selectedBorehole}
                filterOptions={(options, params) => {
                  const {inputValue} = params;
                  const filter = options.filter((option) =>
                    option.boreholeno?.includes(inputValue)
                  );

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
                  required: true,
                }}
                noOptionsText={
                  search === undefined || search === ''
                    ? 'Indtast DGU nummer for at påbegynde søgning...'
                    : 'Ingen resultater'
                }
                onInputChange={(event, searchValue) => {
                  if (searchValue !== '' && loctype_id === 9) {
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
                    postElasticSearch(searchString).then((res) => {
                      setFilteredOptions(
                        res.data.hits.hits.map((hit: any) => {
                          return {
                            boreholeno: hit._source.properties.boreholeno,
                            latitude: hit._source.geometry.coordinates[1],
                            longitude: hit._source.geometry.coordinates[0],
                          };
                        })
                      );
                    });
                  }
                  setSearch(searchValue);

                  return searchValue;
                }}
              />
            )}
          </>
        );
      }}
    />
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
          fieldDescriptionText={props.infoText}
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
  const {data: metadata} = useTimeseriesData();
  const unitPresent = metadata?.calculated === true;

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
