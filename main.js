const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const parse = require('url').parse;
const remote = electron.remote;
//import axios from 'axios'
//import qs from 'qs'
const qs = require('qs');
const fetch = require('node-fetch');

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
const GOOGLE_PROFILE_URL = 'https://www.googleapis.com/userinfo/v2/me'
const GOOGLE_REDIRECT_URI = 'https://localhost'
const GOOGLE_CLIENT_ID = '623591274072-kvu1ue0tq9oabke17r80itgpbam81i5f.apps.googleusercontent.com'

let mainWindow

function googleSignIn () {
  getAuthCodeViaSignInFlow()
    .then(fetchAccessTokens);

    /*
  const tokens = await fetchAccessTokens(code)
  const {id, email, name} = await fetchGoogleProfile(tokens.access_token)
  const providerUser = {
    uid: id,
    email,
    displayName: name,
    idToken: tokens.id_token,
  }

  return mySignInFunction(providerUser)
  */
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
    .then(resp => resp.json())
    .then(body => {
      console.log('Got token', body);
      return body;
    });
}

function getAuthCodeViaSignInFlow () {
  return new Promise((resolve, reject) => {
    mainWindow = new BrowserWindow({width: 500, height: 600});

    const urlParams = {
      response_type: 'code',
      redirect_uri: GOOGLE_REDIRECT_URI,
      client_id: GOOGLE_CLIENT_ID,
      scope: 'profile email',
    }
    const authUrl = `${GOOGLE_AUTHORIZATION_URL}?${qs.stringify(urlParams)}`

    function handleNavigation (url) {
      console.log('redirecting to', url);
      const query = parse(url, true).query
      if (query) {
        if (query.error) {
          reject(new Error(`There was an error: ${query.error}`))
        } else if (query.code) {
          // This is the authorization code we need to request tokens
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
  console.log('bye');
  app.quit();
});