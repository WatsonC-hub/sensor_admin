import {ChevronRight as ChevronRightIcon, ExpandMore as ExpandMoreIcon} from '@mui/icons-material';
import {TreeItem, TreeView} from '@mui/lab';
import {Box, Button} from '@mui/material';
import {atom, useAtom} from 'jotai';
import {groupBy, map, maxBy, sortBy, uniqBy} from 'lodash';
import moment from 'moment';
import React, {useEffect} from 'react';

import NotificationRow from '~/pages/admin/notifikationer/NotificationRow';

const expandedAtom = atom([]);
const typeAheadAtom = atom('');

const NotificationTree = ({notifications, statusMutate, trelloMutate}) => {
  const [expanded, setExpanded] = useAtom(expandedAtom);
  // const [typeAhead, settypeAhead] = useAtom(typeAheadAtom);

  var rows = [];
  // filter data based on typeAhead and columns
  if (notifications) {
    const grouped = groupBy(notifications, (item) => {
      return [item['stationid'], item['notification_id']];
    });

    rows = map(grouped, (group) => {
      return maxBy(group, (item) => (item.dato ? new Date(item.dato) : Number.NEGATIVE_INFINITY));
    });
  }

  const locations = sortBy(uniqBy(rows, 'locid'), 'locname');
  const stations = sortBy(uniqBy(rows, 'stationid'), 'stationname');

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
    <Box sx={{height: '100%', overflowY: 'auto'}} pt={2}>
      {/* <TextField
        variant="outlined"
        label={'Filtrer notifikationer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
      /> */}
      <Box sx={{mb: 1}}>
        <Button onClick={handleExpandClick}>
          {expanded.length === 0 ? 'Fold ud' : 'Fold sammen'}
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
              sx={{fontWeight: 'bold', width: '98%', '.MuiTreeItem-label': {fontWeight: 'bold'}}}
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
                            <NotificationRow
                              key={notification.id}
                              notification={notification}
                              onPostpone={(date) =>
                                statusMutate.mutate([
                                  {
                                    ts_id: notification.stationid,
                                    notification_id: notification.notification_id,
                                    status: 'POSTPONED',
                                    enddate: moment(date).format('YYYY-MM-DDTHH:mm'),
                                  },
                                ])
                              }
                              onIgnore={(enddate) =>
                                statusMutate.mutate([
                                  {
                                    ts_id: notification.stationid,
                                    notification_id: notification.notification_id,
                                    status: 'IGNORED',
                                    enddate: enddate,
                                  },
                                ])
                              }
                              onSchedule={(description) => {
                                trelloMutate.mutate([{...notification, description}]);
                                statusMutate.mutate([
                                  {
                                    ts_id: notification.stationid,
                                    notification_id: notification.notification_id,
                                    status: 'SCHEDULED',
                                    enddate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                                  },
                                ]);
                              }}
                            />
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
