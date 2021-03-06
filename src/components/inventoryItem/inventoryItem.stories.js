import React from 'react'
import { BLUE } from '../../utils/colorSchemes'
import { AppProvider } from '../../contexts/appContext'
import { GamesProvider } from '../../contexts/gamesContext'
import { InventoryListsProvider } from '../../contexts/inventoryListsContext'
import { ColorProvider } from '../../contexts/colorContext'
import { token, profileData, games, allInventoryLists as inventoryLists } from '../../sharedTestData'
import InventoryItem from './inventoryItem'

export default { title: 'InventoryListItem' }

export const Editable = () => (
  <AppProvider overrideValue={{ token, profileData }}>
    <GamesProvider overrideValue={{ games }}>
      <InventoryListsProvider overrideValue={{ inventoryLists }}>
        <ColorProvider colorScheme={BLUE}>
          <InventoryItem
            itemId={1}
            description='Ebony sword'
            listTitle='Lakeview Manor'
            quantity={1}
            unitWeight={14.0}
            notes='Enchanted with Soul Trap'
            canEdit
          />
        </ColorProvider>
      </InventoryListsProvider>
    </GamesProvider>
  </AppProvider>
)

export const NotEditable = () => (
  <AppProvider overrideValue={{ token, profileData }}>
    <GamesProvider overrideValue={{ games }}>
      <InventoryListsProvider overrideValue={{ inventoryLists }}>
        <ColorProvider colorScheme={BLUE}>
          <InventoryItem
            itemId={1}
            description='Ebony sword'
            listTitle='Lakeview Manor'
            quantity={1}
            unitWeight={14.0}
            canEdit={false}
            notes='Enchanted with Soul Trap'
          />
        </ColorProvider>
      </InventoryListsProvider>
    </GamesProvider>
  </AppProvider>
)
