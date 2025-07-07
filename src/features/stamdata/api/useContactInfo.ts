import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {ContactInfo, ContactTable} from '~/types';

interface ContactInfoBase {
  path: string;
}

interface ContactInfoPost extends ContactInfoBase {
  data: ContactInfo;
}

interface ContactInfoPut extends ContactInfoBase {
  data: ContactTable;
}

const contactInfoPostOptions = {
  mutationKey: ['contact_info_post'],
  mutationFn: async (mutation_data: ContactInfoPost) => {
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
    queryKey: [queryKeys.Location.contacts(loc_id)],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<ContactTable>>(
        `/sensor_field/stamdata/contact/contact_info/${loc_id}`
      );

      return data;
    },
    enabled: loc_id !== undefined && loc_id !== null,
  });

export const useSearchContact = (loc_id: number | undefined, searchString: string) => {
  const searched_contacts = useQuery({
    queryKey: [queryKeys.Location.searchContacts(searchString)],
    queryFn: async () => {
      let data;
      if (searchString == '') {
        const response = await apiClient.get<Array<ContactInfo>>(
          `/sensor_field/stamdata/contact/relevant_contacts/${loc_id}`
        );
        data = response.data;
      } else {
        const response = await apiClient.get<Array<ContactInfo>>(
          `/sensor_field/stamdata/contact/search_contact_info/${searchString}`
        );
        data = response.data;
      }

      return data;
    },
    staleTime: 10 * 1000,
  });
  return searched_contacts;
};

export const useContactInfo = (loc_id: number) => {
  const queryClient = useQueryClient();
  const get = useQuery(ContactInfoGetOptions(loc_id));

  const post = useMutation({
    ...contactInfoPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Location.contacts(loc_id)],
      });

      toast.success('Kontakt information gemt');
    },
  });

  const put = useMutation({
    ...contactInfoPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Location.contacts(loc_id)],
      });

      toast.success('Kontakt information ændret');
    },
  });

  const del = useMutation({
    ...contactInfoDelOptions,
    onSuccess: () => {
      toast.success('Kontakt information slettet');
      queryClient.invalidateQueries({
        queryKey: [queryKeys.Location.contacts(loc_id)],
      });
    },
  });

  return {get, post, put, del};
};
