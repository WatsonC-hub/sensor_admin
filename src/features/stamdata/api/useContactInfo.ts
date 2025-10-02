import {useQuery, useMutation, queryOptions, MutationOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {ContactInfo, ContactTable} from '~/types';
import {InferContactInfo} from '../components/stationDetails/zodSchemas';

interface ContactInfoBase {
  path: string;
}

interface ContactInfoPost extends ContactInfoBase {
  data: InferContactInfo;
}

interface ContactInfoPut extends ContactInfoBase {
  data: ContactTable;
}

const contactInfoPostOptions: MutationOptions<any, APIError, ContactInfoPost> = {
  mutationKey: ['contact_info_post'],
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_field/stamdata/contact/contact_info/${path}`,
      data
    );
    return result;
  },
};

const contactInfoPutOptions = {
  mutationKey: ['contact_info_put'],
  mutationFn: async (mutation_data: ContactInfoPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(
      `/sensor_field/stamdata/contact/contact_info/${path}`,
      data
    );
    return result;
  },
};

const contactInfoDelOptions = {
  mutationKey: ['contact_info_del'],
  mutationFn: async (mutation_data: ContactInfoBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(
      `/sensor_field/stamdata/contact/contact_info/${path}`
    );
    return result;
  },
};

export const ContactInfoGetOptions = (loc_id: number) =>
  queryOptions<Array<ContactTable>, APIError>({
    queryKey: queryKeys.Location.contacts(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<ContactTable>>(
        `/sensor_field/stamdata/contact/contact_info/${loc_id}`
      );

      return data;
    },
    enabled: loc_id !== undefined && loc_id !== null,
  });

export const useSearchContact = <T = ContactInfo[]>(
  loc_id: number | undefined,
  searchString: string,
  select?: (data: ContactInfo[]) => T
) => {
  const searchEndpoint = `/sensor_field/stamdata/contact/search_contact_info/${searchString}`;
  const relevantContactsEndpoint = `/sensor_field/stamdata/contact/relevant_contacts/${loc_id}`;

  const searched_contacts = useQuery({
    queryKey: queryKeys.Location.searchContacts(searchString),
    queryFn: async () => {
      let data;
      if (searchString == '') {
        const response = await apiClient.get<Array<ContactInfo>>(relevantContactsEndpoint);
        data = response.data;
      } else {
        const response = await apiClient.get<Array<ContactInfo>>(searchEndpoint);
        data = response.data;
      }

      return data;
    },
    staleTime: 10 * 1000,
    select,
  });
  return searched_contacts;
};

export const useContactInfo = (loc_id: number) => {
  const get = useQuery(ContactInfoGetOptions(loc_id));

  const post = useMutation({
    ...contactInfoPostOptions,
    meta: {
      invalidates: [['metadata']],
    },
  });

  const put = useMutation({
    ...contactInfoPutOptions,
    onSuccess: () => {
      toast.success('Kontakt information ændret');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  const del = useMutation({
    ...contactInfoDelOptions,
    onSuccess: () => {
      toast.success('Kontakt information slettet');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });

  return {get, post, put, del};
};
