# Greatest

## Starting
### Configuration
#### Environment variables
You can specify env variables in a `.env` file placed in the repo root
```dotenv
BACKEND_PORT=5000
BASE_URL=http://localhost:5000 # used for Google login redirect
TRAEFIK_HOST=example.com
QR_ORIGIN=https://example.com:1234
ALLOW_DEMO_LOGIN=false # true | false
```
#### Additional files
##### `google-keys.json` - Google OAuth2.0 Client ID
Create your own at https://console.cloud.google.com/apis/credentials.
Pick the **Web Application** type and specify `BASE_URL/auth/google-callback` as a redirect URI (using the `BASE_URL` from above)

##### `session-key` - secret for [fastify-secure-session](https://github.com/fastify/fastify-secure-session)
You can generate one using this command:
```shell
./backend/node_modules/.bin/secure-session-gen-key > session-key
```
Please see this if you are using windows: https://github.com/fastify/fastify-secure-session/issues/87

### Development
Start Quasar dev mode:
```shell
cd website
npm run dev
```
Start server:
```shell
docker compose -f ./docker-compose.yml -f ./docker-compose.development.yml up --build
```
Your local Quasar development server (running on port 5002) will be proxied by the backend server. This way you can take advantage of hot reload, while the API is on the same port (needed mainly for cookies).

### Production
```shell
docker compose -f ./docker-compose.yml -f ./docker-compose.production.yml up --build
```

### Production with Traefik
```shell
docker compose -f ./docker-compose.yml -f ./docker-compose.production.yml -f ./docker-compose.traefik.yml up --build
```

## Docs
The API is documented using Swagger. Open https://greatest.dominik-korsa.tk/api/docs to see the docs.

## Implemented features
- Google login system
- Demo accounts
- Question set creation and editing
- Test composing
- Sheet list
- Sheet generation and printing
- Scan list, uploading, barcode scanning and assigning to sheets
- Grading
- Exposed API
- API token management
- Student view
- Translations (currently supported Polish and English)

## Planned features
- Automatic answer recognition in quiz questions
- Rich content questions (images, math expressions, code, etc.)
- QR code redirection after scanning via mobile device
- Question list
- Explainers/usage guides
- Improved navigation
- Total points list in sheet list
- Results export to CSV
- Questions stats among class (for students and teachers)
- Answer comments, instead of just number of points (potentialy as chat)
- Marking comments directly on scans
- Exporting prints as PDF
- School grade calculator based on points
