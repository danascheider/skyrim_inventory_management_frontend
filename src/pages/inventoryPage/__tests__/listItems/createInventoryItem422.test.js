import React from 'react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { waitFor, screen, fireEvent } from '@testing-library/react'
import { within } from '@testing-library/dom'
import { cleanCookies } from 'universal-cookie/lib/utils'
import { Cookies, CookiesProvider } from 'react-cookie'
import { renderWithRouter } from '../../../../setupTests'
import { backendBaseUri } from '../../../../utils/config'
import { AppProvider } from '../../../../contexts/appContext'
import { GamesProvider } from '../../../../contexts/gamesContext'
import { InventoryListsProvider } from '../../../../contexts/inventoryListsContext'
import { profileData, games, allInventoryLists } from '../../../../sharedTestData'
import InventoryPage from './../../inventoryPage'

describe('Creating a inventory item when the attributes are invalid', () => {
  let component

  const renderComponentWithMockCookies = () => {
    const route = `/dashboard/inventory?game_id=${games[0].id}`

    const inventoryLists = allInventoryLists.filter(list => list.game_id === games[0].id)

    const cookies = new Cookies('_sim_google_session="xxxxxx"')
    cookies.HAS_DOCUMENT_COOKIE = false

    return renderWithRouter(
      <CookiesProvider cookies={cookies}>
        <AppProvider overrideValue={{ profileData }}>
          <GamesProvider overrideValue={{ games, gameLoadingState: 'done' }} >
            <InventoryListsProvider overrideValue={{ inventoryLists, inventoryListLoadingState: 'done' }}>
              <InventoryPage />
            </InventoryListsProvider>
          </GamesProvider>
        </AppProvider>
      </CookiesProvider>,
      { route }
    )
  }

  const server = setupServer(
    rest.post(`${backendBaseUri}/inventory_lists/:listId/inventory_items`, (req, res, ctx) => {
      return res(
        ctx.status(422),
        ctx.json({
          errors: ['Quantity must be greater than zero']
        })
      )
    })
  )

  beforeAll(() => server.listen())

  beforeEach(() => {
    cleanCookies()
    server.resetHandlers()
  })

  afterEach(() => component.unmount())
  afterAll(() => server.close())

  it("doesn't add the item and displays an error message", async () => {
    component = renderComponentWithMockCookies()

    const listTitle = await screen.findByText('Lakeview Manor')
    const listEl = listTitle.closest('.root')

    // Expand the list element
    fireEvent.click(listTitle)

    const formTrigger = await within(listEl).findByText('Add item to list...')

    // Expand the form to add an item
    fireEvent.click(formTrigger)

    const descriptionInput = await within(listEl).findByPlaceholderText(/description/i)
    const quantityInput = within(listEl).getByDisplayValue('1')
    const notesInput = within(listEl).getByPlaceholderText(/notes/i)

    const form = descriptionInput.closest('form')

    // Fill out and submit the form
    fireEvent.change(descriptionInput, { target: { value: 'Dwarven metal ingot' } })
    fireEvent.change(quantityInput, { target: { value: '-42' } })
    fireEvent.change(notesInput, { target: { value: 'To make bolts with' } })

    fireEvent.submit(form)

    // Form should not be hidden in this case
    await waitFor(() => expect(form).toBeVisible())

    // The item should not be added to the list
    expect(listEl).not.toHaveTextContent(/Dwarven metal ingot/)

    //  There should be an error message
    await waitFor(() => expect(screen.queryByText(/quantity must be greater than zero/i)).toBeVisible())
  })
})
