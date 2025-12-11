import StamdataUnit from '../StamdataUnit';

type DefaultUnitFormProps = {
  onValidate?: (sensortypeList: Array<number>) => void;
};

const DefaultUnitForm = ({onValidate}: DefaultUnitFormProps) => {
  return <StamdataUnit.Unit onValidate={onValidate} />;
};

export default DefaultUnitForm;
