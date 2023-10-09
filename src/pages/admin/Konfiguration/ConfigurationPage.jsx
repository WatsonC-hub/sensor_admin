import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

const ConfigurationPage = () => {
  const {data, isLoading, error} = useQuery(['configuration_options'], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/configuration_options`, {
      signal,
    });
    return data;
  });

  const {data: configurableUnits, isLoading: unitLoading} = useQuery(
    ['configurable_units'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/configurable_units`, {
        signal,
      });

      return data.map((row) => {
        return {
          ...row,
          navigateTo: row.ts_id.toString(),
        };
      });
    }
  );

  const columns = [
    {name: 'calypso_id', title: 'Calypso ID'},
    {name: 'terminal_id', title: 'Terminal ID'},
    {name: 'ts_name', title: 'Stationsnavn'},
    {name: 'send_interval', title: 'Sendeinterval [min]'},
    {name: 'sample_interval', title: 'Måleinterval [min]'},
  ];

  return (
    <Box>
      {/* {data?.map((item) => {
        return <OptionsForm name={item.name} options={item.options} />;
      })} */}
      {/* <TableComponent data={configurableUnits} loading={unitLoading} columns={columns} />; */}
      Under udvikling
    </Box>
  );
};

export default ConfigurationPage;
