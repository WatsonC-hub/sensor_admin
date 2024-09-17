import {
  AddCircle,
  ConstructionRounded,
  PhotoLibraryRounded,
  PlaylistAddCheck,
} from '@mui/icons-material';
import RuleIcon from '@mui/icons-material/Rule';
import {startCase} from 'lodash';

import CustomBottomNavigation from '~/components/BottomNavigation';
import {StationPages} from '~/helpers/EnumHelper';
import {useSearchParam} from '~/hooks/useSeachParam';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

interface ActionAreaProps {
  isCalculated: boolean;
  ts_id: number;
  stamdata: Array<object>;
}

export default function ActionArea({isCalculated, ts_id, stamdata}: ActionAreaProps) {
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const [showForm, setShowForm] = useSearchParam('showForm');
  const handleChange = (event: any, newValue: string | null) => {
    setPageToShow(newValue);
    if (showForm !== null) {
      setShowForm(null);
    }
  };
  const navigationItems = [];
  if (ts_id.toString() !== '' || !stamdata) {
    navigationItems.push(
      {
        text: 'Pejling',
        value: StationPages.PEJLING,
        icon: <AddCircle />,
        color: navIconStyle(pageToShow === null),
      },
      {
        text: startCase(StationPages.TILSYN),
        value: StationPages.TILSYN,
        icon: <PlaylistAddCheck />,
        color: navIconStyle(pageToShow === StationPages.TILSYN),
        isCalculated: isCalculated,
      }
    );
  } else {
    navigationItems.push({
      text: 'Tidsserie',
      value: StationPages.DEFAULT,
      icon: <RuleIcon />,
      color: navIconStyle(pageToShow === StationPages.DEFAULT),
    });
  }

  navigationItems.push(
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
