import {Box, Typography} from '@mui/material';
import TextField from '@mui/material/TextField';
import {useAtomValue} from 'jotai';
import {useContext, useState} from 'react';

import Button from '~/components/Button';
import {useYRangeMutations} from '~/hooks/query/useYRangeMutations';
import {qaSelection} from '~/state/atoms';
import {MetadataContext} from '~/state/contexts';

const YRangeModal = ({onClose}) => {
  const selection = useAtomValue(qaSelection);
  const y1 = selection?.selections?.[0]?.y1;
  const y0 = selection?.selections?.[0]?.y0;

  const [minY, setMinY] = useState(Math.min(y1, y0).toFixed(4));
  const [maxY, setMaxY] = useState(Math.max(y1, y0).toFixed(4));
  const metadata = useContext(MetadataContext);
  const handleSubmit = (e) => {
    e.preventDefault();
    onAccept();
    onClose();
  };

  const {post: yRangeMutation} = useYRangeMutations();

  const onAccept = () => {
    yRangeMutation.mutate({
      path: `${metadata?.ts_id}`,
      data: {mincutoff: Number(minY), maxcutoff: Number(maxY)},
    });
  };

  return (
    <div>
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
          Område: {metadata?.unit}
        </Typography>
        <Box
          display={'flex'}
          flexDirection={'row'}
          gap={1}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <TextField
            label="Minimum"
            variant="outlined"
            value={minY}
            size="small"
            type="number"
            onChange={(e) => setMinY(e.target.value)}
            sx={{maxWidth: '120px'}}
          />
          <Typography gutterBottom> - </Typography>
          <TextField
            label="Maximum"
            variant="outlined"
            value={maxY}
            size="small"
            type="number"
            onChange={(e) => setMaxY(e.target.value)}
            sx={{maxWidth: '120px'}}
          />
          <Typography gutterBottom> {metadata?.unit}</Typography>
        </Box>
      </Box>
      <Box display={'flex'} flexDirection={'row'} justifyContent={'center'}>
        <Button bttype="tertiary" onClick={onClose} sx={{marginRight: 1}}>
          Fortryd
        </Button>
        <Button bttype="primary" onClick={handleSubmit} color="secondary">
          Bekræft
        </Button>
      </Box>
    </div>
  );
};

export default YRangeModal;
