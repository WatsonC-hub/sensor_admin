import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import React, {useState} from 'react';
import {toast} from 'react-toastify';
import DeleteAlert from 'src/components/DeleteAlert';
import useBreakpoints from 'src/hooks/useBreakpoints';
import {authStore} from 'src/state/store';

function ImageCardBorehole({image, deleteMutation, handleEdit}) {
  // const baseUrl = 'https://calypsoimages.s3.eu-north-1.amazonaws.com/borehole_images/';
  // const imageUrl = baseUrl + image.imageurl + '.png';

  const {isMobile} = useBreakpoints();

  const imageUrl = `/assets/${image.imageurl}?format=auto&width=${isMobile ? 300 : 640}`;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [org_id] = authStore((state) => [state.org_id]);

  function handleDelete() {
    toast.promise(() => deleteMutation.mutateAsync({path: `${image.boreholeno}/${image.gid}`}), {
      pending: 'Sletter billedet',
      success: 'Billedet blev slettet',
      error: 'Der skete en fejl',
    });
  }

  return (
    <Card
      sx={{
        minWidth: 300,
        margin: 'auto',
      }}
    >
      <DeleteAlert
        title="Vil du slette billedet?"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <CardMedia
        component="img"
        image={imageUrl}
        sx={{
          height: isMobile ? null : 640,
          // width: '100%',
          objectFit: 'contain',
        }}
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" align="right" component="p">
          {moment(image.date).format('YYYY-MM-DD HH:mm')}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {image.comment}
        </Typography>
      </CardContent>
      {image.organisationid == org_id && (
        <CardActions>
          <Button
            disabled={deleteMutation.isLoading}
            onClick={() => setDialogOpen(true)}
            size="small"
            color="primary"
          >
            {deleteMutation.isLoading ? <CircularProgress /> : 'Slet'}
          </Button>
          <Button
            disabled={deleteMutation.isLoading}
            onClick={() => handleEdit(image)}
            size="small"
            color="primary"
          >
            Rediger
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default ImageCardBorehole;
