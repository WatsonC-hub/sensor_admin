import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import {TilsynItem} from '~/types';

import {useTilsyn2} from '../api/useTilsyn';

import TilsynTableDesktop from './TilsynTableDesktop';
import TilsynTableMobile from './TilsynTableMobile';

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
  } = useTilsyn2();

  if (tilsynList === undefined) return null;

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
