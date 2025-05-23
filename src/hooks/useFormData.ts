import {useState} from 'react';

const computeInitialState = (initialState: any) => {
  if (Object.values(initialState).some((value) => typeof value === 'function')) {
    initialState = Object.entries(initialState).reduce((acc: any, [key, value]) => {
      acc[key] = typeof value === 'function' ? value() : value;
      return acc;
    }, {});
  }
  return initialState;
};

export default function useFormData(initialState: any) {
  // if any of the initial state values are functions, call them to get the initial state

  const [formData, setFormData] = useState(computeInitialState(initialState));

  const changeFormData = (key: string, value: any) => {
    setFormData({...formData, [key]: value});
  };

  const resetFormData = () => {
    setFormData(computeInitialState(initialState));
  };

  const setFormDataFromObject = (obj: any) => {
    setFormData(obj);
  };

  return [formData, setFormDataFromObject, changeFormData, resetFormData];
}
