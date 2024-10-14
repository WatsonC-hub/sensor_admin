import {Save} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useContext, useState} from 'react';

import Button from '~/components/Button';
import {useLevelCorrection} from '~/hooks/query/useLevelCorrection';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const LevelCorrectionModal = () => {
  const selection = useAtomValue(qaSelection);
  const [comment, setComment] = useState('');
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    // onClose();
  };

  const prevY = selection?.points?.[0]?.y?.toFixed(4);
  const prevX = moment(selection?.points?.[0]?.x);
  const y = selection?.points?.[1]?.y?.toFixed(4);
  const x = moment(selection?.points?.[1]?.x);

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
        <b>Forrige datapunkt:</b> {prevX.format('YYYY-MM-DD HH:mm')} - {prevY} {metadata?.unit}
      </Typography>
      <Typography gutterBottom>
        <b>Nuværende datapunkt:</b> {x.format('YYYY-MM-DD HH:mm')} - {y} {metadata?.unit}
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
        <Button bttype="tertiary">Annuller</Button>
        <Button bttype="primary" onClick={handleSubmit} startIcon={<Save />} color="secondary">
          Gem
        </Button>
      </Box>
    </div>
  );
};

export default LevelCorrectionModal;
