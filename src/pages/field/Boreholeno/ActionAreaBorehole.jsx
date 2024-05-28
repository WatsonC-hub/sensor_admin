import {
  AddCircle,
  EditRounded,
  Straighten,
  PlaylistAddCheck,
  StraightenRounded,
  PhotoLibraryRounded,
  AddAPhotoRounded,
  ConstructionRounded,
} from '@mui/icons-material';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import React, {useState} from 'react';
import CustomBottomNavigation from '../../../components/BottomNavigation';

const bottomNavStyle = {
  borderRadius: 5,
  margin: '7px',
  boxShadow: '3px 3px 3px grey',
  backgroundColor: 'secondary.main',
  width: '100px',
  height: '58px',
};

const borderGrey = {
  ...bottomNavStyle,
  backgroundColor: '#9E9E9E',
};

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

export default function ActionArea({setPageToShow, showForm, setShowForm, canEdit, fileInputRef}) {
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
