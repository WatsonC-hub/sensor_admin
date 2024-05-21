import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import {useState} from 'react';
import CustomBottomNavigation from '../../../components/BottomNavigation';

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

export default function ActionArea({setShowData, formToShow, setFormToShow, isCalculated}) {
  const [value, setValue] = useState('ADDPEJLING');

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setShowData(newValue);
    if (formToShow !== null) {
      setFormToShow('');
    }
  };
  const navigationItems = [
    {
      text: 'pejling',
      value: 'ADDPEJLING',
      icon: <AddCircle />,
      color: navIconStyle(value === 'ADDPEJLING'),
    },
    {
      text: 'tilsyn',
      value: 'ADDTILSYN',
      icon: <PlaylistAddCheck />,
      color: navIconStyle(value === 'ADDTILSYN'),
      isCalculated: isCalculated,
    },
    {
      text: 'Billeder',
      value: 'CAMERA',
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(value === 'CAMERA'),
    },
    {
      text: 'udstyr',
      value: 'RET_STAMDATA',
      icon: <ConstructionRounded />,
      color: navIconStyle(value === 'RET_STAMDATA'),
      isCalculated: isCalculated,
    },
  ];

  return (
    <CustomBottomNavigation showData={value} onChange={handleChange} items={navigationItems} />
  );
}
