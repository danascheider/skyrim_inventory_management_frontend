import { type Meta, type StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import { testUser } from '../../support/data/users'
import {
  loginContextValue,
  loadingLoginContextValue,
} from '../../support/data/contextValues'
import { LoginContext } from '../../contexts/loginContext'
import UserInfo from './userInfo'

type UserInfoStory = StoryObj<typeof UserInfo>

const meta: Meta<typeof UserInfo> = {
  title: 'UserInfo',
  component: UserInfo,
  decorators: [
    (Story, { parameters }) => (
      <BrowserRouter>
        <LoginContext.Provider value={parameters.loginContextValue}>
          <div style={{ height: '64px', display: 'flex' }}>
            <Story />
          </div>
        </LoginContext.Provider>
      </BrowserRouter>
    ),
  ],
}

export default meta

const userWithAnonymousAvatar = {
  ...testUser,
  photoURL: null,
}

export const WithPhoto: UserInfoStory = {
  parameters: {
    loginContextValue,
  },
}

export const WithAnonymousAvatar: UserInfoStory = {
  parameters: {
    loginContextValue: { ...loginContextValue, user: userWithAnonymousAvatar },
  },
}

export const AuthLoading: UserInfoStory = {
  parameters: {
    loginContextValue: loadingLoginContextValue,
  },
}
