import React from 'react'
import { AppProvider } from '../../contexts/appContext'
import { GamesProvider } from '../../contexts/gamesContext'
import { token, profileData } from '../../sharedTestData'
import GameCreateForm from './gameCreateForm'

export default { title: 'GameCreateForm' }

export const Default = () => (
  <AppProvider overrideValue={{ token, profileData }}>
    <GamesProvider overrideValue={{ games: [], performGameCreate: () => {} }}>
      <GameCreateForm disabled={false} />
    </GamesProvider>
  </AppProvider>
)

export const Disabled = () => (
  <AppProvider overrideValue={{ token, profileData }}>
    <GamesProvider overrideValue={{ games: [] }}>
      <GameCreateForm disabled />
    </GamesProvider>
  </AppProvider>
)
