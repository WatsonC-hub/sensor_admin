import {
  AddCircle,
  StraightenRounded,
  PhotoLibraryRounded,
  AddAPhotoRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import React, {useState} from 'react';

import CustomBottomNavigation from '../../../components/BottomNavigation';

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

export default function ActionArea({setPageToShow, showForm, setShowForm, canEdit}) {
  const [value, setValue] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm('');
    }
  };

  const pejlingItem = {fabText: 'Tilføj pejling', fabIcon: <AddCircle />};
  const målepunktItem = {fabText: 'Tilføj målepunkt', fabIcon: <StraightenRounded />};
  const billedeItem = {fabText: 'Tilføj billede', fabIcon: <AddAPhotoRounded />};

  const navigationItems = [
    {
      text: 'Pejling',
      value: null,
      icon: <AddCircle />,
      color: navIconStyle(value === null),
      fabItem: pejlingItem,
    },
    {
      text: 'Målepunkter',
      value: 'MAALEPUNKT',
      icon: <StraightenRounded />,
      color: navIconStyle(value === 'MAALEPUNKT'),
      fabItem: målepunktItem,
    },
    {
      text: 'Billeder',
      value: 'billeder',
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(value === 'billeder'),
      fabItem: billedeItem,
    },
    {
      text: 'Stamdata',
      value: 'STAMDATA',
      icon: <ConstructionRounded />,
      color: navIconStyle(value === 'STAMDATA'),
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
