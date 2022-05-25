/*
 *
 * This module is an abstraction layer for the SIM API that handles making requests
 * to the API. These functions handle three things: (1) formulating the requests based
 * on which function it is and the args being passed in (including assembling both
 * headers and request body) and (2) throwing an AuthorizationError if the request fails.
 * The AuthorizationError has name 'AuthorizationError', code 401, and either the
 * message passed to the constructor or, by default, '401 Unauthorized'.
 *
 * For more information on the SIM API, its endpoints, the requests it expects, or its
 * responses, please visit the backend API docs:
 * https://github.com/danascheider/skyrim_inventory_management/tree/main/docs/api
 *
 */

import { backendBaseUri } from './config'
import {
  AuthorizationError,
  MethodNotAllowedError,
  NotFoundError
} from './customErrors'

const contentTypeHeader = { 'Content-Type': 'application/json' }
const authHeader = token => ({ 'Authorization': `Bearer ${token}`})
const combinedHeaders = token => ({ ...authHeader(token), ...contentTypeHeader })

/*
 *
 * Google OAuth Token Verification Endpoint
 *
 */

export const authorize = token => {
  const uri = `${backendBaseUri}/auth/verify_token`

  return(
    fetch(uri, {  headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        return resp
      })
  )
}

/*
 *
 * User Profile Endpoint
 *
 */

