import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import {parseAsString, useQueryState} from 'nuqs';
import {useEffect} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useMetadata} from '~/hooks/query/useMetadata';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';
import {qaSelection} from '~/state/atoms';

interface YRangeModalProps {
  onClose: () => void;
}

const schema = z.object({
  min: z.string(),
  max: z.string(),
});

type YRangeValues = z.infer<typeof schema>;

const YRangeModal = ({onClose}: YRangeModalProps) => {
  const selection = useAtomValue(qaSelection);
  const y1 = selection?.selections?.[0]?.y1 as number;
  const y0 = selection?.selections?.[0]?.y0 as number;

  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const {metadata} = useMetadata();

  const formMethods = useForm<YRangeValues>({
    resolver: zodResolver(schema),

    mode: 'onTouched',
  });

  const {handleSubmit, setValue, reset} = formMethods;

  const unit = metadata && 'unit' in metadata ? (metadata.unit as string) : '';

  const {post: yRangeMutation} = useYRangeMutations();

  const onAccept: SubmitHandler<YRangeValues> = (values) => {
    yRangeMutation.mutate(
      {
        path: `${metadata?.ts_id}`,
        data: {mincutoff: Number(values.min), maxcutoff: Number(values.max)},
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  useEffect(() => {
    setValue('min', Math.min(y1, y0).toFixed(4));
    setValue('max', Math.max(y1, y0).toFixed(4));
  }, [selection]);

  return (
    <div>
      <FormProvider {...formMethods}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
          my={1}
        >
          <Typography variant="h6" gutterBottom={true}>
            Område: {unit}
          </Typography>
          <Box
            display={'flex'}
            flexDirection={'row'}
            gap={1}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <FormInput<YRangeValues>
              name="min"
              label="Minimum"
              variant="outlined"
              size="small"
              type="number"
              sx={{maxWidth: '120px', zIndex: 0}}
            />
            <Typography gutterBottom> - </Typography>
            <FormInput<YRangeValues>
              name="max"
              label="Maximum"
              variant="outlined"
              size="small"
              type="number"
              sx={{maxWidth: '120px', zIndex: 0}}
            />
          </Box>
        </Box>
      </FormProvider>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
        <Button
          bttype="tertiary"
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
    </div>
  );
};

export default YRangeModal;
