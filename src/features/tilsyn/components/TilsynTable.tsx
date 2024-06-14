import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import LoadingSkeleton from '~/LoadingSkeleton';
import {TilsynItem} from '~/types';

import {useTilsyn} from '../api/getTilsyn';

import TilsynTableDesktop from './TilsynTableDesktop';
import TilsynTableMobile from './TilsynTableMobile';

interface TilsynTableProps {
  ts_id: number;
  handleEdit: (data: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTable({ts_id, handleEdit, handleDelete, canEdit}: TilsynTableProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const tilsynQuery = useTilsyn({ts_id});

  if (tilsynQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!tilsynQuery.data) return null;

  return matches ? (
    <TilsynTableMobile
      data={tilsynQuery.data}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  ) : (
    <TilsynTableDesktop
      data={tilsynQuery.data}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  );
}
