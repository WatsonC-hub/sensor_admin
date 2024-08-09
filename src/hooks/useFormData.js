import {useState} from 'react';

const computeInitialState = (initialState) => {
  if (Object.values(initialState).some((value) => typeof value === 'function')) {
    initialState = Object.entries(initialState).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'function' ? value() : value;
      return acc;
    }, {});
  }
  return initialState;
};

export default function useFormData(initialState) {
  // if any of the initial state values are functions, call them to get the initial state

  const [formData, setFormData] = useState(computeInitialState(initialState));

  const changeFormData = (key, value) => {
    setFormData({...formData, [key]: value});
  };

  const resetFormData = () => {
    setFormData(computeInitialState(initialState));
  };

  const setFormDataFromObject = (obj) => {
    setFormData(obj);
  };

  return [formData, setFormDataFromObject, changeFormData, resetFormData];
}
