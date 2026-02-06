import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Box, Collapse, Divider, Typography} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import {useEffect, useState} from 'react';

import Button from '~/components/Button';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import type {
  MultiSelectProps,
  Ressourcer,
} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import {CategoryType} from '~/helpers/EnumHelper';

function not(a: Ressourcer[], b: Ressourcer[]) {
  return a.filter((value) => b.map((option) => option.navn).indexOf(value.navn) === -1);
}

function intersection(a: Ressourcer[], b: Ressourcer[]) {
  return a.filter((value) => b.map((option) => option.navn).indexOf(value.navn) !== -1);
}

function categoryNot(a: Array<Ressourcer>, b: Array<Ressourcer>) {
  const categoriesA = [...new Set(a.map((ressource) => ressource.kategori))];
  const result = [
    ...new Set(
      categoriesA.filter((category) => {
        const aFiltered = a.filter((ressource) => ressource.kategori === category);
        const bFiltered = b.filter((ressource) => ressource.kategori === category);

        const removeCategory = aFiltered.filter(
          (ressource) => bFiltered.includes(ressource) && aFiltered.length - bFiltered.length === 0
        );
        return removeCategory.length === 0;
      })
    ),
  ];
  return result;
}

interface TransferListProps extends MultiSelectProps {
  loc_id: number | undefined;
  value: Array<Ressourcer>;
  setValue: (ressourcer: Array<Ressourcer>) => void;
}

