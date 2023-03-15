import { BrowserRouter } from 'react-router-dom'
import { allGames, emptyGames } from '../../support/data/games'
import {
  loadingLoginContextValue,
  loginContextValue,
} from '../../support/data/contextValues'
import { internalServerErrorResponse } from '../../support/data/errors'
import { LoginContext } from '../../contexts/loginContext'
import { PageProvider } from '../../contexts/pageContext'
import { GamesProvider } from '../../contexts/gamesContext'
import GamesPage from './gamesPage'

const GAMES_URI = '/api/games'

export default {
  title: 'GamesPage',
}

export const NoGames = () => (
  <BrowserRouter>
    <LoginContext.Provider value={loginContextValue}>
      <PageProvider>
        <GamesProvider>
          <GamesPage />
        </GamesProvider>
      </PageProvider>
    </LoginContext.Provider>
  </BrowserRouter>
)

NoGames.parameters = {
  mockData: [
    {
      url: GAMES_URI,
      method: 'GET',
      status: 200,
      response: emptyGames,
    },
  ],
}

export const WithGamesHappy = () => (
  <BrowserRouter>
    <LoginContext.Provider value={loginContextValue}>
      <PageProvider>
        <GamesProvider>
          <GamesPage />
        </GamesProvider>
      </PageProvider>
    </LoginContext.Provider>
  </BrowserRouter>
)

WithGamesHappy.parameters = {
  mockData: [
    {
      url: GAMES_URI,
      method: 'GET',
      status: 200,
      response: allGames,
    },
    {
      url: '/api/games/32',
      method: 'DELETE',
      status: 204,
      response: {},
    },
    {
      url: '/api/games/51',
      method: 'DELETE',
      status: 204,
      response: {},
    },
    {
      url: '/api/games/77',
      method: 'DELETE',
      status: 204,
      response: {},
    },
  ],
}

export const AuthLoading = () => (
  <BrowserRouter>
    <LoginContext.Provider value={loadingLoginContextValue}>
      <PageProvider>
        <GamesProvider>
          <GamesPage />
        </GamesProvider>
      </PageProvider>
    </LoginContext.Provider>
  </BrowserRouter>
)

export const ServerError = () => (
  <BrowserRouter>
    <LoginContext.Provider value={loginContextValue}>
      <PageProvider>
        <GamesProvider>
          <GamesPage />
        </GamesProvider>
      </PageProvider>
    </LoginContext.Provider>
  </BrowserRouter>
)

ServerError.parameters = {
  mockData: [
    {
      url: GAMES_URI,
      method: 'GET',
      status: 500,
      response: internalServerErrorResponse,
    },
  ],
}
