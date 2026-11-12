# Sensors app

God app

## Development against the production login

Sign in through calypso-auth on admin.watsonc.dk instead of running calypso-auth locally. Its session cookie lives on `.watsonc.dk` and is `Secure`, so the dev server runs on https at `local.watsonc.dk`. Once per machine (Windows; on a Mac or Linux, edit `/etc/hosts` and install mkcert with your package manager):

1. In a PowerShell window run as administrator: `` Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n127.0.0.1 local.watsonc.dk" ``, then `ipconfig /flushdns`.
2. `winget install FiloSottile.mkcert`, then in a new terminal `mkcert -install`.
3. `mkdir $HOME\.watsonc-cert; cd $HOME\.watsonc-cert; mkcert local.watsonc.dk` (one certificate for every WatsonC app; `WATSONC_CERT_DIR` points elsewhere).

Then set `VITE_AUTH_URL=https://admin.watsonc.dk` in `.env.local`, and start python_api with `CALYPSO_AUTH_URL=https://admin.watsonc.dk` (the dev server proxies `/api` to it).

Field is then https://local.watsonc.dk:5174. Without the certificate the dev server runs on localhost as before. It is a real production session: signing out here signs you out everywhere. To work on a local calypso-auth, remove the auth URL settings above.
