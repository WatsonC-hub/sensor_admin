import {ExpandLess, ExpandMore, Save} from '@mui/icons-material';
import {Box, Collapse, List, ListItemText, Popper, Typography} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import type {
  MultiSelectProps,
  Ressourcer,
} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';

interface CheckboxesTagsProps extends MultiSelectProps {
  loc_id: number | undefined;
  value: Array<Ressourcer>;
  setValue: (value: Array<Ressourcer>) => void;
}

export default function CheckboxesTags({loc_id, value, setValue}: CheckboxesTagsProps) {
  const {
    get: {data: options},
    post: postRessourcer,
    relation: {data: related},
  } = useRessourcer();

  const [selected, setSelected] = useState<Array<Ressourcer> | undefined>(value);
  const {
    trigger,
    watch,
    formState: {isDirty},
  } = useFormContext();

  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const [collapsed, setCollapsed] = useState<Array<string>>([]);

  const ressourcer = watch('ressourcer');

  useEffect(() => {
    if (value && value.length > 0) {
      setSelected(value);
    }
  }, [value]);

  useEffect(() => {
    if (value && options && options.length > 0 && !related) {
      setSelected(value);
    }
  }, [options, value, related]);

  useEffect(() => {
    if (related && related.length > 0) {
      setSelected(related);
    }
  }, [related]);

  const handleSave = async () => {
    const result = await trigger('ressourcer');

    if (ressourcer && result) {
      const payload = {
        path: `${loc_id}`,
        data: {
          ressourcer: ressourcer,
        },
      };
      postRessourcer.mutate(payload);
    }
  };

  const handleClick = (collapsedCategory: string) => {
    if (!collapsed.includes(collapsedCategory)) {
      setCollapsed([...collapsed, collapsedCategory]);
    } else {
      setCollapsed(...[collapsed.filter((category) => category !== collapsedCategory)]);
    }
  };

  return (
    <>
      {options && options.length > 0 && (
        <Box display={'flex'} flexDirection={'column'}>
          <Autocomplete
            multiple
            disabled={disabled}
            id="checkboxes-tags-demo"
            options={
              (options && options.sort((a, b) => b.kategori.localeCompare(a.kategori))) ?? []
            }
            fullWidth
            value={selected}
            filterSelectedOptions
            groupBy={(option) => option.kategori}
            PopperComponent={(props) => <Popper {...props} placement="bottom" />}
            componentsProps={{
              popper: {
                modifiers: [
                  {
                    name: 'flip',
                    enabled: false,
                  },
                ],
              },
            }}
            renderGroup={({key, group, children}) => {
              return (
                <>
                  <ListItemText id={key.toString()} onClick={() => handleClick(group)}>
                    <Typography ml={2} fontWeight={'bold'} display={'flex'} flexDirection={'row'}>
                      {group}
                      <Typography>
                        <>{collapsed.includes(group) ? <ExpandMore /> : <ExpandLess />}</>
                      </Typography>
                    </Typography>
                  </ListItemText>
                  <List
                    disablePadding
                    dense
                    component="div"
                    role="list"
                    sx={{bgcolor: 'Background.paper'}}
                  >
                    <Collapse
                      key={group}
                      in={!collapsed.includes(group)}
                      timeout="auto"
                      unmountOnExit
                    >
                      {children}
                    </Collapse>
                  </List>
                </>
              );
            }}
            disableCloseOnSelect
            getOptionLabel={(option) => option.navn}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{
              minWidth: 300,
            }}
            renderInput={(params) => (
              <TextField {...params} label="Huskeliste" placeholder="Udvalgt" />
            )}
            onChange={(event, newValue: Ressourcer[]) => {
              setSelected(newValue);
              setValue(newValue);
            }}
          />
          {loc_id !== undefined && (
            <Box display={'flex'} flexDirection={'row'} justifyContent={'end'} gap={1} mt={2}>
              <UpdateProgressButton
                loc_id={loc_id}
                ts_id={-1}
                disabled={disabled || isDirty}
                progressKey="ressourcer"
              />
              <Button
                bttype="primary"
                disabled={disabled || !isDirty}
                onClick={handleSave}
                startIcon={<Save />}
              >
                Gem
              </Button>
            </Box>
          )}
        </Box>
      )}
    </>
  );
}
