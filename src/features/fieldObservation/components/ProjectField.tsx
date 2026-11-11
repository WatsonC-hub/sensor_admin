import {Autocomplete, TextField} from '@mui/material';
import React, {useMemo} from 'react';

import type {LocalObservation, Project} from '~/features/fieldObservation/types';

type Props = {
  projects: Project[];
  observations: LocalObservation[];
  value: string | null;
  onChange: (projectNo: string | null) => void;
};

/**
 * Picks the projekt to work in. The options are the projekter the user can edit,
 * plus any projekt that already has feltobservationer on the device.
 */
const ProjectField = ({projects, observations, value, onChange}: Props) => {
  const titles = useMemo(
    () => new Map(projects.map((project) => [project.project_no, project.project_title])),
    [projects]
  );
  const options = useMemo(() => {
    const projectNos = new Set(projects.map((project) => project.project_no));
    for (const observation of observations) {
      if (observation.project_no) projectNos.add(observation.project_no);
    }
    return [...projectNos].sort();
  }, [projects, observations]);

  const label = (projectNo: string) => {
    const title = titles.get(projectNo);
    return title ? `${projectNo} – ${title}` : projectNo;
  };

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      onChange={(_event, projectNo) => onChange(projectNo)}
      getOptionLabel={label}
      noOptionsText="Ingen projekter"
      sx={{flex: 1, minWidth: 0}}
      renderInput={(params) => (
        <TextField {...params} placeholder="Projektnummer – alle projekter" />
      )}
    />
  );
};

export default ProjectField;
