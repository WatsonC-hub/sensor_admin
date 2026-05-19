import React from 'react';
import FormFieldset from '~/components/formComponents/FormFieldset';
import ControlSettingForm from '../forms/ControlSettingForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  uuid: string;
};

const ControlSettingSection = ({uuid}: Props) => {
  const [setState, control_settings] = useCreateStationStore((state) => [
    state.setState,
    state.formState.timeseries?.[uuid]?.control_settings,
  ]);

  const id = `timeseries.${uuid}.control_settings`;

  return (
    <FormFieldset label="Kontrolhyppighed" sx={{width: '100%', p: 1}}>
      <ControlSettingForm
        id={id}
        values={control_settings}
        setValues={(value) => setState(`timeseries.${uuid}.control_settings`, value)}
      />
    </FormFieldset>
  );
};

export default ControlSettingSection;
