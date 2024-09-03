import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {Collapse, List, ListItemText, Typography} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import type {
  MultiSelectProps,
  Ressourcer,
} from '~/features/stamdata/components/stationDetails/multiselect/types';

interface CheckboxesTagsProps extends MultiSelectProps {
  value: Array<Ressourcer>;
  setValue: (value: Array<Ressourcer>) => void;
}

export default function CheckboxesTags({value, setValue, onBlur, ...props}: CheckboxesTagsProps) {
  const params = useParams();
  const loc_id = params.locid;
  const [selected, setSelected] = useState(value);
  const {
    get: {data: options},
    post: postRessourcer,
    relation: {data: related},
  } = useRessourcer(parseInt(loc_id!));

  const {
    trigger,
    watch,
    formState: {errors},
  } = useFormContext();

  const [collapsed, setCollapsed] = useState<Array<string>>([]);

  const ressourcer = watch('ressourcer');

  useEffect(() => {
    console.log(value);
    if (value && value.length > 0) {
      setSelected(value);
    }
  }, [value]);

  useEffect(() => {
    if (value && options && options.length > 0 && !related) {
      // if (value.length === 0) {
      //   // const test = options.filter(
      //   //   (ressource) =>
      //   //     (ressource.loctype_id && ressource.loctype_id.includes(loctype_id)) ||
      //   //     (ressource.tstype_id && ressource.tstype_id.includes(tstype_id))
      //   // );
      // }
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
    console.log(result);
    console.log(errors);
    console.log(ressourcer);
    if (ressourcer && result) {
      console.log(ressourcer);
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
        <>
          <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={
              (options && options.sort((a, b) => b.kategori.localeCompare(a.kategori))) ?? []
            }
            value={selected ?? []}
            filterSelectedOptions
            groupBy={(option) => option.kategori}
            renderGroup={({key, group, children}) => {
              console.log(children);
              return (
                <>
                  <ListItemText id={key} onClick={() => handleClick(group)}>
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
                    <li {...props}>
                      <Collapse
                        key={group}
                        in={collapsed.includes(group)}
                        timeout="auto"
                        unmountOnExit
                      >
                        {children}
                      </Collapse>
                    </li>
                  </List>
                </>
              );
            }}
            disableCloseOnSelect
            getOptionLabel={(option) => option.navn}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            // renderOption={(props, option, {selected}) => (
            //   <List
            //     disablePadding
            //     dense
            //     component="div"
            //     role="list"
            //     sx={{bgcolor: 'Background.paper'}}
            //   >
            //     <li {...props}>
            //       <Collapse
            //         key={option.kategori}
            //         in={collapsed.includes(option.kategori)}
            //         timeout="auto"
            //         unmountOnExit
            //       >
            //         <Checkbox
            //           icon={icon}
            //           checkedIcon={checkedIcon}
            //           style={{marginRight: 8}}
            //           checked={selected}
            //         />
            //         {option.navn}
            //       </Collapse>
            //     </li>
            //   </List>
            // )}
            style={{maxWidth: 500}}
            renderInput={(params) => (
              <TextField onBlur={onBlur} {...params} label="Huskeliste" placeholder="Udvalgt" />
            )}
            onChange={(event, newValue) => {
              setSelected(newValue);
              setValue(newValue);
            }}
            {...props}
          />
          <Button bttype="primary" onClick={handleSave} sx={{mt: 5}}>
            Gem huskeliste
          </Button>
        </>
      )}
    </>
  );
}
