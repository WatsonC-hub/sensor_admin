import {zodResolver} from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Typography,
} from '@mui/material';
import React, {useEffect} from 'react';
import {Controller, FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

import FormInput from '~/components/formComponents/FormInput';
import {FormData} from '~/types';

interface RegisterProps {
  onSubmitHandler: (e: React.FormEvent<HTMLFormElement>) => void;
}

const RegisterSchema = z.object({
  firstName: z
    .string({required_error: 'Fornavn er påkrævet'})
    .min(2, 'Fornavn skal være længere end 2 tegn')
    .max(50, 'Fornavn må ikke være længere end 50 tegn'),
  lastName: z
    .string({required_error: 'Efternavn er påkrævet'})
    .min(2, 'Efternavn skal være længere end 2 tegn')
    .max(50, 'Efternavn må ikke være længere end 50 tegn'),
  email: z
    .string({required_error: 'Email er påkrævet'})
    .min(1, 'Email er påkrævet')
    .email('Email er ugyldig'),
  cvr: z
    .string({required_error: 'CVR er påkrævet'})
    .min(8, 'CVR skal være 8 tegn langt')
    .max(8, 'CVR skal være 8 tegn langt'),
  checkedTerms: z.literal(true, {
    errorMap: () => ({message: 'Du skal acceptere betingelserne for at oprette en konto'}),
  }),
  checkedNews: z.boolean().optional().default(false),
});

const RegisterForm = ({onSubmitHandler}: RegisterProps) => {
  const formMethods = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const {
    control,
    reset,
    formState: {errors, isSubmitSuccessful},
  } = formMethods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        cvr: '',
        checkedTerms: false,
        checkedNews: false,
      });
    }
  }, [isSubmitSuccessful]);

  return (
    <FormProvider {...formMethods}>
      <Container fixed maxWidth="sm">
        <Box component={'form'} onSubmit={onSubmitHandler} noValidate autoComplete="off">
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
            required
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
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              mb: 2,
            }}
            // disabled={!!errors}
          >
            Opret bruger
          </Button>
        </Box>
      </Container>
    </FormProvider>
  );
};

export default RegisterForm;
