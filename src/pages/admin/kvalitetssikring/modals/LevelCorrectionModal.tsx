import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {parseAsString, useQueryState} from 'nuqs';
import {useContext, useEffect} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

interface LevelCorrectionModal {
  onClose: () => void;
}

const schema = z.object({
  date: z.string(),
  comment: z.string().optional(),
});

type CorrectionValues = z.infer<typeof schema>;

const LevelCorrectionModal = ({onClose}: LevelCorrectionModal) => {
  const selection = useAtomValue(qaSelection);
  const metadata = useContext(MetadataContext);
  const [, setDataAdjustment] = useQueryState('adjust', parseAsString);

  const unit = metadata && 'unit' in metadata ? (metadata.unit as string) : '';
  const prevY = (
    selection?.points?.[0]?.data?.y[selection?.points?.[0]?.pointIndex - 1] as number
  )?.toFixed(4);
  const prevX = moment(
    selection?.points?.[0]?.data?.x[selection?.points?.[0]?.pointIndex - 1] as string
  );
  const y = (selection?.points?.[0]?.y as number)?.toFixed(4);

  const {post: levelCorrectionMutation} = useLevelCorrection();

  const formMethods = useForm<CorrectionValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const {handleSubmit, setValue, watch, reset} = formMethods;

  const onAccept: SubmitHandler<CorrectionValues> = (values) => {
    levelCorrectionMutation.mutate(
      {
        path: `${metadata?.ts_id}`,
        data: {date: values.date, comment: values.comment},
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const x = watch('date');

  useEffect(() => {
    setValue('date', moment(selection?.points?.[0]?.x).format('YYYY-MM-DD HH:mm'));
  }, [selection]);

  return (
    <div>
      <Typography gutterBottom>
        Korrigerer grafen fremadrettet ved at sætte det nuværende punkt lig med det forrige punkt
      </Typography>
      <Box>
        {prevY === undefined ? (
          <Typography gutterBottom fontWeight={'bold'}>
            Ingen forrige datapunkt
          </Typography>
        ) : (
          <Box display={'flex'} flexDirection={'row'}>
            <b style={{width: 150}}>Forrige punkt:</b>
            <Typography gutterBottom>
              {prevX.format('YYYY-MM-DD HH:mm')} - {prevY + ' '}
              {unit}
            </Typography>
          </Box>
        )}
        <Box display={'flex'} flexDirection={'row'}>
          <b style={{width: 150}}>Nuværende punkt:</b>
          <Typography gutterBottom>
            {x} - {y + ' '} {unit}
          </Typography>
        </Box>
      </Box>
      <FormProvider {...formMethods}>
        <FormInput<CorrectionValues>
          name="comment"
          label="Kommentar"
          multiline
          fullWidth
          placeholder="Kommentar..."
          rows={3}
        />
      </FormProvider>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'end'} m={1} gap={1}>
        <Button
          bttype="tertiary"
          onClick={() => {
            setDataAdjustment(null);
            onClose();
          }}
        >
          Annuller
        </Button>
        <Button
          bttype="primary"
          onClick={handleSubmit(onAccept, (e) => console.log(e))}
          startIcon={<Save />}
          color="secondary"
        >
          Gem
        </Button>
      </Box>
    </div>
  );
};

export default LevelCorrectionModal;
