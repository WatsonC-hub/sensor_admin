import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {startCase} from 'lodash';
import React from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {StationPages} from '~/helpers/EnumHelper';
import {useSearchParam} from '~/hooks/useSeachParam';
const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'inherit';
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
      value: StationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === StationPages.PEJLING),
    },
    {
      text: 'Målepunkt',
      value: StationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(pageToShow === StationPages.MAALEPUNKT),
    },
    {
      text: startCase(StationPages.BILLEDER),
      value: StationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === StationPages.BILLEDER),
    },
    {
      text: startCase(StationPages.STAMDATA),
      value: StationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === StationPages.STAMDATA),
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
