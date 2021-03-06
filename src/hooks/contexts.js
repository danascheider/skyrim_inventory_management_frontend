/*
 *
 * For more information about contexts and how they are used in SIM,
 * visit the docs on SIM contexts (/docs/contexts.md)
 *
 */

import { useContext } from 'react'
import { ColorContext } from '../contexts/colorContext'
import { AppContext } from '../contexts/appContext'
import { GamesContext } from '../contexts/gamesContext'
import { ShoppingListsContext } from '../contexts/shoppingListsContext'
import { InventoryListsContext } from '../contexts/inventoryListsContext'

const useCustomContext = (cxt, msg) => {
  const context = useContext(cxt)

  if (!context) {
    throw new Error(msg)
  }

  return context
}

export const useColorScheme = () => (
  useCustomContext(ColorContext, 'useColorScheme must be used within a ColorProvider')
)

export const useAppContext = () => (
  useCustomContext(AppContext, 'useAppContext must be used within a AppProvider')
)

export const useShoppingListsContext = () => (
  useCustomContext(ShoppingListsContext, 'useShoppingListsContext must be used within a ShoppingListsProvider')
)

export const useGamesContext = () => (
  useCustomContext(GamesContext, 'useGamesContext must be used within a GamesProvider')
)

export const useInventoryListsContext = () => (
  useCustomContext(InventoryListsContext, 'useInventoryListsContext must be used within an InventoryListsProvider')
)
