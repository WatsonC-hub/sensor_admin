import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import {boreholeInitialData, initialData} from '~/features/pejling/const';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {getCorrectionMode, SCALE_CORRECTION_PICK_ON_GRAPH_VALUE} from '../correctionMode';
import dayjs from 'dayjs';
import {PejlingItem} from '~/types';

import PejlingBoreholeForm from '../components/PejlingBoreholeForm';
import PejlingForm from '../components/PejlingForm';
import PejlingBoreholeTableDesktop from '../components/tables/PejlingBoreholeTableDesktop';
import PejlingBoreholeTableMobile from '../components/tables/PejlingBoreholeTableMobile';
import {pejlingBoreholeSchema, pejlingSchema} from '../pejlingSchema';

import type {PejlingBoreholeSchemaType, PejlingSchemaType} from '../pejlingSchema';
import type {ZodObject, ZodType} from 'zod';

type PejlingFormProps = {
  loctype_id: number | undefined;
  tstype_id: number | undefined;
  correction_type: 'scale' | 'translation' | null | undefined;
  calculate_function?: string | null;
  calculated?: boolean;
  measurements?: PejlingItem[];
  gid?: number;
};

const getSchemaAndForm = (loctype_id = -1, tstype_id = -1) => {
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

  return [selectedSchema as ZodObject<Record<string, any>>, selectedForm, selectedTable] as const;
};

const usePejlingForm = ({
  loctype_id,
  tstype_id,
  correction_type,
  calculate_function,
  calculated,
  measurements,
  gid,
}: PejlingFormProps) => {
  const [schema, form, table] = getSchemaAndForm(loctype_id, tstype_id);
  const {ts_id} = useAppContext(['ts_id']);
  const correctionMode = getCorrectionMode({
    correction_type,
    isFlow: tstype_id === 2,
    calculate_function,
    calculated,
  });
  const requiresCorrectionDate = correctionMode === 'scale' || correctionMode === 'translation';

  const {
    get: {data: mpData},
  } = useMaalepunkt(ts_id);

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
      const otherMeasurements = (opts[1]?.measurements as PejlingItem[] | undefined)?.filter(
        (measurement) => measurement.gid !== opts[1]?.gid
      );
      const out = await zodResolver(schema)(...opts);

      if (values.timeofmeas === null) {
        return out;
      }

      const mp = mpData?.some((elem) => {
        if (values.timeofmeas.isSameOrAfter(elem.startdate)) {
          return true;
        }
      });

      console.log('mp', mp, 'values.timeofmeas', values.timeofmeas, 'mpData', mpData);

      if (!mp && tstype_id === 1 && values.timeofmeas != null) {
        out.errors.timeofmeas = {
          type: 'outOfRange',
          message: 'Tidspunkt er uden for et målepunkt',
        };
      }

      if (requiresCorrectionDate && values.useforcorrection === SCALE_CORRECTION_PICK_ON_GRAPH_VALUE) {
        const previousCorrection = otherMeasurements
          ?.filter(
            (measurement) =>
              measurement.useforcorrection > 0 &&
              dayjs(measurement.timeofmeas).isBefore(values.timeofmeas)
          )
          .sort((a, b) => dayjs(b.timeofmeas).diff(dayjs(a.timeofmeas)))[0];

        if (!values.correction_date) {
          out.errors = {
            ...out.errors,
            correction_date: {
              type: 'required',
              message: 'Vælg en dato at korrigere fra',
            },
          };
        } else if (values.correction_date.isAfter(values.timeofmeas)) {
          out.errors = {
            ...out.errors,
            correction_date: {
              type: 'maxDate',
              message: 'Dato kan ikke være efter kontroltidspunktet',
            },
          };
        } else if (
          previousCorrection &&
          values.correction_date.isBefore(dayjs(previousCorrection.timeofmeas))
        ) {
          out.errors = {
            ...out.errors,
            correction_date: {
              type: 'minDate',
              message: 'Dato kan ikke være før forrige korrigerede kontrol',
            },
          };
        }
      }

      if (values.useforcorrection > 0) {
        const conflictingFutureCorrection = otherMeasurements?.find(
          (measurement) =>
            measurement.useforcorrection === SCALE_CORRECTION_PICK_ON_GRAPH_VALUE &&
            measurement.correction_date &&
            dayjs(measurement.timeofmeas).isAfter(values.timeofmeas) &&
            dayjs(measurement.correction_date).isBefore(values.timeofmeas)
        );

        if (conflictingFutureCorrection) {
          out.errors = {
            ...out.errors,
            useforcorrection: {
              type: 'futureCorrectionConflict',
              message: 'En senere korrektion går tilbage til en dato før dette tidspunkt',
            },
          };
        }
      }

      return out;
    },
    defaultValues: parsedData,
    mode: 'onTouched',
    context: {
      mpData,
      measurements,
      gid,
    },
  });

  return [formMethods, form, table, getInitialData, schema] as const;
};

export default usePejlingForm;

