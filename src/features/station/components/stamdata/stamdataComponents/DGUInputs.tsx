import React from 'react';
import {useFormContext} from 'react-hook-form';

type Props = {
  size: number;
};

const DGUInputs = ({size}: Props) => {
  const {watch} = useFormContext();
  const loctype_id = watch('location.loctype_id');

  if (loctype_id !== 9 && size) {
    return null;
  }

  return <div>DGUInputs</div>;
};

export default DGUInputs;
