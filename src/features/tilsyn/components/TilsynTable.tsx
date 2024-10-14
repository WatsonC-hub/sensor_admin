import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import TilsynTableDesktop from '~/features/tilsyn/components/TilsynTableDesktop';
import TilsynTableMobile from '~/features/tilsyn/components/TilsynTableMobile';
import {TilsynItem} from '~/types';

interface TilsynTableProps {
  handleEdit: (data: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTable({handleEdit, handleDelete, canEdit}: TilsynTableProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <TilsynTableMobile handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} />
  ) : (
    <TilsynTableDesktop handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} />
  );
}
