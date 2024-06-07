import {Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'react-toastify';

import {getCvr} from '~/features/login/api/fieldApi';
import CvrDialog from '~/features/register/components/CvrDialog';
import RegisterForm from '~/features/register/components/RegisterForm';
import {FormData} from '~/types';

export default function Register() {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAwaitDialog, setOpenAwaitDialog] = useState(false);

  const formMethods = useForm<FormData>();

  const {getValues, handleSubmit} = formMethods;

  const {
    data: cvrData,
    isSuccess,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cvr'],
    queryFn: () => getCvr(parseInt(getValues('cvr'))),
    enabled: false,
    refetchOnWindowFocus: false,
    select: (data) => {
      return {
        ...data.data.orgs[0],
        id: data.data.orgs[0].id !== null ? data.data.orgs[0].id : -1,
      };
    },
  });

  const handleOpret = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); //To avoid refreshing page on button click
    console.log('refetching');
    refetch();
    setOpenConfirmDialog(true);
  };

  useEffect(() => {
    console.log(error);
    error && toast.error('CVR ikke gyldigt');
  });

  return (
    <div className="form">
      <div
        style={{
          textAlign: 'center',
          alignSelf: 'center',
        }}
      >
        <Typography variant="h4">Opret konto</Typography>
      </div>

      <RegisterForm onSubmitHandler={handleOpret} />

      <CvrDialog
        openConfirmDialog={openConfirmDialog}
        openAwaitDialog={openAwaitDialog}
        isSuccess={isSuccess}
        cvrData={cvrData}
        handleSubmit={handleSubmit}
        setOpenConfirmDialog={setOpenConfirmDialog}
        setOpenAwaitDialog={setOpenAwaitDialog}
      />
    </div>
  );
}
