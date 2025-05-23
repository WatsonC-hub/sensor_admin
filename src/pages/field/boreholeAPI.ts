import axios from 'axios';

const searchEndpoint = `https://watsonc.admin.gc2.io/api/v2/elasticsearch/search/jupiter/chemicals/boreholes_time_series_without_chemicals_view`;

type SearchPayload = {
  query: {
    bool: {
      must: {
        query_string: {
          query: string;
        };
      };
    };
  };
};

const postElasticSearch = (search: SearchPayload) => {
  return axios.post(`${searchEndpoint}`, search);
};

export {postElasticSearch};
