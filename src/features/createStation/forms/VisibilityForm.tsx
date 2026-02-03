import React, {useEffect} from 'react';
import {z} from 'zod';
import {createTypedForm} from '~/components/formComponents/Form';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

const schema = z.object({
  requires_auth: z.boolean(),
  hide_public: z.boolean(),
});

type Form = z.infer<typeof schema>;

const Form = createTypedForm<Form>();

type VisibilityFormProps = {
  id: string;
  visibility?: Form;
  setValues: (values: Form) => void;
};

const VisibilityForm = ({id, visibility, setValues}: VisibilityFormProps) => {
  const [registerSubmitter, removeSubmitter] = useCreateStationStore((state) => [
    state.registerSubmitter,
    state.removeSubmitter,
  ]);
  const methods = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: visibility ?? {
      requires_auth: false,
      hide_public: false,
    },
  });

  const {handleSubmit} = methods;

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  return (
    <Form gridSizes={12} formMethods={methods}>
      <Form.Checkbox name="requires_auth" label="Data tilgængelighed kræver login" />
      <Form.Checkbox name="hide_public" label="Skjul i offentlige visninger" />
    </Form>
  );
};

export default VisibilityForm;
