import React from 'react';
// @ts-ignore
import ImageCard from '~/components/ImageCard';
import {Grid} from '@mui/material';

type Image = {
  gid: number;
  loc_id?: number;
  boreholeno: number;
  title: string;
  date: string;
  public: boolean;
  userid: number;
  comment: string;
  imageurl: string;
  organisationid?: number;
};

type ImageViewerProps = {
  images: Array<Image>;
  deleteMutation: any;
  handleEdit: any;
};

function ImageViewer({images, deleteMutation, handleEdit}: ImageViewerProps) {
  return (
    <Grid container spacing={3} alignItems="center" justifyContent="center">
      {images?.map((elem) => {
        return (
          <Grid item xs={10} sm={6} md={6} lg={5} key={elem.gid}>
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ImageViewer;
