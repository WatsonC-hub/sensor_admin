import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import {startCase} from 'lodash';

import {StationPages} from '~/helpers/EnumHelper';

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
      value: StationPages.PEJLING,
      icon: <AddCircle />,
      color: navIconStyle(pageToShow === StationPages.PEJLING),
    },
    {
      text: startCase(StationPages.TILSYN),
      value: StationPages.TILSYN,
      icon: <PlaylistAddCheck />,
      color: navIconStyle(pageToShow === StationPages.TILSYN),
      isCalculated: isCalculated,
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
