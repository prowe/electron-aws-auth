const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const parse = require('url').parse;
const remote = electron.remote;
const qs = require('qs');
const fetch = require('node-fetch');

var AWS = require('aws-sdk');


const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_REDIRECT_URI = 'https://localhost'
const GOOGLE_CLIENT_ID = getFromEnvOrDie('GOOGLE_CLIENT_ID');
const ROLE_ARN = getFromEnvOrDie('ROLE_ARN');

let mainWindow

function googleSignIn () {
  getAuthCodeViaSignInFlow()
    .then(fetchAccessTokens)
    .then(generateTemporaryAWSCredentials)
    .then(printExportCommand)
    .then(d => app.quit(0))
    .catch(e => {
      console.error('error', e);
      app.quit(1);
    });
}

function generateTemporaryAWSCredentials(tokenResponse) {
  console.error('Attempting to obtain AWS credentials using', tokenResponse);
  const sts = new AWS.STS();
  return sts.assumeRoleWithWebIdentity({
    RoleArn: ROLE_ARN,
    RoleSessionName: 'electron-elevation',
    WebIdentityToken: tokenResponse.id_token
  }).promise();
}

function fetchAccessTokens (code) {
  return fetch(GOOGLE_TOKEN_URL, {
      method: 'post', 
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: qs.stringify({
        code: code,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      })
    })
    .then(resp => resp.json());
}

function getAuthCodeViaSignInFlow () {
  return new Promise((resolve, reject) => {
    console.error('attempting to obtain OAuth token using client id: ', GOOGLE_CLIENT_ID);
    mainWindow = new BrowserWindow({width: 500, height: 600});

    const urlParams = {
      response_type: 'code',
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email',
    }
    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

    function handleNavigation (url) {
      const query = parse(url, true).query
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`))
        } else if (query.code) {
          resolve(query.code)
        }
      }
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })

    mainWindow.webContents.on('will-navigate', (event, url) => {
      handleNavigation(url);
    })

    mainWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
      handleNavigation(newUrl);
    })

    mainWindow.loadURL(authUrl);
  })
}

app.on('ready', googleSignIn);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  app.quit();
});

function getFromEnvOrDie(key) {
  const value = process.env[key];
  if(!value) {
    console.error(`environment variable '${key}' not set`);
    app.quit(1);
  }
  return value;
}

function printExportCommand(stsReponse) {
  const creds = stsReponse.Credentials;
  console.log(`export AWS_ACCESS_KEY_ID='${creds.AccessKeyId}'`);
  console.log(`export AWS_SECRET_ACCESS_KEY='${creds.SecretAccessKey}'`);
  console.log(`export AWS_SESSION_TOKEN='${creds.SessionToken}'`);
}