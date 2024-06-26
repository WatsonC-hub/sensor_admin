import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import {startCase} from 'lodash';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {StationPages} from '~/helpers/EnumHelper';

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
  const handleChange = (event, newValue) => {
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
