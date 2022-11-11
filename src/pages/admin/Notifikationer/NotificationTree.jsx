import React, {useEffect, useState} from 'react';
import {TreeView, TreeItem} from '@mui/lab';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  PriorityHighOutlined,
  ErrorOutlineOutlined,
} from '@mui/icons-material';
import _ from 'lodash';
import {Box, Button, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {atom, useAtom} from 'jotai';

const expandedAtom = atom([]);
const typeAheadAtom = atom('');

const NotificationTree = ({notifications}) => {
  const [expanded, setExpanded] = useAtom(expandedAtom);
  const [typeAhead, settypeAhead] = useAtom(typeAheadAtom);

  var rows = [];
  // filter data based on typeAhead and columns
  if (notifications) {
    rows = notifications.filter((row) => {
      return Object.keys(row).some((column) => {
        return row[column].toString().toLowerCase().indexOf(typeAhead.toLowerCase()) > -1;
      });
    });
  }
  const navigate = useNavigate();
  const locations = _.sortBy(_.uniqBy(rows, 'locid'), 'locname');
  const stations = _.sortBy(_.uniqBy(rows, 'stationid'), 'stationname');

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };
  const handleExpandClick = () => {
    setExpanded((oldExpanded) =>
      oldExpanded.length === 0
        ? stations
            .map((elem) => elem.stationid.toString() + elem.locid.toString())
            .concat(locations.map((elem) => elem.locid.toString()))
        : []
    );
  };

  useEffect(() => {
    if (notifications?.length < 20) {
      setExpanded(
        stations
          .map((elem) => elem.stationid.toString() + elem.locid.toString())
          .concat(locations.map((elem) => elem.locid.toString()))
      );
    }
  }, [notifications]);

  return (
    <Box sx={{height: '80vh', overflowY: 'auto'}} p={2}>
      <TextField
        variant="outlined"
        label={'Filtrer notifikationer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
      />
      <Box sx={{mb: 1}}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button>
      </Box>
      <TreeView
        aria-label="controlled"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        defaultExpanded={['1']}
        expanded={expanded}
        selected={[]}
        onNodeToggle={handleToggle}
        onNodeSelect={() => {}}
      >
        {locations?.map((location) => {
          return (
            <TreeItem
              nodeId={location.locid.toString()}
              label={location.locname}
              key={location.locid}
              sx={{fontWeight: 'bold', '.MuiTreeItem-label': {fontWeight: 'bold'}}}
            >
              {stations
                ?.filter((station) => station.locid === location.locid)
                .map((station) => {
                  return (
                    <TreeItem
                      nodeId={station.stationid.toString() + station.locid.toString()}
                      label={station.stationname}
                      key={station.stationid.toString() + station.locid.toString()}
                      sx={{
                        borderLeft: '2px dashed',
                        borderColor: 'primary.main',
                        '.MuiTreeItem-label': {fontWeight: 'bold'},
                      }}
                    >
                      {rows

                        ?.filter((notification) => notification.stationid === station.stationid)
                        .sort((a, b) => b.flag - a.flag)
                        .map((notification) => {
                          return (
                            <Box
                              key={notification.id}
                              sx={{
                                borderLeft: '2px dashed',
                                borderLeftColor: 'primary.main',
                                cursor: 'pointer',
                              }}
                              p={1}
                              flexDirection="row"
                              display="flex"
                              onClick={() => {
                                navigate(notification.navigateTo);
                              }}
                            >
                              <ErrorOutlineOutlined sx={{color: notification.color}} />
                              <Typography>{notification.opgave}</Typography>
                              <Typography>{notification.dato}</Typography>
                            </Box>
                          );
                        })}
                    </TreeItem>
                  );
                })}
            </TreeItem>
          );
        })}
      </TreeView>
    </Box>
  );
};

export default NotificationTree;
