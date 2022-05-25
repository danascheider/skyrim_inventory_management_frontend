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

describe('Incrementing or decrementing an inventory list item - error cases', () => {
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

  beforeEach(() => cleanCookies())
  afterEach(() => component.unmount())

  describe('when the server returns a 401', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/3`, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            errors: ['Google OAuth token validation failed']
          })
        )
      }),
      rest.delete(`${backendBaseUri}/inventory_items/6`, (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({
            errors: ['Google OAuth token validation failed']
          })
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    describe('incrementing', () => {
      it('returns to the login page', async () => {
        const { history } = component = renderComponentWithMockCookies()

        // We're going to increment an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const incrementer = within(itemEl).getByTestId('incrementer')

        fireEvent.click(incrementer)

        // It should redirect the user back to the login page
        await waitFor(() => expect(history.location.pathname).toEqual('/login'))
      })
    })

    describe('decrementing above zero', () => {
      it('returns to the login page', async () => {
        const { history } = component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should redirect to the login page
        await waitFor(() => expect(history.location.pathname).toEqual('/login'))
      })
    })

    describe('decrementing to zero', () => {
      let confirm

      beforeEach(() => {
        confirm = jest.spyOn(window, 'confirm').mockImplementation(() => true)
      })

      afterEach(() => confirm.mockRestore())

      it('returns to the login page', async () => {
        const { history } = component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Copper and onyx circlet'.
        const itemDescEl = await within(listEl).findByText('Copper and onyx circlet')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should redirect to the login page
        await waitFor(() => expect(history.location.pathname).toEqual('/login'))
      })
    })
  })

  describe('when the server returns a 404', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(404)
        )
      }),
      rest.delete(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(404)
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    describe('incrementing', () => {
      it("doesn't update the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to increment an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'. Its initial
        // quantity is 4.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const incrementer = within(itemEl).getByTestId('incrementer')

        fireEvent.click(incrementer)

        // It should show the original quantity value
        await waitFor(() => expect(within(itemEl).queryByText('4')).toBeVisible())

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // Then find the corresponding item
        const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
        const aggListItemEl = aggListItemDescEl.closest('.root')

        // Now we need to check its quantity. The original quantity of this item
        // on the aggregate list is also 4.
        await waitFor(() => expect(within(aggListItemEl).queryByText('4')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/couldn't find/i)).toBeVisible())
      })
    })

    describe('decrementing above zero', () => {
      it("doesn't update the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'. Its initial
        // quantity is 4.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should show the original quantity value
        await waitFor(() => expect(itemEl).toHaveTextContent('4'))

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // Then find the corresponding item
        const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
        const aggListItemEl = aggListItemDescEl.closest('.root')

        // Now we need to check its quantity. The original quantity of this item
        // on the aggregate list is also 4.
        await waitFor(() => expect(within(aggListItemEl).queryByText('4')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/couldn't find/i)).toBeVisible())
      })
    })

    describe('decrementing to zero', () => {
      let confirm

      beforeEach(() => {
        confirm = jest.spyOn(window, 'confirm').mockImplementation(() => true)
      })

      afterEach(() => confirm.mockRestore())

      it("doesn't remove the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Copper and onyx circlet'.
        const itemDescEl = await within(listEl).findByText('Copper and onyx circlet')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should show the original quantity value
        await waitFor(() => expect(itemEl).toBeVisible())

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // The aggregate list item should be present
        await waitFor(() => expect(within(aggListEl).queryByText('Copper and onyx circlet')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/couldn't find/i)).toBeVisible())
      })
    })
  })

  describe('when the server returns a 500 or other error', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            errors: ['Something went horribly wrong']
          })
        )
      }),
      rest.delete(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            errors: ['Mistakes have been made']
          })
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    describe('incrementing', () => {
      it("doesn't update the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to increment an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'. Its initial
        // quantity is 4.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const incrementer = within(itemEl).getByTestId('incrementer')

        fireEvent.click(incrementer)

        // It should show the original quantity value
        await waitFor(() => expect(within(itemEl).queryByText('4')).toBeVisible())

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // Then find the corresponding item
        const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
        const aggListItemEl = aggListItemDescEl.closest('.root')

        // Now we need to check its quantity. The original quantity of this item
        // on the aggregate list is also 4.
        await waitFor(() => expect(within(aggListItemEl).queryByText('4')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/something unexpected happened/i)).toBeVisible())
      })
    })

    describe('decrementing above zero', () => {
      it("doesn't update the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Nirnroot'. Its initial
        // quantity is 4.
        const itemDescEl = await within(listEl).findByText('Nirnroot')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should show the original quantity value
        await waitFor(() => expect(within(itemEl).queryByText('4')).toBeVisible())

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // Then find the corresponding item
        const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
        const aggListItemEl = aggListItemDescEl.closest('.root')

        // Now we need to check its quantity. The original quantity of this item
        // on the aggregate list is also 4.
        await waitFor(() => expect(within(aggListItemEl).queryByText('4')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/something unexpected happened/i)).toBeVisible())
      })
    })

    describe('decrementing below zero', () => {
      let confirm

      beforeEach(() => {
        confirm = jest.spyOn(window, 'confirm').mockImplementation(() => true)
      })

      afterEach(() => confirm.mockRestore())

      it("doesn't remove the requested item and displays an error", async () => {
        component = renderComponentWithMockCookies()

        // We're going to decrement an item on the 'Lakeview Manor' list
        const listTitleEl = await screen.findByText('Lakeview Manor')
        const listEl = listTitleEl.closest('.root')

        fireEvent.click(listTitleEl)

        // The list item we're going for is titled 'Copper and onyx circlet'.
        const itemDescEl = await within(listEl).findByText('Copper and onyx circlet')
        const itemEl = itemDescEl.closest('.root')
        const decrementer = within(itemEl).getByTestId('decrementer')

        fireEvent.click(decrementer)

        // It should show the original quantity value
        await waitFor(() => expect(itemEl).toBeVisible())

        // Now find the corresponding item on the aggregate list. Start by
        // finding the list itself.
        const aggListTitleEl = screen.getByText('All Items')
        const aggListEl = aggListTitleEl.closest('.root')

        // Expand the list
        fireEvent.click(aggListTitleEl)

        // Then find the corresponding item
        await waitFor(() => expect(within(aggListEl).queryByText('Copper and onyx circlet')).toBeVisible())

        // Finally, we'll check for the flash message
        await waitFor(() => expect(screen.queryByText(/something unexpected happened/i)).toBeVisible())
      })
    })
  })
})
