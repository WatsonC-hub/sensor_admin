import {GridBaseProps, Grid2} from '@mui/material';
import {FieldValues, UseFormReturn, FormProvider} from 'react-hook-form';
import FormFieldset from './FormFieldset';
import {FormContext} from './const';
import React from 'react';

type Props<T extends FieldValues, S extends Record<string, any> = T> = {
  formMethods: UseFormReturn<T, unknown, S>;
  children: React.ReactNode;
  useGrid?: boolean;
  gridSizes?: GridBaseProps['size'];
  label?: string;
};

const Wrapper = ({children, wrap}: {children: React.ReactNode; wrap: boolean}) => {
  return wrap ? (
    <Grid2 container size={12} spacing={1}>
      {children}
    </Grid2>
  ) : (
    <>{children}</>
  );
};

const TypedForm = <T extends FieldValues, S extends Record<string, any> = T>({
  children,
  formMethods,
  label,
  gridSizes = {mobile: 12, laptop: 6},
  useGrid = true,
}: Props<T, S>) => {
  return (
    <FormContext.Provider value={{gridSizes}}>
      <FormProvider {...formMethods}>
        {label ? (
          <FormFieldset label={label} sx={{px: 1}}>
            <Wrapper wrap={useGrid}>{children}</Wrapper>
          </FormFieldset>
        ) : (
          <Wrapper wrap={useGrid}>{children}</Wrapper>
        )}
      </FormProvider>
    </FormContext.Provider>
  );
};

export default TypedForm;
