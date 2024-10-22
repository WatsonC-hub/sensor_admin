import {Save} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useContext, useState} from 'react';

import Button from '~/components/Button';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {useSearchParam} from '~/hooks/useSeachParam';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const LevelCorrectionModal = () => {
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const [, setDataAdjustment] = useSearchParam('adjust', null);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onAccept();
    // onClose();
  };
  const unit = metadata && 'unit' in metadata ? (metadata.unit as string) : '';
  const prevY = (
    selection?.points?.[0]?.data?.y[selection?.points?.[0]?.pointIndex - 1] as number
  )?.toFixed(4);
  const prevX = moment(
    selection?.points?.[0]?.data?.x[selection?.points?.[0]?.pointIndex - 1] as string
  );
  const y = (selection?.points?.[0]?.y as number)?.toFixed(4);
  const x = moment(selection?.points?.[0]?.x);

  const {post: levelCorrectionMutation} = useLevelCorrection();

  const onAccept = () => {
    levelCorrectionMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {date: x.toISOString(), comment: comment},
    });
  };

  return (
    <div>
      <Typography gutterBottom>
        Korrigerer grafen fremadrettet ved at sætte det følgende punkt lig med det forrige punkt
      </Typography>
      <Typography gutterBottom>
        <b>Forrige datapunkt:</b> {prevX.format('YYYY-MM-DD HH:mm')} - {prevY + ' '}
        {unit}
      </Typography>
      <Typography gutterBottom>
        <b>Nuværende datapunkt:</b> {x.format('YYYY-MM-DD HH:mm')} - {y + ' '} {unit}
      </Typography>
      <TextField
        label="Kommentar"
        variant="outlined"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        multiline
        fullWidth
        rows={3}
      />
      <Box display={'flex'} flexDirection={'row'} justifyContent={'end'} m={1} gap={1}>
        <Button bttype="tertiary" onClick={() => setDataAdjustment(null)}>
          Annuller
        </Button>
        <Button bttype="primary" onClick={handleSubmit} startIcon={<Save />} color="secondary">
          Gem
        </Button>
      </Box>
    </div>
  );
};

export default LevelCorrectionModal;
