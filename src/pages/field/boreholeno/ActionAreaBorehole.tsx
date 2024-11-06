import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {startCase} from 'lodash';
import {parseAsBoolean, useQueryState} from 'nuqs';
import React from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {stationPages} from '~/helpers/EnumHelper';
import {useStationPages} from '~/hooks/useStationPages';
const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

interface ActionAreaProps {
  canEdit: boolean;
}

export default function ActionArea({canEdit}: ActionAreaProps) {
  const [pageToShow, setPageToShow] = useStationPages();
  const [showForm, setShowForm] = useQueryState('showForm', parseAsBoolean);
  const handleChange = (event: React.ChangeEvent<object>, newValue: any) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };

  const navigationItems = [
    {
      text: 'Pejling',
      value: stationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === 'pejling'),
    },
    {
      text: 'Målepunkt',
      value: stationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(pageToShow === 'maalepunkt'),
    },
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === 'billeder'),
    },
    {
      text: startCase(stationPages.STAMDATA),
      value: stationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
  ];

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
      canEdit={canEdit}
    />
  );
}
