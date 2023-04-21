import { type Meta, type StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import { LoginContext } from '../../contexts/loginContext'
import {
  loadingLoginContextValue,
  unauthenticatedLoginContextValue,
} from '../../support/data/contextValues'
import HomePage from './homePage'

type HomePageStory = StoryObj<typeof HomePage>

const meta: Meta<typeof HomePage> = {
  title: 'HomePage',
  component: HomePage,
  decorators: [
    (Story, { parameters }) => (
      <BrowserRouter>
        <LoginContext.Provider value={parameters.loginContextValue}>
          <Story />
        </LoginContext.Provider>
      </BrowserRouter>
    ),
  ],
}

export default meta

export const Default: HomePageStory = {
  parameters: {
    loginContextValue: unauthenticatedLoginContextValue,
  },
}

export const AuthLoading: HomePageStory = {
  parameters: {
    loginContextValue: loadingLoginContextValue,
  },
}
