import React from 'react';
import WatlevmpForm from '../forms/WatlevmpForm';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  index: string;
};

const WatlevmpSection = ({index}: Props) => {
  const [intakeno, watlevmp, setState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index]?.meta?.intakeno,
    state.formState.timeseries?.[index]?.watlevmp,
    state.setState,
  ]);

  const id = `timeseries.${index}.watlevmp`;

  return (
    <FormFieldset label="Målepunkt" sx={{width: '100%', px: 1, py: 1}}>
      <WatlevmpForm
        id={id}
        intakeno={intakeno}
        values={watlevmp}
        setValues={(values) => setState(`timeseries.${index}.watlevmp`, values)}
      />
    </FormFieldset>
  );
};

export default WatlevmpSection;
