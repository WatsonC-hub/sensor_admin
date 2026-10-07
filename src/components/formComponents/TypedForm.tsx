import {Grid} from '@mui/material';
import React, {useMemo} from 'react';
import {FormProvider} from 'react-hook-form';

import {FormContext} from './const';
import FormFieldset from './FormFieldset';

import type {GridBaseProps} from '@mui/material';
import type {FieldValues, UseFormReturn} from 'react-hook-form';

type Props<T extends FieldValues, S extends Record<string, any> = T> = {
  formMethods: UseFormReturn<T, unknown, S>;
  children: React.ReactNode;
  useGrid?: boolean;
  gridSizes?: GridBaseProps['size'];
  label?: string;
};

const DEFAULT_GRID_SIZES: GridBaseProps['size'] = {mobile: 12, laptop: 6};

const Wrapper = ({children, wrap}: {children: React.ReactNode; wrap: boolean}) => {
  return wrap ? (
    <Grid container size={12} spacing={1}>
      {children}
    </Grid>
  ) : (
    <>{children}</>
  );
};

const TypedForm = <T extends FieldValues, S extends Record<string, any> = T>({
  children,
  formMethods,
  label,
  gridSizes = DEFAULT_GRID_SIZES,
  useGrid = true,
}: Props<T, S>) => {
  const contextValue = useMemo(() => ({gridSizes}), [gridSizes]);

  return (
    <FormContext.Provider value={contextValue}>
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
