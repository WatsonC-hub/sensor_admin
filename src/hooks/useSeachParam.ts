import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';

export const useSearchParam = (param: string) => {
  const navigate = useNavigate();
  const [searchParam, setSearchParam] = useState(
    new URLSearchParams(window.location.search).get(param)
  );

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

  const callback = (event) => {
    const url = new URL(event.destination.url);
    const search = url.searchParams.get(param);
    if (search) {
      // console.log('search', search, 'param', search, 'url', url.href);
      setSearchParam(search);
    }
  };
  useEffect(() => {
    window.navigation.addEventListener('navigate', callback);

    return () => {
      window.navigation.removeEventListener('navigate', callback);
    };
  }, []);

  return [searchParam, setParam] as const;
};
