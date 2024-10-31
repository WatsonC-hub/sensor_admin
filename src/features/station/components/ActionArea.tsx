import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import {startCase} from 'lodash';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {stationPages} from '~/helpers/EnumHelper';
import {useSearchParam} from '~/hooks/useSeachParam';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

interface ActionAreaProps {
  isCalculated: boolean;
  ts_id: number;
}

export default function ActionArea({isCalculated, ts_id}: ActionAreaProps) {
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const [showForm, setShowForm] = useSearchParam('showForm');
  const handleChange = (event: any, newValue: string | null) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };
  const navigationItems = [];
  if (ts_id !== -1) {
    navigationItems.push(
      {
        text: 'Kontrol',
        value: stationPages.PEJLING,
        icon: <AddCircle />,
        color: navIconStyle(pageToShow === null),
      },
      {
        text: startCase(stationPages.TILSYN),
        value: stationPages.TILSYN,
        icon: <PlaylistAddCheck />,
        color: navIconStyle(pageToShow === stationPages.TILSYN),
        isCalculated: isCalculated,
      }
    );
  } else {
    navigationItems.push({
      text: 'Tidsserie',
      value: stationPages.DEFAULT,
      icon: <RuleIcon />,
      color: navIconStyle(pageToShow === stationPages.DEFAULT),
    });
  }

  navigationItems.push(
    {
      text: startCase(stationPages.BILLEDER),
      value: stationPages.BILLEDER,
      icon: <PhotoLibraryRounded />,
      color: navIconStyle(pageToShow === stationPages.BILLEDER),
    },
    {
      text: startCase(stationPages.STAMDATA),
      value: stationPages.STAMDATA,
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === stationPages.STAMDATA),
      isCalculated: isCalculated,
    }
  );

  return (
    <CustomBottomNavigation
      pageToShow={pageToShow}
      onChange={handleChange}
      items={navigationItems}
    />
  );
}
