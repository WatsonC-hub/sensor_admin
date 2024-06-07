import {Box, TextField} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {authStore} from '~/state/store';

import {loginAPI} from '../api/fieldApi';

export default function LoginForm() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [setAuthenticated, setLoginExpired, setAuthorization] = authStore((state) => [
    state.setAuthenticated,
    state.setLoginExpired,
    state.setAuthorization,
  ]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginAPI(userName.toLowerCase().trim(), password)
      .then((res) => {
        setLoginError('');
        setAuthorization(res.data);
        setAuthenticated(true);
        setLoginExpired(false);
      })
      .catch((err) => {
        console.log(err);
        setLoginError(err.response.data.detail);
      });
  };

  return (
    <Box>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          autoFocus
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          onChange={(e) => setUserName(e.target.value)}
          error={!!loginError}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          error={!!loginError}
          helperText={!!loginError && loginError}
        />
        <Button
          type="submit"
          fullWidth
          bttype="primary"
          disabled={userName === '' || password === ''}
          style={{marginTop: '1%'}}
        >
          Log på
        </Button>
      </form>
    </Box>
  );
}
