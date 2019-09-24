import React, { useState } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import {
  Authenticator,
  Greetings,
  ConfirmSignIn,
  SignUp,
  ConfirmSignUp,
  TOTPSetup,
  ForgotPassword
} from 'aws-amplify-react';
import { Menu, Item, Separator, MenuProvider } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.min.css';
import { HashRouter as Router, Route } from 'react-router-dom';
import { withCookies } from 'react-cookie';

import { GetSignedCookiesQuery } from './API';
import { getSignedCookies } from './graphql/queries';
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import './App.css';
import Gallery from './components/Gallery';
import Folders, { FOLDER_LEVEL_UP } from './components/Folders';
import Note from './components/Note';
import * as data from './data';

declare global {
  interface Window {
    AWS_EXPORTS: {
      aws_project_region: string;
      aws_appsync_graphqlEndpoint: string;
      aws_appsync_authenticationType: string;
      aws_user_pools_id:  string;
      aws_user_pools_web_client_id: string;
    };
    AUTH_UI_OPTIONS?: {
      hideForgotPassword: boolean;
    };
  }
}
Amplify.configure(window.AWS_EXPORTS);

interface Props {
  cookies: any
}

const App: React.FunctionComponent<Props> = (props) => {

  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  const [{ error }] = data.useContext();
  if (error) return <Note caption={error} />;
  return (
    <Authenticator
      hide={[
        Greetings,
        ConfirmSignIn,
        SignUp,
        ConfirmSignUp,
        TOTPSetup
      ].concat(window.AUTH_UI_OPTIONS && window.AUTH_UI_OPTIONS.hideForgotPassword ? [ForgotPassword] : [])}
      onStateChange={async (authState: string) => {
        if (authState === 'signedIn') {
          await setSignedCookies();
          setIsSignedIn(true);
        }
      }}
    >
      {isSignedIn &&
        <MenuProvider id="menu">
          <Router>
            <Route render={({ history }) => {
              const path: string = history.location.pathname;
              if (history.location.search === '?browse') {
                return (
                  <Folders
                    path={decodeURIComponent(path)}

                    onChangeFolderIntent={
                      (folderName) => {
                        let newPath: string;
                        if (folderName === FOLDER_LEVEL_UP) {
                          newPath = path.slice(0, path.lastIndexOf('/'));
                          if (newPath === '')
                            newPath = '/';
                        } else {
                          newPath = path;
                          if (newPath !== '/') {
                            newPath += '/'
                          }
                          newPath += encodeURIComponent(folderName);
                        }
                        history.push(newPath + '?browse');
                      }
                    }

                    onSwitchToViewingIntent={(index) => history.push(history.location.pathname + '?' + index)}
                  />
                )
              } else {
                return <Gallery
                  history={history}
                  path={decodeURIComponent(path)}
                  index={history.location.search ? parseInt(history.location.search.slice(1)) : 0}
                  onNoPhotos={() => history.push(history.location.pathname + '?browse')}
                />
              }
            }} />

            <Route render={({ history }) => (
              <Menu id="menu">
                {history.location.search !== '?browse' &&
                  <Item onClick={() => history.push(history.location.pathname + '?browse')}>
                    Browse
                    </Item>
                }
                {history.location.search !== '?browse' &&
                  <Separator />
                }
                <Item onClick={() => signOut()}>
                  Sign out
                  </Item>
              </Menu>
            )} />
          </Router>
        </MenuProvider>
      }
    </Authenticator>
  );

  async function setSignedCookies(): Promise<void> {
    const result = await API.graphql(graphqlOperation(getSignedCookies)) as GraphQLResult;
    const data: GetSignedCookiesQuery = result.data as GetSignedCookiesQuery;

    if(data.getSignedCookies) {
      data.getSignedCookies.forEach((nameValuePair) => {
        if (!nameValuePair) {
          return;
        }
        props.cookies.set(
          nameValuePair.name,
          nameValuePair.value,
          {
            path: '/image',
            secure: true
          }
        );
      });
    }
  }

  function signOut(): void {
    Amplify.Auth.signOut();
    setIsSignedIn(false);
  }

}

const AppWithData: React.FunctionComponent<Props> = (props) => {
  return (
    <data.StateProvider>
      <App {...props} />
    </data.StateProvider>

  );
}

export default withCookies(AppWithData);
