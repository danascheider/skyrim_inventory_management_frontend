import { type Meta, type StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import {
  gamesContextValue,
  gamesContextValueLoading,
  wishListsContextValue,
  wishListsContextValueLoading,
  wishListsContextValueEmpty,
  loginContextValue,
  gamesContextValueEmpty,
} from '../../support/data/contextValues'
import { WishListsContext } from '../../contexts/wishListsContext'
import { LoginContext } from '../../contexts/loginContext'
import { GamesContext } from '../../contexts/gamesContext'
import { PageProvider } from '../../contexts/pageContext'
import WishListsPage from './wishListsPage'

type WishListsPageStory = StoryObj<typeof WishListsPage>

const meta: Meta<typeof WishListsPage> = {
  title: 'WishListsPage',
  component: WishListsPage,
  decorators: [
    (Story, { parameters }) => (
      <BrowserRouter>
        <LoginContext.Provider value={loginContextValue}>
          <PageProvider>
            <GamesContext.Provider value={parameters.gamesContextValue}>
              <WishListsContext.Provider
                value={parameters.wishListsContextValue}
              >
                <Story />
              </WishListsContext.Provider>
            </GamesContext.Provider>
          </PageProvider>
        </LoginContext.Provider>
      </BrowserRouter>
    ),
  ],
}

export default meta

export const GamesLoading: WishListsPageStory = {
  parameters: {
    gamesContextValue: gamesContextValueLoading,
    wishListsContextValue,
  },
}

export const NoGames: WishListsPageStory = {
  parameters: {
    gamesContextValue: gamesContextValueEmpty,
    wishListsContextValue: wishListsContextValueEmpty,
  },
}

export const WishListsLoading: WishListsPageStory = {
  parameters: {
    gamesContextValue,
    wishListsContextValue: wishListsContextValueLoading,
  },
}

export const WithWishLists: WishListsPageStory = {
  parameters: {
    gamesContextValue,
    wishListsContextValue,
  },
}

export const NoWishLists: WishListsPageStory = {
  parameters: {
    gamesContextValue,
    wishListsContextValue: wishListsContextValueEmpty,
  },
}
