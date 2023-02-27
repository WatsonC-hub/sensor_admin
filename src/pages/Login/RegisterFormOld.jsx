import React from 'react';

const RegisterForm = () => {
  return (
    <Container fixed maxWidth="sm">
      <form onSubmit={handleOpret} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="firstName"
          label="Fornavn"
          name="firstName"
          autoComplete="firstName"
          autoFocus
          onChange={(e) => setFirstName(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="lastName"
          label="Efternavn"
          name="lastName"
          autoComplete="lastName"
          onChange={(e) => setLastName(e.target.value)}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => setEmailErr(!validateEmail(email))}
          error={emailErr}
          helperText={emailErr ? 'Din email er ugyldig' : ''}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="cvr"
          label="CVR"
          name="cvr"
          autoComplete="cvr"
          error={isSuccess === false && isFetched === true}
          helperText={isSuccess === false && isFetched === true ? 'CVR blev ikke fundet' : ''}
          onChange={(e) => setCvr(e.target.value.trim())}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={checkedTerms.checked}
              onChange={handleChangeTerms}
              name="checkedTerms"
              color="primary"
            />
          }
          label={
            <label>
              Jeg accepterer Calypsos{' '}
              <a href="https://watsonc.dk/privatlivspolitik/" target="_blank">
                vilkår
              </a>
            </label>
          }
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={checkedNews.checked}
              onChange={handleChangeNews}
              name="checkedNews"
              color="primary"
            />
          }
          label={<label>Jeg vil gerne modtage mails om nyheder i Calypso</label>}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleOpret}
          disabled={
            firstName === '' ||
            lastName === '' ||
            emailErr ||
            cvr.length !== 8 ||
            checkedTerms === false ||
            (isSuccess === false && isFetched === true)
          }
        >
          Opret konto
        </Button>
      </form>
    </Container>
  );
};

export default RegisterForm;
