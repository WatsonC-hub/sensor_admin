import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  AddAPhotoRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {camelCase} from 'lodash';
import React, {useState} from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {StationPages} from '~/helpers/EnumHelper';
const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

export default function ActionArea({setPageToShow, showForm, setShowForm, canEdit}) {
  const [value, setValue] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };

  const pejlingItem = {fabText: 'Tilføj ' + StationPages.PEJLING, fabIcon: <AddCircle />};
  const målepunktItem = {
    fabText: 'Tilføj ' + StationPages.MAALEPUNKT,
    fabIcon: <StraightenRounded />,
  };
  const billedeItem = {
    fabText: 'Tilføj ' + StationPages.BILLEDEER,
    fabIcon: <AddAPhotoRounded />,
  };

  const navigationItems = [
    {
      text: 'Pejling',
      value: StationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(value === StationPages.PEJLING),
      fabItem: pejlingItem,
    },
    {
      text: camelCase(StationPages.MAALEPUNKT),
      value: StationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(value === StationPages.MAALEPUNKT),
      fabItem: målepunktItem,
    },
    {
      text: camelCase(StationPages.BILLEDER),
      value: StationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(value === StationPages.BILLEDER),
      fabItem: billedeItem,
    },
    {
      text: camelCase(StationPages.STAMDATA),
      value: StationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(value === StationPages.STAMDATA),
    },
  ];

  return (
    <CustomBottomNavigation
      showData={value}
      onChange={handleChange}
      items={navigationItems}
      canEdit={canEdit}
    />
  );
}
