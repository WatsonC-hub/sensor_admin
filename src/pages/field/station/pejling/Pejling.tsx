import {Box} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {usePejling} from '~/features/api/usePejling';
import PejlingForm from '~/features/pejling/components/PejlingForm';
import PejlingMeasurements from '~/features/pejling/components/PejlingMeasurements';
import {stamdataStore} from '~/state/store';
import {PejlingItem} from '~/types';

type Props = {
  ts_id: number;
  showForm: boolean;
  setShowForm: (showForm: boolean | null) => void;
  setDynamic: (dynamic: Array<unknown>) => void;
};

const Pejling = ({ts_id, showForm, setShowForm, setDynamic}: Props) => {
  const store = stamdataStore();
  const [canEdit] = useState(true);
  const isWaterlevel = store.timeseries?.tstype_id === 1;
  const isFlow = store.timeseries?.tstype_id === 2;

  const {post: postPejling, put: putPejling, del: delPejling} = usePejling();

  const initialData = {
    gid: -1,
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  };
  const formMethods = useForm({
    defaultValues: {
      ...initialData,
    },
  });

  const handlePejlingSubmit = (values: PejlingItem) => {
    console.log(values);
    const payload = {
      data: {
        ...values,
        isWaterlevel: isWaterlevel,
        stationid: ts_id,
      },
      path: values.gid === -1 ? `${ts_id}` : `${ts_id}/${values.gid}`,
    };
    payload.data.timeofmeas = moment(payload.data.timeofmeas).toISOString();

    if (values.gid === -1) postPejling.mutate(payload);
    else putPejling.mutate(payload);
    setShowForm(null);
  };

  const handleEdit = (data: PejlingItem) => {
    data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
    formMethods.reset(data);
    setShowForm(true);
  };

  const handleDelete = (gid: number | undefined) => {
    const payload = {
      path: `${ts_id}/${gid}`,
    };
    delPejling.mutate(payload);
  };

  const openAddMP = () => {
    setShowForm(true);
  };

  const resetFormData = () => {
    formMethods.reset(initialData);
    setShowForm(null);
  };

  useEffect(() => {
    if (showForm && formMethods.getValues('gid') === -1) formMethods.reset(initialData);
  }, [showForm]);

  return (
    <FormProvider {...formMethods}>
      <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
        {showForm === true && (
          <PejlingForm
            isWaterlevel={isWaterlevel}
            openAddMP={openAddMP}
            handleSubmit={handlePejlingSubmit}
            resetFormData={resetFormData}
            isFlow={isFlow}
            formMethods={formMethods}
            setDynamic={setDynamic}
          />
        )}
        <PejlingMeasurements
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          canEdit={canEdit}
        />
      </Box>
    </FormProvider>
  );
};

export default Pejling;
