import React from "react";
import axios from "axios";

const login = ({ email, password }) => {
  let sessionUrl = "https://watsonc.admin.gc2.io/api/v2/session/start";
  let _loginData = {
    user: email,
    password: password,
    schema: null,
  };
  axios.post(sessionUrl, _loginData);
};

const logout = () => {
  let sessionUrl = "https://watsonc.admin.gc2.io/api/v2/session/stop";
  return axios.get(sessionUrl);
};

const getToken;
