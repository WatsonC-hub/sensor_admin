import {zodResolver} from '@hookform/resolvers/zod';
import {Grid, Typography} from '@mui/material';
import React, {useCallback, useEffect} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';

import {stationDetailsSchema} from '~/helpers/zodSchemas';
import useBreakpoints from '~/hooks/useBreakpoints';
import {authStore} from '~/state/store';

import ContactInfo from './stationDetails/contacts/ContactInfo';
import LocationAccess from './stationDetails/locationAccessKeys/LocationAccess';
import Autocomplete from './stationDetails/multiselect/Autocomplete';
import TransferList from './stationDetails/multiselect/TransferList';

type Props = {
  mode: string;
  disable: boolean;
};

const data = {
  adgangsforhold: {
    navn: '',
    type: '',
    contact_id: '',
    placering: '',
    koden: '',
    kommentar: '',
  },
  contact_info: {
    navn: '',
    telefonnummer: '',
    email: '',
    rolle: '',
    kommentar: '',
    user_id: null,
    org: '',
    relation_id: -1,
  },
};

const StationDetails = ({mode, disable}: Props) => {
  const {isMobile} = useBreakpoints();
  const superUser = authStore().superUser;

  const schema = stationDetailsSchema;
  const schemaParsed = stationDetailsSchema.safeParse({
    ...data,
    ressourcer: [],
  });

  let schemaData;
  if (schemaParsed.success) schemaData = schemaParsed.data;

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: schemaData,
    mode: 'onTouched',
  });

  const {control, reset} = formMethods;

  const handleReset = useCallback(() => {
    const result = schema.safeParse({
      ...data,
    });
    if (result.success) reset(result.data);
  }, [reset, schema]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  return (
    <FormProvider {...formMethods}>
      <Grid container spacing={1} my={0.5} justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={12}>
          <Typography ml={2} py={0} variant="h6">
            Adgangsinformation
          </Typography>
        </Grid>
        <Grid item xs={12} sm={12}>
          <LocationAccess />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Typography ml={2} py={0} variant="h6">
            Kontaktinformation
          </Typography>
          <ContactInfo />
        </Grid>
        {superUser && mode === 'normal' && (
          <>
            <Grid item xs={12} sm={12}>
              <Typography ml={2} py={0} variant="h6">
                Huskeliste
              </Typography>
              <Controller
                name="ressourcer"
                control={control}
                disabled={disable}
                render={
                  !isMobile
                    ? ({field: {onChange, value, onBlur}}) => (
                        <TransferList value={value} setValue={onChange} onBlur={onBlur} />
                      )
                    : ({field: {onChange, value, onBlur}}) => (
                        <Autocomplete value={value} setValue={onChange} onBlur={onBlur} />
                      )
                }
              />
            </Grid>
          </>
        )}
      </Grid>
    </FormProvider>
  );
};

export default StationDetails;
