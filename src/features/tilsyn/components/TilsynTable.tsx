import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import {useTilsyn} from '~/features/tilsyn/api/useTilsyn';
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

  const {
    get: {data: tilsynList},
  } = useTilsyn();

  return matches ? (
    <TilsynTableMobile
      data={tilsynList}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  ) : (
    <TilsynTableDesktop
      data={tilsynList}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  );
}
