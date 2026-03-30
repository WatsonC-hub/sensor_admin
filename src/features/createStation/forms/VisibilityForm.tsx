import React, { useEffect } from 'react';
import { z } from 'zod';
import { createTypedForm } from '~/components/formComponents/Form';
import { useCreateStationStore } from '../state/useCreateStationStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormToggleButton from '~/components/formComponents/FormToggleButton';

const schema = z.object({
  requires_auth: z.boolean({ required_error: 'Vælg om data skal kræve login' }),
});

type VisibilityFormState = z.infer<typeof schema>;

const Form = createTypedForm<VisibilityFormState>();

type VisibilityFormProps = {
  visibility: VisibilityFormState | object;
  setValues: (values: VisibilityFormState) => void;
};

const VisibilityForm = ({ visibility, setValues }: VisibilityFormProps) => {
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);

  const methods = useForm<VisibilityFormState>({
    resolver: zodResolver(schema),
    defaultValues: visibility,
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    registerSubmitter('location.visibility', async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter('location.visibility');
  }, [handleSubmit]);

  return (
    <Form gridSizes={12} formMethods={methods}>
      <FormToggleButton<VisibilityFormState, 'requires_auth'>
        name="requires_auth"
        options={[
          { value: true, label: 'Ja' },
          { value: false, label: 'Nej' },
        ]}
        direction="row"
        size="small"
        gridSizes={12}
        toggleButtonProps={{
          sx: { px: 2 },
          size: 'small',
        }}
        gridDirection="row"
        label="Skal data kræve login?"
        warning={(value) => {
          if (value === undefined && errors.requires_auth) {
            return errors.requires_auth.message;
          }
          return '';
        }}
      />
    </Form>
  );
};

export default VisibilityForm;
