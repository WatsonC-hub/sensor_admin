import {Edit} from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import {Box} from '@mui/material';
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
import {Image} from '~/types';

import GenericCard from './GenericCard';
import {useAppContext} from '~/state/contexts';
import usePermissions from '~/features/permissions/api/usePermissions';

type ImageCardProps = {
  image: Image;
  deleteMutation: UseMutationResult;
  handleEdit: (image: Image) => void;
};

function ImageCard({image, deleteMutation, handleEdit}: ImageCardProps) {
  const {loc_id, boreholeno} = useAppContext([], ['loc_id', 'boreholeno']);
  const {
    location_permissions,
    borehole_permission_query: {data: permissions},
  } = usePermissions(loc_id);
  const {isMobile} = useBreakpoints();
  const imageUrl = `/static/images/${image.imageurl}?format=auto&width=${isMobile ? 300 : 480}&height=${isMobile ? 300 : 480}`;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLocation = loc_id !== undefined;
  const disabled =
    (location_permissions === 'edit' && isLocation) ||
    (boreholeno !== undefined && permissions?.borehole_plantids?.boreholenos?.includes(boreholeno));

  function handleDelete() {
    deleteMutation.mutateAsync(
      {
        path: `${image.loc_id !== undefined ? image.loc_id : image.boreholeno}/${image.gid}`,
      },
      {
        onSuccess: () => {
          toast.success('Billedet er blevet slettet');
        },
      }
    );
  }

  return (
    <GenericCard
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column ',
        borderRadius: 5,
        minWidth: 0,
        width: isMobile ? '300px' : '480px',
      }}
      key={image.gid.toString()}
    >
      <DeleteAlert
        title="Vil du slette billedet?"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={handleDelete}
      />
      <CardMedia
        sx={{
          margin: 'auto',
          height: isMobile ? '300px' : '480px',
          width: isMobile ? '300px' : '480px',
        }}
      >
        <div
          style={
            isLoaded
              ? {display: `none`}
              : {height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}
          }
        >
          <CircularProgress />
        </div>
        <img src={imageUrl} alt={image.title} onLoad={() => setIsLoaded(true)} />
      </CardMedia>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
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
          }}
        >
          {image.comment}
        </Typography>
      </CardContent>
      {(image.loc_id || image.boreholeno) && (
        <CardActions sx={{display: 'flex', justifyContent: 'end'}}>
          <Button
            disabled={deleteMutation.isPending || !disabled}
            onClick={() => setDialogOpen(true)}
            size="small"
            bttype="tertiary"
          >
            {deleteMutation.isPending ? (
              <CircularProgress />
            ) : (
              <Box display="flex" alignItems="center" gap={1}>
                <Delete />
                <Typography variant="body2" fontSize={14}>
                  Slet
                </Typography>
              </Box>
            )}
          </Button>
          <Button
            disabled={deleteMutation.isPending || !disabled}
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
    </GenericCard>
  );
}

export default ImageCard;
