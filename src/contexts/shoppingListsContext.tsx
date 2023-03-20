import { createContext, useEffect, useState, useCallback } from 'react'
import { signOutWithGoogle } from '../firebase'
import { type CallbackFunction } from '../types/functions'
import {
  type RequestShoppingList,
  type ResponseShoppingList,
} from '../types/apiData'
import { type ProviderProps } from '../types/contexts'
import { type ApiError } from '../types/errors'
import { LOADING, DONE, ERROR, type LoadingState } from '../utils/loadingStates'
import {
  postShoppingLists,
  getShoppingLists,
  deleteShoppingList,
} from '../utils/api/simApi'
import { useQueryString } from '../hooks/useQueryString'
import {
  useGoogleLogin,
  usePageContext,
  useGamesContext,
} from '../hooks/contexts'

const UNEXPECTED_ERROR_MESSAGE =
  "Oops! Something unexpected went wrong. We're sorry! Please try again later."

export interface ShoppingListsContextType {
  shoppingLists: ResponseShoppingList[]
  shoppingListsLoadingState: LoadingState
  createShoppingList: (
    attributes: RequestShoppingList,
    onSuccess?: CallbackFunction,
    onError?: CallbackFunction
  ) => void
  destroyShoppingList: (
    listId: number,
    onSuccess?: CallbackFunction,
    onError?: CallbackFunction
  ) => void
}

export const ShoppingListsContext = createContext<ShoppingListsContextType>({
  shoppingLists: [] as ResponseShoppingList[],
  shoppingListsLoadingState: LOADING,
  createShoppingList: () => {},
  destroyShoppingList: () => {},
})

export const ShoppingListsProvider = ({ children }: ProviderProps) => {
  const { user, token, authLoading, requireLogin } = useGoogleLogin()
  const { setFlashProps } = usePageContext()
  const { gamesLoadingState, games } = useGamesContext()
  const queryString = useQueryString()
  const [activeGame, setActiveGame] = useState<number | null>(null)
  const [shoppingListsLoadingState, setShoppingListsLoadingState] =
    useState(LOADING)
  const [shoppingLists, setShoppingLists] = useState<ResponseShoppingList[]>([])

  /**
   *
   * General handler for any ApiError
   *
   */

  const handleApiError = (e: ApiError) => {
    if (import.meta.env.DEV) console.error(e.message)

    if (e.code === 401) {
      signOutWithGoogle()
    } else if (e.code === 422) {
      setFlashProps({
        hidden: false,
        type: 'error',
        header: `${e.message.length} error(s) prevented your shopping list from being saved:`,
        message: e.message,
      })
    } else {
      const message =
        e.code === 405
          ? "You can't manually manage an aggregate list."
          : UNEXPECTED_ERROR_MESSAGE

      setFlashProps({
        hidden: false,
        type: 'error',
        message,
      })
    }
  }

  /**
   *
   * Create shopping list for the active game
   *
   */

  const createShoppingList = useCallback(
    (
      attributes: RequestShoppingList,
      onSuccess?: CallbackFunction,
      onError?: CallbackFunction
    ) => {
      if (!activeGame) {
        setFlashProps({
          hidden: false,
          type: 'warning',
          message:
            'You must select a game from the dropdown before creating a shopping list.',
        })

        return
      }

      if (user && token) {
        postShoppingLists(activeGame, attributes, token)
          .then(({ json }) => {
            if (Array.isArray(json)) {
              if (json.length == 2) {
                setShoppingLists(json)
              } else {
                const newShoppingLists = shoppingLists
                newShoppingLists.splice(1, 0, json[0])
                setShoppingLists(newShoppingLists)
              }

              setFlashProps({
                hidden: false,
                type: 'success',
                message: 'Success! Your shopping list has been created.',
              })
              onSuccess && onSuccess()
            }
          })
          .catch((e: ApiError) => {
            if (e.code === 404) {
              setFlashProps({
                hidden: false,
                type: 'error',
                message:
                  "The game you've selected doesn't exist, or doesn't belong to you. Please select another game and try again.",
              })
            } else {
              handleApiError(e)
            }

            onError && onError()
          })
      }
    },
    [user, token, activeGame, shoppingLists]
  )

  /**
   *
   * Fetch shopping lists for the active game
   *
   */

  const fetchShoppingLists = useCallback(() => {
    if (!activeGame) return

    if (user && token && activeGame) {
      setShoppingListsLoadingState(LOADING)

      getShoppingLists(activeGame, token)
        .then(({ json }) => {
          if (Array.isArray(json)) {
            setShoppingLists(json)
            setShoppingListsLoadingState(DONE)
          }
        })
        .catch((e: ApiError) => {
          if (e.code === 404) {
            setFlashProps({
              hidden: false,
              type: 'error',
              message:
                "The game you've selected doesn't exist, or doesn't belong to you. Please select another game and try again.",
            })
          } else {
            handleApiError(e)
          }

          setShoppingLists([])
          setShoppingListsLoadingState(ERROR)
        })
    }
  }, [user, token, activeGame])

  /**
   *
   * Destroy specified shopping list
   *
   */

  const destroyShoppingList = useCallback(
    (
      listId: number,
      onSuccess?: CallbackFunction,
      onError?: CallbackFunction
    ) => {
      if (user && token) {
        deleteShoppingList(listId, token)
          .then(({ json }) => {
            if (Array.isArray(json)) {
              setShoppingLists(json)
              setFlashProps({
                hidden: false,
                type: 'success',
                message: 'Success! Your shopping list has been deleted.',
              })
              onSuccess && onSuccess()
            }
          })
          .catch((e: ApiError) => {
            if (e.code === 404) {
              setFlashProps({
                hidden: false,
                type: 'error',
                message:
                  "The shopping list you tried to delete doesn't exist, or doesn't belong to you. Please refresh and try again.",
              })
            } else {
              handleApiError(e)
            }

            onError && onError()
          })
      }
    },
    [user, token]
  )

  /**
   *
   * Set the context provider value
   *
   */

  const value = {
    shoppingLists,
    shoppingListsLoadingState,
    createShoppingList,
    destroyShoppingList,
  }

  /**
   *
   * Set the active game automatically from the query string
   * or, failing that, from the games themselves when they load
   *
   */

  useEffect(() => {
    const gameId: number = Number(queryString.get('gameId'))

    if (gameId > 0) {
      setActiveGame(gameId)
    } else if (gamesLoadingState === DONE && games.length) {
      setActiveGame(games[0].id)
    }
  }, [queryString, gamesLoadingState, games])

  useEffect(() => {
    if (authLoading) return

    fetchShoppingLists()
  }, [authLoading, fetchShoppingLists])

  useEffect(() => {
    requireLogin()
  }, [requireLogin])

  return (
    <ShoppingListsContext.Provider value={value}>
      {children}
    </ShoppingListsContext.Provider>
  )
}
