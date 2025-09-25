import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
// import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, Tooltip, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import {parseAsString, useQueryState} from 'nuqs';
import React, {useEffect} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';
import {qaSelection} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';

import {useCertifyQa} from '../api/useCertifyQa';
import {zodDayjs} from '~/helpers/schemas';
import dayjs from 'dayjs';
import FormDateTime from '~/components/FormDateTime';

interface WizardConfirmTimeseriesProps {
  initiateConfirmTimeseries: boolean;
  onClose: () => void;
}

const schema = z
  .object({
    id: z.number().optional(),
    startDate: zodDayjs().optional(),
    date: zodDayjs('Dato er påkrævet'),
    level: z.number(),
    // comment: z.string().optional(),
  })
  .refine(
    ({date, startDate}) => {
      console.log(date, startDate);
      return (!startDate && !date) || (startDate && startDate.isBefore(date));
    },
    {path: ['date'], message: 'Dato må ikke være tidligere end sidst godkendt'}
  );

type CertifyQaValues = z.infer<typeof schema>;

const WizardConfirmTimeseries = ({
  initiateConfirmTimeseries,
  onClose,
}: WizardConfirmTimeseriesProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  // const [qaStamp, setQaStamp] = useState<number | undefined>(undefined);
  const {isMobile} = useBreakpoints();
  const selection = useAtomValue(qaSelection);

  const {
    get: {data: qaData},
    post: postQaData,
  } = useCertifyQa();

  // const [selectedQaData, setSelectedQaData] = useState<CertifyQa | undefined>();
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const x = dayjs(selection?.points?.[0].x);
  const {data: parsedData, error} = schema.safeParse({
    startDate: qaData?.[0]?.date,
    date: x,
    level: 1,
  });
  console.log(parsedData, error);

  const formMethods = useForm<CertifyQaValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: qaData?.[0]?.date ? dayjs(qaData[0].date) : undefined,
      date: x,
      level: 1,
      id: qaData?.[0]?.id,
      // comment: qaData?.[0]?.comment,
    },
    mode: 'onTouched',
    values: parsedData,
  });

  const {watch, handleSubmit, setValue} = formMethods;

  const enddateWatch = watch('date');

  useEffect(() => {
    if (selection.points && selection.points.length > 0) {
      const x = dayjs(selection.points[0].x);
      if (x) setValue('date', x);
    }
  }, [selection]);

  const handleSave: SubmitHandler<CertifyQaValues> = async (certifyQa) => {
    const payload = {
      path: `${ts_id}`,
      data: {...certifyQa, date: certifyQa.date},
    };
    postQaData.mutateAsync(payload);
    setDataAdjustment(null);
    onClose();
  };
  return (
    <FormProvider {...formMethods}>
      <Box alignSelf={'center'} justifySelf={'center'}>
        <Box display={'flex'} flexDirection="row" justifyContent={'center'} mb={1} gap={1}>
          <Typography
            alignSelf={'center'}
            variant={isMobile ? 'h6' : 'h5'}
            component="h2"
            fontWeight={'bold'}
          >
            Godkend tidsserie
          </Typography>
          <Tooltip
            placement="right"
            enterTouchDelay={0}
            slotProps={{
              tooltip: {sx: {bgcolor: 'primary.main'}},
              arrow: {sx: {color: 'primary.main'}},
            }}
            arrow={true}
            title={
              <p>
                Markér et punkt på grafen som du gerne vil godkende tidsserien frem til. Datoen vil
                blive brugt som tidsstempel for hvornår tidsserien sidst er blevet godkendt
              </p>
            }
            sx={{alignSelf: 'center'}}
          >
            <InfoOutlinedIcon color="info" />
          </Tooltip>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          alignItems={'center'}
          alignSelf={'center'}
          gap={1}
        >
          <FormDateTime name={'startDate'} label={'Sidst godkendt'} disabled={true} />
          <FormDateTime name="date" label="Godkend til" disabled={!initiateConfirmTimeseries} />
          <Box display={'flex'} mt={2.5} flexDirection={'row'} alignSelf={'center'} gap={1}>
            <Button
              bttype="tertiary"
              onClick={() => {
                setDataAdjustment(null);
                onClose();
                // reset();
              }}
            >
              Annuller
            </Button>
            <Button
              bttype="primary"
              startIcon={<Save />}
              disabled={parsedData?.date.isAfter(enddateWatch) && parsedData?.date != undefined}
              onClick={handleSubmit(handleSave, (e) => {
                console.log(e);
              })}
            >
              Godkend
            </Button>
          </Box>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default WizardConfirmTimeseries;
