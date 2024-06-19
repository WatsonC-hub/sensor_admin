import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  AddAPhotoRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import {startCase} from 'lodash';
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

  const navigationItems = [
    {
      text: 'Pejling',
      value: StationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(value === StationPages.PEJLING),
    },
    {
      text: 'Målepunkt',
      value: StationPages.MAALEPUNKT,
      icon: <StraightenRounded />,
      color: navIconStyle(value === StationPages.MAALEPUNKT),
    },
    {
      text: startCase(StationPages.BILLEDER),
      value: StationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(value === StationPages.BILLEDER),
    },
    {
      text: startCase(StationPages.STAMDATA),
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