export default function TranserList({loc_id, value, setValue}: TransferListProps) {
  const [checked, setChecked] = useState<Ressourcer[]>([]);
  const [selected, setSelected] = useState<Ressourcer[]>(value ?? []);
  const [selectedCategory, setSelectedCategory] = useState<Array<string>>([]);
  const [categories] = useState<Array<string>>(
    Object.keys(CategoryType).splice(
      Object.keys(CategoryType).length / 2,
      Object.keys(CategoryType).length
    )
  );
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';
  const [collapsed, setCollapsed] = useState<Array<string>>([]);
  const {
    get: {data: options},
    post: postRessourcer,
    relation: {data: related},
  } = useRessourcer();

  useEffect(() => {
    if (value && value.length > 0) {
      setSelected(value);
      setSelectedCategory([...new Set(value.map((ressource) => ressource.kategori))]);
    }
  }, [value]);

  useEffect(() => {
    if (value && options && options.length > 0) {
      setSelectedCategory([...new Set([...value.map((ressource) => ressource.kategori)])]);
      setSelected(value);
    }
  }, [options, value]);

  useEffect(() => {
    if (related && related.length > 0) {
      setSelectedCategory([...new Set([...related.map((ressource) => ressource.kategori)])]);
      setSelected(related);
    }
  }, [related]);

  let left: Array<Ressourcer> = [];
  if (options) left = not(options ?? [], selected ?? []);
  const leftCategory =
    options && selected
      ? [
          ...new Set(
            options
              .filter(
                (ressource) => selected.map((option) => option.navn).indexOf(ressource.navn) === -1
              )
              .map((ressource) => ressource.kategori)
          ),
        ]
      : [];

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, selected ?? []);

  const handleToggle = (ressource: Ressourcer) => () => {
    const currentIndex = checked.map((option) => option.id).indexOf(ressource.id);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(ressource);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setSelected(selected.concat(leftChecked));
    setValue(selected.concat(leftChecked));
    setChecked(not(checked, leftChecked));
    setSelectedCategory([
      ...new Set(selectedCategory.concat(leftChecked.map((ressource) => ressource.kategori))),
    ]);
    if (loc_id !== undefined) handleSave(selected.concat(leftChecked));
  };

  const handleCheckedLeft = () => {
    setSelected(not(selected, rightChecked));
    setValue(not(selected, rightChecked));
    setChecked(not(checked, rightChecked));
    setSelectedCategory(categoryNot(selected, rightChecked));
    if (loc_id !== undefined) handleSave(not(selected, rightChecked));
  };

  const handleSave = async (ressourcer: Array<Ressourcer>) => {
    const payload = {
      path: `${loc_id}`,
      data: {
        ressourcer: ressourcer,
      },
    };
    postRessourcer.mutate(payload);
  };

  const handleClick = (collapsedCategory: string) => {
    if (!collapsed.includes(collapsedCategory)) {
      setCollapsed([...collapsed, collapsedCategory]);
    } else {
      setCollapsed([...collapsed.filter((category) => category !== collapsedCategory)]);
    }
  };

  const customList = (items: Ressourcer[], categoryList: Array<string>, title: string) => {
    return (
      <Paper sx={{width: 300, boxShadow: 3}}>
        <Box display={'flex'} flexDirection={'column'}>
          <Typography align="center" variant="h5" m={0.5}>
            {title}
          </Typography>
          <Divider />
          {options && options.length > 0 && (
            <List
              disablePadding
              dense
              component="div"
              role="list"
              sx={{
                bgcolor: 'Background.paper',
                height: 400,
                overflow: 'auto',
                scrollbarGutter: 'stable',
              }}
            >
              {categoryList &&
                categoryList.length > 0 &&
                categoryList
                  .sort((a, b) => {
                    const order = [];
                    for (const key in CategoryType) {
                      order.push(key);
                    }
                    const index1 = order.indexOf(a);
                    const index2 = order.indexOf(b);
                    return index1 - index2;
                  })
                  .map((category) => {
                    const filteredRessources = items.filter(
                      (ressource) => ressource.kategori === category
                    );
                    const labelId = `transfer-list-item-${category}-label`;
                    return (
                      <Box gap={0} display={'flex'} flexDirection={'column'} key={category + 'box'}>
                        <ListItemText
                          id={labelId}
                          onClick={() => !disabled && handleClick(category)}
                        >
                          <Typography
                            ml={2}
                            fontWeight={'bold'}
                            display={'flex'}
                            flexDirection={'row'}
                            justifyContent={'space-between'}
                          >
                            {category}
                            {title !== 'Udvalgt' && (
                              <>{collapsed.includes(category) ? <ExpandLess /> : <ExpandMore />}</>
                            )}
                          </Typography>
                        </ListItemText>
                        <List component="li" disablePadding key={category}>
                          <Collapse
                            key={category}
                            in={title === 'Udvalgt' || collapsed.includes(category)}
                            timeout="auto"
                            unmountOnExit
                          >
                            {filteredRessources.map((ressource) => {
                              const labelId = `transfer-list-item-${ressource.navn}-label`;
                              return (
                                <ListItemButton
                                  key={ressource.navn}
                                  role="listitem"
                                  onClick={handleToggle(ressource)}
                                  sx={{'&:hover': {bgcolor: 'grey.200'}, py: 0.0}}
                                >
                                  <ListItemIcon sx={{mr: -1.5}} key={ressource.id}>
                                    <Checkbox
                                      checked={
                                        checked
                                          .map((option) => option.navn)
                                          .indexOf(ressource.navn) !== -1
                                      }
                                      tabIndex={-1}
                                      disableRipple
                                      inputProps={{
                                        'aria-labelledby': labelId,
                                      }}
                                    />
                                  </ListItemIcon>
                                  <ListItemText id={labelId} primary={ressource.navn} />
                                </ListItemButton>
                              );
                            })}
                          </Collapse>
                        </List>
                      </Box>
                    );
                  })}
            </List>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <>
      {options && options.length > 0 && categories && categories.length > 0 && (
        <Box my={1} gap={1} display={'flex'} flexDirection={'row'} justifyContent="center">
          {customList(left ?? [], leftCategory ?? [], 'Valgbare')}
          <Box display={'flex'} flexDirection="column" justifyContent="center">
            <Button
              sx={{my: 0.5}}
              bttype="secondary"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0 || disabled}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{my: 0.5}}
              bttype="secondary"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0 || disabled}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Box>
          {customList(selected ?? [], selectedCategory ?? [], 'Udvalgt')}
        </Box>
      )}
    </>
  );
}
