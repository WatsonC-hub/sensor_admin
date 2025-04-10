import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import React, {useEffect} from 'react';
import {FormProvider, useForm, useFormContext, UseFormReturn} from 'react-hook-form';
import Button from '~/components/Button';
import {
  defaultSchema,
  DGUSchema,
  dynamicSchemaType,
  mutualPropertiesSchema,
} from '~/features/station/schema';

type StamdataFormProps = {
  onSubmit: (data: dynamicSchemaType, formMethods: UseFormReturn<dynamicSchemaType>) => void;
  defaultValues?: Partial<dynamicSchemaType>;
  children?: React.ReactNode;
  onError?: (error: any) => void;
};

const StamdataFormContext = React.createContext(
  {} as {
    onSubmit: (data: dynamicSchemaType) => void;
    onError?: (error: any) => void;
  }
);

const StamdataForm = ({
  onSubmit,
  children,
  defaultValues,
  onError = (error) => console.log(error),
}: StamdataFormProps) => {
  const formMethods = useForm<dynamicSchemaType>({
    resolver: (...opts) => {
      const loctype_id = opts[0].location.loctype_id;
      if (loctype_id !== -1 && loctype_id !== 9) {
        return zodResolver(mutualPropertiesSchema)(...opts);
      }

      if (loctype_id == 9) {
        return zodResolver(DGUSchema)(...opts);
      }
      return zodResolver(defaultSchema)(...opts);
    },
    defaultValues: defaultValues,
    mode: 'onChange',
  });
  const {
    reset,
    formState: {errors},
  } = formMethods;

  console.log('StamdataForm errors', errors);

  const handleSubmit = (data: dynamicSchemaType) => {
    onSubmit(data, formMethods);
  };

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  return (
    <StamdataFormContext.Provider value={{onSubmit: handleSubmit, onError}}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </StamdataFormContext.Provider>
  );
};

const StamdataCancelButton = () => {
  const {reset, watch} = useFormContext<dynamicSchemaType>();
  const loctype_id = watch('location.loctype_id');
  const handleCancel = () => {
    reset();
  };

  return (
    <Button bttype="tertiary" fullWidth={false} disabled={loctype_id === -1} onClick={handleCancel}>
      Annuller
    </Button>
  );
};

const StamdataSubmitButton = () => {
  const {handleSubmit, watch} = useFormContext<dynamicSchemaType>();
  const {onSubmit, onError} = React.useContext(StamdataFormContext);
  const loctype_id = watch('location.loctype_id');

  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={<Save />}
      disabled={loctype_id === -1}
      onClick={handleSubmit(onSubmit, onError)}
    >
      Gem
    </Button>
  );
};

StamdataForm.SubmitButton = StamdataSubmitButton;
StamdataForm.CancelButton = StamdataCancelButton;

export default StamdataForm;