export const fetchUserProfile = token => {
  const uri = `${backendBaseUri}/users/current`

  return(
    fetch(uri, { headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

/*
 *
 * Game Endpoints (Scoped to Authenticated User)
 *
 */

// GET /games
export const fetchGames = token => {
  const uri = `${backendBaseUri}/games`

  return(
    fetch(uri, { headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// POST /games
export const createGame = (token, attrs) => {
  const uri = `${backendBaseUri}/games`
  const body = JSON.stringify({ game: attrs })

  return fetch(uri, {
    method: 'POST',
    headers: combinedHeaders(token),
    body: body
  })
  .then(resp => {
    if (resp.status === 401) throw new AuthorizationError()
    return resp.json().then(json => ({ status: resp.status, json }))
  })
}

// PATCH /games/:id
export const updateGame = (token, gameId, attrs) => {
  const uri = `${backendBaseUri}/games/${gameId}`
  const body = JSON.stringify({ game: attrs })

  return fetch(uri, {
    method: 'PATCH',
    headers: combinedHeaders(token),
    body: body
  })
  .then(resp => {
    if (resp.status === 401) throw new AuthorizationError()
    if (resp.status === 404) throw new NotFoundError()
    return resp.json().then(json => ({ status: resp.status, json }))
  })
}

// DELETE /games/:id
export const destroyGame = (token, gameId) => {
  const uri = `${backendBaseUri}/games/${gameId}`

  return fetch(uri, {
    method: 'DELETE',
    headers: authHeader(token)
  })
  .then(resp => {
    // I deviated from the usual pattern of throwing a NotFoundError here
    // on 404 since the behaviour for 404s is the same as the behaviour for
    // successful deletion of the game, and making it throw an error here
    // would just mean duplicating all thatlogic in the handlers in the
    // GamesProvider.
    if (resp.status === 401) throw new AuthorizationError()
    return resp
  })
}

/*
 *
 * Shopping List Endpoints (Scoped to Game)
 *
 */

// GET /games/:id/shopping_lists
export const fetchShoppingLists = (token, gameId) => {
  const uri = `${backendBaseUri}/games/${gameId}/shopping_lists`

  return(
    fetch(uri, { headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()
        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// POST /games/:game_id/shopping_lists
export const createShoppingList = (token, gameId, attrs) => {
  const uri = `${backendBaseUri}/games/${gameId}/shopping_lists`
  const body = JSON.stringify({ shopping_list: attrs })

  return fetch(uri, {
    method: 'POST',
    headers: combinedHeaders(token),
    body: body
  })
  .then(resp => {
    if (resp.status === 401) throw new AuthorizationError()
    if (resp.status === 404) throw new NotFoundError()
    return resp.json().then(json => ({ status: resp.status, json }))
  })
}

// PATCH /shopping_lists/:id
export const updateShoppingList = (token, listId, attrs) => {
  const uri = `${backendBaseUri}/shopping_lists/${listId}`

  const body = JSON.stringify({
    id: listId,
    shopping_list: attrs
  })

  return(
    fetch(uri, {
      method: 'PATCH',
      headers: combinedHeaders(token),
      body: body
    })
    .then(resp => {
      // It might return a 422 error too, but in that case we'll need the response
      // JSON to handle the error
      if (resp.status === 401) throw new AuthorizationError()
      if (resp.status === 404) throw new NotFoundError('Shopping list not found. Try refreshing the page to resolve this issue.')
      return resp.json().then(json => ({ status: resp.status, json }))
    })
  )
}

// DELETE /shopping_lists/:id
export const destroyShoppingList = (token, listId) => {
  const uri = `${backendBaseUri}/shopping_lists/${listId}`

  return(
    fetch(uri, {
      method: 'DELETE',
      headers: authHeader(token),
    })
    .then(resp => {
      if (resp.status === 401) throw new AuthorizationError()
      if (resp.status === 404) throw new NotFoundError('Shopping list not found. Try refreshing the page to resolve this issue.')
      if (resp.status === 405) throw new MethodNotAllowedError('Aggregate lists are managed automatically and cannot be deleted manually.')
      if (resp.status === 204) return { status: resp.status, json: null }
      return resp.json().then(json => ({ status: resp.status, json }))
    })
  )
}

/*
 *
 * Shopping List Item Endpoints
 *
 */

// POST /shopping_lists/:shopping_list_id/shopping_list_items
export const createShoppingListItem = (token, listId, attrs) => {
  const uri = `${backendBaseUri}/shopping_lists/${listId}/shopping_list_items`

  return(
    fetch(uri, {
      method: 'POST',
      headers: combinedHeaders(token),
      body: JSON.stringify({ shopping_list_item: attrs })
    })
    .then(resp => {
      if (resp.status === 401) throw new AuthorizationError()
      if (resp.status === 404) throw new NotFoundError("You tried to create an item on a list that doesn't exist. Try refreshing to resolve this issue.")
      return resp.json().then(json => ({ status: resp.status, json }))
    })
  )
}

// PATCH /shopping_list_items/:id
export const updateShoppingListItem = (token, itemId, attrs) => {
  const uri = `${backendBaseUri}/shopping_list_items/${itemId}`

  return(
    fetch(uri, {
      method: 'PATCH',
      headers: combinedHeaders(token),
      body: JSON.stringify({ shopping_list_item: attrs })
    })
    .then(resp => {
      if (resp.status === 401) throw new AuthorizationError()
      if (resp.status === 404) throw new NotFoundError("You tried to update a list item that doesn't exist. Try refreshing to fix this issue.")
      if (resp.status === 405) throw new MethodNotAllowedError('Items on aggregate shopping lists cannot be updated through the API')
      return resp.json().then(json => ({ status: resp.status, json }))
    })
  )
}

// DELETE /shopping_list_items/:id
export const destroyShoppingListItem = (token, itemId) => {
  const uri = `${backendBaseUri}/shopping_list_items/${itemId}`

  return(
    fetch(uri, {
      method: 'DELETE',
      headers: authHeader(token)
    })
    .then(resp => {
      if (resp.status === 401) throw new AuthorizationError()
      if (resp.status === 404) throw new NotFoundError("You tried to delete a list item that doesn't exist. Try refreshing to fix this issue.")
      if (resp.status === 405) throw new MethodNotAllowedError()
      if (resp.status === 204) return { status: resp.status, json: null }
      return resp.json().then(json => ({ status: resp.status, json }))
    })
  )
}

/*
 *
 * Inventory List Endpoints (Scoped to Game)
 *
 */

// GET /games/:game_id/inventory_lists
export const fetchInventoryLists = (token, gameId) => {
  const uri = `${backendBaseUri}/games/${gameId}/inventory_lists`

  return(
    fetch(uri, { headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// POST /games/:game_id/inventory_lists
export const createInventoryList = (token, gameId, attrs) => {
  const uri = `${backendBaseUri}/games/${gameId}/inventory_lists`
  const body = JSON.stringify({ inventory_list: attrs })

  return(
    fetch(uri, { method: 'POST', headers: combinedHeaders(token), body })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// PATCH /inventory_lists/:id
export const updateInventoryList = (token, listId, attrs) => {
  const uri = `${backendBaseUri}/inventory_lists/${listId}`
  const body = JSON.stringify({ inventory_list: attrs })

  return(
    fetch(uri, { method: 'PATCH', headers: combinedHeaders(token), body })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// DELETE /inventory_lists/:id
export const destroyInventoryList = (token, listId) => {
  const uri = `${backendBaseUri}/inventory_lists/${listId}`

  return(
    fetch(uri, { method: 'DELETE', headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        if (resp.status === 204) {
          return { status: resp.status, json: null }
        } else {
          return resp.json().then(json => ({ status: resp.status, json }))
        }
      })
  )
}

/*
 *
 * Inventory List Item Endpoints
 *
 */

// POST /inventory_lists/:list_id/inventory_items
export const createInventoryListItem = (token, listId, attrs) => {
  const uri = `${backendBaseUri}/inventory_lists/${listId}/inventory_items`
  const body = JSON.stringify({ inventory_item: attrs })

  return(
    fetch(uri, { method: 'POST', headers: combinedHeaders(token), body })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// PATCH /inventory_items/:id
export const updateInventoryListItem = (token, itemId, attrs) => {
  const uri = `${backendBaseUri}/inventory_items/${itemId}`
  const body = JSON.stringify({ inventory_item: attrs })

  return(
    fetch(uri, { method: 'PATCH', headers: combinedHeaders(token), body })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        return resp.json().then(json => ({ status: resp.status, json }))
      })
  )
}

// DELETE /inventory_items/:id
export const destroyInventoryListItem = (token, itemId) => {
  const uri = `${backendBaseUri}/inventory_items/${itemId}`

  return(
    fetch(uri, { method: 'DELETE', headers: authHeader(token) })
      .then(resp => {
        if (resp.status === 401) throw new AuthorizationError()
        if (resp.status === 404) throw new NotFoundError()

        if (resp.status === 204) {
          return { status: resp.status, json: null }
        } else {
          return resp.json().then(json => ({ status: resp.status, json }))
        }
      })
  )
}
