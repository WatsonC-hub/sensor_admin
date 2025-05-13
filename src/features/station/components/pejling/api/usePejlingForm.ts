import {
  PejlingBoreholeSchemaType,
  pejlingBoreholeSchema,
  PejlingSchemaType,
  pejlingSchema,
} from '../PejlingSchema';
import {useForm} from 'react-hook-form';
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
    resolver: (...opts) => {
      const values = {
        ...(opts[0] as PejlingBoreholeSchemaType | PejlingSchemaType),
        useforcorrection: Number(opts[0].useforcorrection),
      };

      const mpData = opts[1]?.mpData;
      const errors = {} as Record<string, {type: string; message: string}>;

      const parsed = schema.safeParse(values);

      if (!parsed.success) {
        for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
          if (messages && messages.length > 0) {
            const [message] = messages;
            if (key === 'pumpstop' && 'service' in values && values.service === true) continue;
            else errors[key] = {type: 'custom', message};
          }
        }
      }

      const mp = mpData?.filter((elem) => {
        if (
          moment(values.timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(values.timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });

      if (mpData && mp && mp.length === 0 && tstype_id === 1) {
        errors.timeofmeas = {
          type: 'outOfRange',
          message: 'Tidspunkt er uden for et målepunkt',
        };
      }

      return {
        values: parsed.success ? parsed.data : {},
        errors,
      };
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
