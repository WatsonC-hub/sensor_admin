import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
// import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import {Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {parseAsString, useQueryState} from 'nuqs';
import {useContext, useEffect, useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useExclude} from '~/hooks/query/useExclude';
import useBreakpoints from '~/hooks/useBreakpoints';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

interface ExcludeModalProps {
  onClose: () => void;
}

const schema = z.object({
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  startValue: z.string().nullable(),
  endValue: z.string().nullable(),
  comment: z.string().optional(),
});

type ExcludeModalValues = z.infer<typeof schema>;

const ExcludeModal = ({onClose}: ExcludeModalProps) => {
  const [radio, setRadio] = useState('selected');
  const selection = useAtomValue(qaSelection);
  const metadata = useContext(MetadataContext);
  const {isMobile} = useBreakpoints();

  const x0 = moment(selection?.range?.x[0]);
  const x1 = moment(selection?.range?.x[1]);
  const y0 = selection?.range ? selection?.range.y[0] : 0;
  const y1 = selection?.range ? selection?.range.y[1] : 0;

  const formMethods = useForm<ExcludeModalValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const {handleSubmit, setValue, reset} = formMethods;
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const {post: excludeMutation} = useExclude();

  const onAccept: SubmitHandler<ExcludeModalValues> = (values: ExcludeModalValues) => {
    excludeMutation.mutate(
      {
        path: `${metadata?.ts_id}`,
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
    setValue('startDate', moment.min(x0, x1).format('YYYY-MM-DD HH:mm'));
    setValue('endDate', moment.max(x0, x1).format('YYYY-MM-DD HH:mm'));
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
          <FormInput<ExcludeModalValues>
            name="startDate"
            label="Dato fra"
            type="datetime-local"
            required
          />
          <FormInput<ExcludeModalValues>
            name="endDate"
            label="Dato til"
            type="datetime-local"
            required
          />
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
