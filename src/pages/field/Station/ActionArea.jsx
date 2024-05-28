import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import {useState} from 'react';
import CustomBottomNavigation from '../../../components/BottomNavigation';
import {useSearchParam} from '~/hooks/useSeachParam';

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

export default function ActionArea({
  pageToShow,
  setPageToShow,
  showForm,
  setShowForm,
  isCalculated,
}) {
  // const [value, setValue] = useSearchParam('page');

  const handleChange = (event, newValue) => {
    // setValue(newValue);
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm('');
    }
  };
  const navigationItems = [
    {
      text: 'pejling',
      value: null,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === null),
    },
    {
      text: 'tilsyn',
      value: 'TILSYN',
      icon: <PlaylistAddCheck />,
      color: navIconStyle(pageToShow === 'TILSYN'),
      isCalculated: isCalculated,
    },
    {
      text: 'Billeder',
      value: 'billeder',
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === 'billeder'),
    },
    {
      text: 'udstyr',
      value: 'STAMDATA',
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'STAMDATA'),
      isCalculated: isCalculated,
    },
  ];

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
    />
  );
}
