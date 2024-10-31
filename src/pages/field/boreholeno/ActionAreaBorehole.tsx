import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {startCase} from 'lodash';
import React from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {stationPages} from '~/helpers/EnumHelper';
import {useSearchParam} from '~/hooks/useSeachParam';
const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

interface ActionAreaProps {
  canEdit: boolean;
}

export default function ActionArea({canEdit}: ActionAreaProps) {
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const [showForm, setShowForm] = useSearchParam('showForm');
  const handleChange = (event: React.ChangeEvent<object>, newValue: string | null) => {
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
      color: navIconStyle(pageToShow === stationPages.PEJLING),
    },
    {
      text: 'Målepunkt',
      value: stationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(pageToShow === stationPages.MAALEPUNKT),
    },
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === stationPages.BILLEDER),
    },
    {
      text: startCase(stationPages.STAMDATA),
      value: stationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === stationPages.STAMDATA),
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
