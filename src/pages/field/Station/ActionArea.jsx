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
  showData,
  setShowData,
  formToShow,
  setFormToShow,
  isCalculated,
}) {
  // const [value, setValue] = useSearchParam('page');

  const handleChange = (event, newValue) => {
    // setValue(newValue);
    setShowData(newValue);
    if (formToShow !== null) {
      setFormToShow('');
    }
  };
  const navigationItems = [
    {
      text: 'pejling',
      value: null,
      icon: <AddCircle />,
      color: navIconStyle(showData === null),
    },
    {
      text: 'tilsyn',
      value: 'ADDTILSYN',
      icon: <PlaylistAddCheck />,
      color: navIconStyle(showData === 'ADDTILSYN'),
      isCalculated: isCalculated,
    },
    {
      text: 'Billeder',
      value: 'CAMERA',
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(showData === 'CAMERA'),
    },
    {
      text: 'udstyr',
      value: 'RET_STAMDATA',
      icon: <ConstructionRounded />,
      color: navIconStyle(showData === 'RET_STAMDATA'),
      isCalculated: isCalculated,
    },
  ];

  return (
    <CustomBottomNavigation showData={showData} onChange={handleChange} items={navigationItems} />
  );
}
