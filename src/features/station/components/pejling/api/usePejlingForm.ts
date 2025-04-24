import {pejlingBoreholeSchema, PejlingItem, pejlingSchema} from '../PejlingSchema';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import PejlingForm from '../components/PejlingForm';
import {ZodType} from 'zod';
import PejlingBoreholeForm from '../components/PejlingBoreholeForm';
import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import useBreakpoints from '~/hooks/useBreakpoints';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import BoreholeTableDesktop from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import BoreholeTableMobile from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableMobile';
import {boreholeInitialData, initialData} from '~/features/pejling/const';

type PejlingFormProps = {
  loctype_id?: number;
};

const getSchemaAndForm = (loctype_id: number) => {
  const {isMobile} = useBreakpoints();
  let selectedSchema: ZodType<Record<string, any>> = pejlingSchema;
  let selectedForm = PejlingForm;
  let selectedTable = null;

  switch (true) {
    case loctype_id === 9:
      selectedSchema = pejlingBoreholeSchema;
      selectedForm = PejlingBoreholeForm;
      selectedTable = isMobile ? BoreholeTableMobile : BoreholeTableDesktop;
      break;
    default:
      selectedTable = isMobile ? PejlingMeasurementsTableMobile : PejlingMeasurementsTableDesktop;
  }

  return [selectedSchema, selectedForm, selectedTable] as const;
};

const usePejlingForm = ({loctype_id = -1}: PejlingFormProps) => {
  const [schema, form, table] = getSchemaAndForm(loctype_id);

  const formMethods = useForm<PejlingItem>({
    resolver: zodResolver(schema),
    defaultValues: loctype_id === 9 ? boreholeInitialData : initialData,
    mode: 'onTouched',
  });

  return [formMethods, form, table] as const;
};

export default usePejlingForm;
