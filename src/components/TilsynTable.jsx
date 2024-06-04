import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import TilsynTableDesktop from '~/components/tableComponents/TilsynTableDesktop';

import TilsynTableMobile from './tableComponents/TilsynTableMobile';

export default function TilsynTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <TilsynTableMobile
      data={props.services}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
    />
  ) : (
    <TilsynTableDesktop
      data={props.services}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
    />
  );
}
