// A hook that returns whether the current screen size is mobile, tablet or desktop.

import { useTheme } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function useBreakpoints() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("tablet"));
  const isTablet = useMediaQuery(theme.breakpoints.between("tablet", "laptop"));

  const isLaptop = useMediaQuery(
    theme.breakpoints.between("laptop", "desktop")
  );
  const isMonitor = useMediaQuery(theme.breakpoints.up("desktop"));

  const isTouch = useMediaQuery(theme.breakpoints.down("laptop"));

  return { isMobile, isTablet, isLaptop, isTouch, isMonitor };
}
