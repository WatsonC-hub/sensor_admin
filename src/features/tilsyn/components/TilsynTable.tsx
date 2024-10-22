import React from 'react';

import TilsynTableDesktop from '~/features/tilsyn/components/TilsynTableDesktop';
import TilsynTableMobile from '~/features/tilsyn/components/TilsynTableMobile';
import useBreakpoints from '~/hooks/useBreakpoints';
import {TilsynItem} from '~/types';

interface TilsynTableProps {
  handleEdit: (data: TilsynItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function TilsynTable({handleEdit, handleDelete, canEdit}: TilsynTableProps) {
  const {isMobile} = useBreakpoints();

  return isMobile ? (
    <TilsynTableMobile handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} />
  ) : (
    <TilsynTableDesktop handleEdit={handleEdit} handleDelete={handleDelete} canEdit={canEdit} />
  );
}
