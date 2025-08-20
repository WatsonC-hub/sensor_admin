import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
// import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import dayjs from 'dayjs';
import {useAtomValue} from 'jotai';
import {parseAsString, useQueryState} from 'nuqs';
import {useEffect, useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormDateTime from '~/components/FormDateTime';
import FormInput from '~/components/FormInput';
import {zodDayjs} from '~/helpers/schemas';
import {useExclude} from '~/hooks/query/useExclude';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {qaSelection} from '~/state/atoms';

interface ExcludeModalProps {
  onClose: () => void;
}

const schema = z.object({
  startDate: zodDayjs('Dato fra er påkrævet'),
  endDate: zodDayjs('Dato til er påkrævet'),
  startValue: z.string().nullable(),
  endValue: z.string().nullable(),
  comment: z.string().optional(),
});

type ExcludeModalValues = z.infer<typeof schema>;

const ExcludeModal = ({onClose}: ExcludeModalProps) => {
  const [radio, setRadio] = useState('selected');
  const selection = useAtomValue(qaSelection);
  const {data: timeseries_data} = useTimeseriesData();
  const {isMobile} = useBreakpoints();
  const x0 = dayjs(selection?.range?.x[0]);
  const x1 = dayjs(selection?.range?.x[1]);
  const y0 = selection?.range ? selection?.range.y[0] : 0;
  const y1 = selection?.range ? selection?.range.y[1] : 0;

  const {data: parsedData} = schema.safeParse({
    startDate: x0,
    endDate: x1,
    startValue: y0.toFixed(4),
    endValue: y1.toFixed(4),
    comment: '',
  });

  const formMethods = useForm<ExcludeModalValues>({
    resolver: zodResolver(schema),
    defaultValues: parsedData,
    mode: 'onTouched',
  });

  const {handleSubmit, setValue, reset} = formMethods;
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const {post: excludeMutation} = useExclude();

  const onAccept: SubmitHandler<ExcludeModalValues> = (values: ExcludeModalValues) => {
    excludeMutation.mutate(
      {
        path: `${timeseries_data?.ts_id}`,
        data: {
          startdate: values.startDate,
          enddate: values.endDate,
          min_value: radio == 'selected' ? Number(values.startValue) : null,
          max_value: radio == 'selected' ? Number(values.endValue) : null,
          comment: values.comment ?? '',
        },
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  useEffect(() => {
    setValue('startDate', dayjs.min(x0, x1));
    setValue('endDate', dayjs.max(x0, x1));
    setValue('startValue', Math.min(y0, y1).toFixed(4));
    setValue('endValue', Math.max(y0, y1).toFixed(4));
  }, [selection]);

  return (
    <Box>
      <FormProvider {...formMethods}>
        <Box
          display={'flex'}
          flexDirection={'row'}
          flexWrap={isMobile ? 'wrap' : 'inherit'}
          justifyContent={'center'}
          alignItems={'center'}
          gap={2}
        >
          <FormDateTime<ExcludeModalValues> name="startDate" label="Dato fra" required />
          <FormDateTime<ExcludeModalValues> name="endDate" label="Dato til" required />
        </Box>
        <Box
          display={'flex'}
          flexDirection={'row'}
          flexWrap={isMobile ? 'wrap' : 'inherit'}
          justifyContent={'center'}
          alignItems={'center'}
          gap={2}
        >
          <FormInput<ExcludeModalValues>
            name="startValue"
            label={'Start interval'}
            type="number"
            disabled={radio !== 'selected'}
          />
          <FormInput<ExcludeModalValues>
            name="endValue"
            label={'Slut interval'}
            type="number"
            disabled={radio !== 'selected'}
          />
        </Box>
        <FormInput<ExcludeModalValues> name="comment" label="Kommentar" multiline rows={3} />
      </FormProvider>

      <Typography gutterBottom>
        Vil du fjerne alt inden for de to tidsstempler, eller kun de valgte punkter?
      </Typography>
      <FormControl>
        <RadioGroup
          aria-label="exclude"
          name="exclude"
          value={radio}
          onChange={(e) => setRadio(e.target.value)}
        >
          <FormControlLabel control={<Radio />} label="Valgte punkter" value="selected" />
          <FormControlLabel control={<Radio />} label="Alt inden for tidsstempler" value="all" />
        </RadioGroup>
      </FormControl>
      {radio == 'selected' && (
        <Typography gutterBottom>Ekskluderer {selection.points?.length} punkter</Typography>
      )}
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
        <Button
          bttype="tertiary"
          // startIcon={<KeyboardReturnIcon />}
          onClick={() => {
            setDataAdjustment(null);
            onClose();
          }}
          sx={{marginRight: 1}}
        >
          Annuller
        </Button>
        <Button
          bttype="primary"
          startIcon={<Save />}
          onClick={handleSubmit(onAccept, (e) => console.log(e))}
          color="secondary"
        >
          Gem
        </Button>
      </Box>
    </Box>
  );
};

export default ExcludeModal;
