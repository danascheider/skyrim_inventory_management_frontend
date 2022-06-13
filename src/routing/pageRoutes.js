import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AppProvider } from '../contexts/appContext'
import { GamesProvider } from '../contexts/gamesContext'
import { ShoppingListsProvider } from '../contexts/shoppingListsContext'
import { InventoryListsProvider } from '../contexts/inventoryListsContext'
import HomePage from '../pages/homePage/homePage'
import LoginPage from '../pages/loginPage/loginPage'
import DashboardPage from '../pages/dashboardPage/dashboardPage'
import GamesPage from '../pages/gamesPage/gamesPage'
import InventoryPage from '../pages/inventoryPage/inventoryPage'
import ShoppingListsPage from '../pages/shoppingListsPage/shoppingListsPage'
import NotFoundPage from '../pages/notFoundPage/notFoundPage'
import paths from './paths'

const siteTitle = 'Skyrim Inventory Management |'

const pages = [
  {
    pageId: 'home',
    title: `${siteTitle} Home`,
    description: 'Manage your inventory across multiple properties in Skyrim',
    jsx: <HomePage />,
    path: paths.home
  },
  {
    pageId: 'login',
    title: `${siteTitle} Login`,
    description: 'Log into Skyrim Inventory Management using your Google account',
    jsx: <LoginPage />,
    path: paths.login
  },
  {
    pageId: 'dashboard',
    title: `${siteTitle} Dashboard`,
    description: 'Skyrim Inventory Management User Dashboard',
    jsx: <DashboardPage />,
    path: paths.dashboard.main
  },
  {
    pageId: 'games',
    title: `${siteTitle} Your Games`,
    description: 'Manage Skyrim Games',
    jsx: <GamesProvider><GamesPage /></GamesProvider>,
    path: paths.dashboard.games
  },
  {
    pageId: 'shoppingLists',
    title: `${siteTitle} Manage Shopping Lists`,
    description: 'Manage Skyrim Shopping Lists',
    jsx: <GamesProvider><ShoppingListsProvider><ShoppingListsPage /></ShoppingListsProvider></GamesProvider>,
    path: paths.dashboard.shoppingLists
  },
  {
    pageId: 'inventory',
    title: `${siteTitle} Manage Inventory`,
    description: 'Manage Skyrim Inventory',
    jsx: <GamesProvider><InventoryListsProvider><InventoryPage /></InventoryListsProvider></GamesProvider>
  }
]

const PageRoutes = () => (
  <Routes>
    {pages.map(
      ({ pageId, title, description, jsx, path }) => {
        return(
          <Route
            exact
            path={path}
            key={pageId}
            element={<>
              <Helmet>
                <html lang='en' />
                <title>{title}</title>
                <meta name='description' content={description} />
              </Helmet>
              <AppProvider>{jsx}</AppProvider>
            </>}
          />
        )
      }
    )}
    <Route
      key='notFound'
      element={
        <>
          <Helmet>
            <html lang='en' />
            <title>Skyrim Inventory Management | Page Not Found</title>
            <meta name='description' content='Skyrim Inventory Management could not find the page you were looking for' />
          </Helmet>
          <AppProvider><NotFoundPage /></AppProvider>
        </>
      }
    />
  </Routes>
)

export default PageRoutes
