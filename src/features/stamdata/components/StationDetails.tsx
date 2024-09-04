import {zodResolver} from '@hookform/resolvers/zod';
import {Grid, Typography} from '@mui/material';
import React from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';

import {initialContactData, initialLocationAccessData} from '~/consts';
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
  adgangsforhold: initialLocationAccessData,
  contact_info: initialContactData,
  ressourcer: [],
};

const StationDetails = ({mode, disable}: Props) => {
  const {isMobile} = useBreakpoints();
  const superUser = authStore().superUser;

  const schema = stationDetailsSchema;

  const formMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: data,
    mode: 'onTouched',
  });

  const {control} = formMethods;

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
