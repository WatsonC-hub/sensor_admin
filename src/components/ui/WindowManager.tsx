import React, {Children, cloneElement} from 'react';
import {Box, IconButton, SxProps} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import CloseIcon from '@mui/icons-material/Close';
import useWindowDimensions from '~/hooks/useWindowDimensions';

type WindowManagerProps = {
  children: React.ReactElement<WindowProps>[];
  minColumnWidth: number;
};

const WindowManager = ({children, minColumnWidth}: WindowManagerProps) => {
  const {width} = useWindowDimensions();
  const {isMobile} = useBreakpoints();

  const maxColumns = Math.max(Math.floor(width / minColumnWidth), 1);

  const columnWidth = width / maxColumns;

  const arrayedChildren = Children.toArray(children).filter(
    (child) =>
      typeof child === 'object' &&
      'type' in child &&
      child.type === Window &&
      (child as React.ReactElement<WindowProps>)?.props?.show
  ) as React.ReactElement<WindowProps>[];

  arrayedChildren.sort((a, b) => {
    if (isMobile) {
      return (a.props.mobilePriority || 0) - (b.props.mobilePriority || 0);
    }
    return a.props.priority - b.props.priority;
  });

  if (isMobile && arrayedChildren.length > 0) {
    return (
      <Box
        zIndex={1001}
        height="100%"
        sx={{
          width: '100%',
          pointerEvents: 'none',
          // ml: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          pt: 1,
        }}
      >
        {cloneElement(arrayedChildren[arrayedChildren.length - 1], {width: '100%'})}
      </Box>
    );
  }
  // Check if any window is fullscreened
  const fullScreenWindow = arrayedChildren.find((child) => child.props.fullScreen);

  if (fullScreenWindow) {
    return (
      <Box
        zIndex={1001}
        height="100%"
        sx={{
          width: '100%',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {cloneElement(fullScreenWindow, {width: '100%'})}
      </Box>
    );
  }

  let usedWidth = 0;
  const includedChildren: React.ReactElement<WindowProps>[] = [];
  const shownChildren: React.ReactElement<WindowProps>[] = [];

  for (let index = arrayedChildren.length - 1; index >= 0; index--) {
    const child = arrayedChildren[index];
    if (usedWidth + child.props.minSize * minColumnWidth > width) {
      break;
    }
    includedChildren.push(child);
    const innerwidth = child.props.minSize * columnWidth;
    //   shownChildren.push(cloneElement(child, {width: innerwidth}));
    usedWidth += innerwidth;
  }

  usedWidth = 0;
  for (let index = includedChildren.length - 1; index >= 0; index--) {
    const child = includedChildren[index];
    const firstElement = index === includedChildren.length - 1;
    if (index === 0) {
      const innerwidth = Math.min(
        width - usedWidth,
        child.props.maxSize ? child.props.maxSize * columnWidth : child.props.minSize * columnWidth
      );

      if (innerWidth == 0) {
        continue;
      }

      shownChildren.push(
        cloneElement(child, {
          width: innerwidth,
          height: firstElement ? '100%' : child.props.height,
        })
      );
    } else {
      const innerwidth = child.props.minSize * columnWidth;
      shownChildren.push(
        cloneElement(child, {width: innerwidth, height: firstElement ? '100%' : child.props.height})
      );
      usedWidth += innerwidth;
    }
  }

  return (
    // <WindowContext.Provider value={{columnWidth: minColumnWidth}}>
    <Box
      zIndex={1001}
      height="100%"
      sx={{
        width: '100%',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: 0.75,
        position: 'absolute',
        py: 1,
      }}
    >
      {shownChildren}
    </Box>
    // </WindowContext.Provider>
  );
};

type WindowProps = {
  children?: React.ReactNode;
  show: boolean;
  height?: 'fit-content' | '50%' | '100%';
  onClose?: () => void;
  fullScreen?: boolean;
  minSize: number;
  maxSize?: number;
  maxColumns?: number; // Injected by WindowManager
  width?: number | string;
  id?: string;
  sx?: SxProps;
  priority: number;
  mobilePriority?: number;
};

const Window = ({
  children,
  show,
  onClose,
  fullScreen,
  width,
  height = 'fit-content',
  id,
  sx,
}: WindowProps) => {
  const {isMobile} = useBreakpoints();
  // const {isMonitor, isLaptop, isLargeLaptop} = useBreakpoints();
  //   const {columnWidth} = useWindowContext();
  //   if (!columnWidth) throw new Error('Window must be a child of WindowManager');
  if (!show) return null;

  let fullscreenprops = {};
  if (fullScreen) {
    fullscreenprops = {
      width: '100%',
      height: '100%',
      position: 'fixed',
      zIndex: 1200,
      top: 0,
    };
  }

  return (
    <Box
      id={id}
      sx={{
        position: 'relative',
        pointerEvents: 'auto',
        bottom: 0,
        display: 'flex',
        borderRadius: 3,
        flexDirection: 'column',
        height: height,
        mt: isMobile ? 'auto' : undefined,
        width: isMobile ? undefined : width,
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'white',
        ...fullscreenprops,
        ...sx,
        // paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          cursor: 'pointer',
          color: 'white',
          //   padding: 1,
          display: 'flex',
          gap: 1,
        }}
      >
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box display="flex" height="100%" flexDirection={'column'} overflow="hidden">
        {children}
      </Box>
    </Box>
  );
};

WindowManager.Window = Window;
export default WindowManager;
