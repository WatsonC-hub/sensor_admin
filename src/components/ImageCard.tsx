import {Edit} from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import {Box} from '@mui/material';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {UseMutationResult} from '@tanstack/react-query';
import moment from 'moment';
import React, {useState} from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import DeleteAlert from '~/components/DeleteAlert';
import useBreakpoints from '~/hooks/useBreakpoints';
import {authStore} from '~/state/store';
import {Image} from '~/types';

type ImageCardProps = {
  image: Image;
  deleteMutation: UseMutationResult;
  handleEdit: (image: Image) => void;
};

function ImageCard({image, deleteMutation, handleEdit}: ImageCardProps) {
  const {isMobile} = useBreakpoints();

  const imageUrl = `/static/images/${image.imageurl}?format=auto&width=${isMobile ? 300 : 640}&height=${isMobile ? 300 : 640}`;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [org_id] = authStore((state) => [state.org_id]);

  const isBorehole =
    image.boreholeno !== undefined &&
    image.organisationid !== undefined &&
    image.organisationid === org_id;

  function handleDelete() {
    toast.promise(
      () =>
        deleteMutation.mutateAsync({
          path: `${image.loc_id !== undefined ? image.loc_id : image.boreholeno}/${image.gid}`,
        }),
      {
        pending: 'Sletter billedet',
        success: 'Billedet blev slettet',
        error: 'Der skete en fejl',
      }
    );
  }

  return (
    <Card
      sx={{
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column ',
        borderRadius: 5,
        minWidth: 300,
        minHeight: 300,
        // maxWidth: 640,
        // maxHeight: 640,
      }}
    >
      <DeleteAlert
        title="Vil du slette billedet?"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <CardMedia>
        <img
          src={imageUrl}
          alt={image.title}
          height={isMobile ? 300 : 640}
          width={isMobile ? 300 : 640}
          loading="lazy"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
        />
      </CardMedia>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography variant="body2" color="textSecondary" align="right" component="p">
          {moment(image.date).format('YYYY-MM-DD HH:mm')}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          sx={{
            minHeight: {md: '60px'},
            flexGrow: 1,
          }}
        >
          {image.comment}
        </Typography>
      </CardContent>
      {(image.loc_id !== undefined || isBorehole) && (
        <CardActions sx={{display: 'flex', justifyContent: 'end'}}>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => setDialogOpen(true)}
            size="small"
            bttype="tertiary"
          >
            {deleteMutation.isPending ? (
              <CircularProgress />
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <Delete></Delete>
                <Typography variant="body2" fontSize={14}>
                  Slet
                </Typography>
              </Box>
            )}
          </Button>
          <Button
            disabled={deleteMutation.isPending}
            onClick={() => handleEdit(image)}
            size="small"
            bttype="primary"
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Edit />
              <Typography variant="body2" fontSize={14}>
                Rediger
              </Typography>
            </Box>
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

export default ImageCard;
