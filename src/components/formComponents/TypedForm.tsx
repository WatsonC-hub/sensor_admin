import {GridBaseProps, Grid2} from '@mui/material';
import {FieldValues, UseFormReturn, FormProvider} from 'react-hook-form';
import FormFieldset from './FormFieldset';
import {FormContext} from './const';
import React from 'react';

type Props<T extends FieldValues> = {
  formMethods: UseFormReturn<T>;
  children: React.ReactNode;
  useGrid?: boolean;
  gridSizes?: GridBaseProps['size'];
  label?: string;
};

const Wrapper = ({children, wrap}: {children: React.ReactNode; wrap: boolean}) => {
  return wrap ? (
    <Grid2 container spacing={1}>
      {children}
    </Grid2>
  ) : (
    <>{children}</>
  );
};

const TypedForm = <T extends FieldValues>({
  children,
  formMethods,
  label,
  gridSizes = {mobile: 12, laptop: 6},
  useGrid = true,
}: Props<T>) => {
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
