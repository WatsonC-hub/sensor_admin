import {
  PejlingBoreholeSchemaType,
  pejlingBoreholeSchema,
  PejlingSchemaType,
  pejlingSchema,
} from '../PejlingSchema';
import {FieldErrors, useForm} from 'react-hook-form';
import PejlingForm from '../components/PejlingForm';
import {z, ZodType} from 'zod';
import PejlingBoreholeForm from '../components/PejlingBoreholeForm';
import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import useBreakpoints from '~/hooks/useBreakpoints';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import {boreholeInitialData, initialData} from '~/features/pejling/const';
import PejlingBoreholeTableMobile from '../components/tables/PejlingBoreholeTableMobile';
import PejlingBoreholeTableDesktop from '../components/tables/PejlingBoreholeTableDesktop';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import moment from 'moment';
import {zodResolver} from '@hookform/resolvers/zod';

type PejlingFormProps = {
  loctype_id: number | undefined;
  tstype_id: number | undefined;
};

const getSchemaAndForm = (loctype_id: number = -1, tstype_id: number = -1) => {
  const {isMobile} = useBreakpoints();
  let selectedSchema: ZodType<Record<string, any>> = z.object({});
  let selectedForm = PejlingForm;
  let selectedTable = null;

  switch (true) {
    case loctype_id === 9:
      selectedSchema = tstype_id === 1 ? pejlingBoreholeSchema : pejlingSchema;
      selectedForm = tstype_id === 1 ? PejlingBoreholeForm : PejlingForm;
      selectedTable =
        tstype_id === 1
          ? isMobile
            ? PejlingBoreholeTableMobile
            : PejlingBoreholeTableDesktop
          : isMobile
            ? PejlingMeasurementsTableMobile
            : PejlingMeasurementsTableDesktop;
      break;
    default:
      selectedSchema = pejlingSchema;
      selectedForm = PejlingForm;
      selectedTable = isMobile ? PejlingMeasurementsTableMobile : PejlingMeasurementsTableDesktop;
  }

  return [selectedSchema, selectedForm, selectedTable] as const;
};

const usePejlingForm = ({loctype_id, tstype_id}: PejlingFormProps) => {
  const [schema, form, table] = getSchemaAndForm(loctype_id, tstype_id);

  const {
    get: {data: mpData},
  } = useMaalepunkt();

  const getInitialData = () => {
    return loctype_id === 9 ? boreholeInitialData() : initialData();
  };

  const data = getInitialData();

  const {data: parsedData} = schema.safeParse({...data});

  const formMethods = useForm({
    /**Resolves the zodschema and then adds custom errors if present */
    resolver: async (...opts) => {
      const values = {
        ...(opts[0] as PejlingBoreholeSchemaType | PejlingSchemaType),
        useforcorrection: Number(opts[0].useforcorrection),
      };

      const mpData = opts[1]?.mpData;
      const out = await zodResolver(schema)(...opts);
      const mp = mpData?.filter((elem) => {
        if (
          moment(values.timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(values.timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });

      if (mpData && (!mp || mp.length === 0) && tstype_id === 1) {
        out.errors = {
          ...out.errors,
          timeofmeas: {
            type: 'outOfRange',
            message: 'Tidspunkt er uden for et målepunkt',
          },
        };
      }

      return out;
    },
    defaultValues: parsedData,
    mode: 'onTouched',
    context: {
      mpData: mpData,
    },
  });

  return [formMethods, form, table, getInitialData] as const;
};

export default usePejlingForm;
