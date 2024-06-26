import {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';

export const useSearchParam = (param: string, default_value?: string) => {
  const navigate = useNavigate();
  const {search} = useLocation();

  const [searchParam, setSearchParam] = useState(
    new URLSearchParams(window.location.search).get(param) || (default_value ?? null)
  );

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get(param) === null) {
      setParam(default_value ?? null);
    }
  }, []);

  const setParam = (value: string | null) => {
    setSearchParam(value);
    const searchParams = new URLSearchParams(window.location.search);
    if (value !== '' && value !== null && value !== undefined) {
      searchParams.set(param, value);
    } else {
      searchParams.delete(param);
    }

    if (searchParams.toString() === '') {
      const newUrl = window.location.pathname;
      //   window.history.replaceState({}, '', newUrl);
      navigate(newUrl, {replace: true});
      return;
    }

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, {replace: true});
  };

  useEffect(() => {
    const innerSearchParam = new URLSearchParams(search).get(param);

    setSearchParam(innerSearchParam);
  }, [search, param]);

  return [searchParam, setParam] as const;
};
