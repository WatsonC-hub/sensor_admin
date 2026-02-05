import React, {useEffect} from 'react';
import {z} from 'zod';
import {createTypedForm} from '~/components/formComponents/Form';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

const schema = z.object({
  requires_auth: z.boolean(),
});

type Form = z.infer<typeof schema>;

const Form = createTypedForm<Form>();

type VisibilityFormProps = {
  visibility?: Form;
  setValues: (values: Form) => void;
};

const VisibilityForm = ({visibility, setValues}: VisibilityFormProps) => {
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: visibility ?? {
      requires_auth: false,
    },
  });

  const {handleSubmit} = methods;

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
      <Form.Checkbox name="requires_auth" label="Data tilgængelighed kræver login" />
    </Form>
  );
};

export default VisibilityForm;
