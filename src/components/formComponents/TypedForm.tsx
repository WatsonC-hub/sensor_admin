import {GridBaseProps, Grid2} from '@mui/material';
import {FieldValues, UseFormReturn, FormProvider} from 'react-hook-form';
import FormFieldset from './FormFieldset';
import {FormContext} from './const';

type Props<T extends FieldValues> = {
  formMethods: UseFormReturn<T>;
  children: React.ReactNode;
  gridSizes?: GridBaseProps['size'];
  label?: string;
};

const TypedForm = <T extends FieldValues>({
  children,
  formMethods,
  label,
  gridSizes = {mobile: 12, laptop: 6},
}: Props<T>) => {
  return (
    <FormContext.Provider value={{gridSizes}}>
      <FormProvider {...formMethods}>
        {label ? (
          <FormFieldset label={label} sx={{px: 1}}>
            <Grid2 container spacing={1}>
              {children}
            </Grid2>
          </FormFieldset>
        ) : (
          <Grid2 container spacing={1}>
            {children}
          </Grid2>
        )}
      </FormProvider>
    </FormContext.Provider>
  );
};

export default TypedForm;
