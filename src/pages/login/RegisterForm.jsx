import {
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography,
} from '@mui/material';
import React from 'react';
import {Controller, FormProvider} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';

const RegisterForm = ({onSubmitHandler, formMethods}) => {
  const {
    control,
    formState: {errors},
  } = formMethods;

  return (
    <FormProvider {...formMethods}>
      <Container fixed maxWidth="sm">
        <FormInput
          name="firstName"
          label="Fornavn"
          required
          fullWidth
          sx={{
            mb: 2,
          }}
        />
        <FormInput
          name="lastName"
          label="Efternavn"
          required
          fullWidth
          sx={{
            mb: 2,
          }}
        />
        <FormInput
          name="email"
          label="Email"
          required
          fullWidth
          sx={{
            mb: 2,
          }}
        />
        <FormInput
          name="cvr"
          label="CVR"
          fullWidth
          sx={{
            mb: 2,
          }}
        />
        <FormGroup>
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="checkedTerms"
                render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
              />
            }
            label={
              <Typography variant="body2">
                Jeg accepterer{' '}
                <a href="https://watsonc.dk/privatlivspolitik/" target="_blank" rel="noreferrer">
                  vilkår og betingelser
                </a>
              </Typography>
            }
          />
          <FormHelperText error={!!errors['checkedTerms']}>
            {errors['checkedTerms'] ? errors['checkedTerms'].message : ''}
          </FormHelperText>
          <FormControlLabel
            control={
              <Controller
                control={control}
                name="checkedNews"
                render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
              />
            }
            label={
              <Typography variant="body2">
                Jeg vil gerne modtage mails om nyheder i Calypso
              </Typography>
            }
          />
        </FormGroup>
        <Button
          bttype="primary"
          onClick={formMethods.handleSubmit(onSubmitHandler)}
          sx={{
            mt: 2,
            mb: 2,
          }}
          // disabled={!!errors}
        >
          Opret bruger
        </Button>
      </Container>
    </FormProvider>
  );
};

export default RegisterForm;
