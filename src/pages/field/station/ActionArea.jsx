import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';

import CustomBottomNavigation from '../../../components/BottomNavigation';

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
      text: 'Pejling',
      value: null,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === null),
    },
    {
      text: 'Tilsyn',
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
      text: 'Udstyr',
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
