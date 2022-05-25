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

describe('Updating an inventory list item - error cases', () => {
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

  describe('when the server returns a 401 error', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
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

    it('redirects the user to the login page', async () => {
      const { history } = component = renderComponentWithMockCookies()

      // We're going to update an item on the 'Lakeview Manor' list
      const listTitleEl = await screen.findByText('Lakeview Manor')
      const listEl = listTitleEl.closest('.root')

      fireEvent.click(listTitleEl)

      // The list item we're going for is titled 'Nirnroot'
      const itemDescEl = await within(listEl).findByText('Nirnroot')
      const itemEl = itemDescEl.closest('.root')
      const editIcon = within(itemEl).getByTestId('edit-item')

      fireEvent.click(editIcon)

      // It should display the list item edit form
      const form = await screen.findByTestId('inventory-list-item-form')
      expect(form).toBeVisible()

      // Now find the form fields and fill out the form. This item has no notes
      // so we find the notes field by placeholder text instead.
      const notesField = within(form).getByPlaceholderText('This item has no notes')

      // Fill out the form field. We'll change just the notes value for the
      // sake of simplicity.
      fireEvent.change(notesField, { target: { value: 'This item has notes now' } })

      // Submit the  form
      fireEvent.submit(form)

      // The user should be redirected to the login page
      await waitFor(() => expect(history.location.pathname).toEqual('/login'))
    })
  })

  describe('when the server returns a 404 error', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(404)
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it("doesn't update the items and displays a flash error message", async () => {
      component = renderComponentWithMockCookies()

      // We're going to update an item on the 'Lakeview Manor' list
      const listTitleEl = await screen.findByText('Lakeview Manor')
      const listEl = listTitleEl.closest('.root')

      fireEvent.click(listTitleEl)

      // The list item we're going for is titled 'Nirnroot'.
      const itemDescEl = await within(listEl).findByText('Nirnroot')
      const itemEl = itemDescEl.closest('.root')
      const editIcon = within(itemEl).getByTestId('edit-item')

      fireEvent.click(editIcon)

      // It should display the list item edit form
      const form = await screen.findByTestId('inventory-list-item-form')
      expect(form).toBeVisible()

      // Now find the form fields and fill out the form. This item has no notes
      // so we find the notes field by placeholder text instead.
      const notesField = within(form).getByPlaceholderText('This item has no notes')

      // Fill out the form field. We'll change just the notes value for the
      // sake of simplicity.
      fireEvent.change(notesField, { target: { value: 'This item has notes now' } })

      // Submit the form
      fireEvent.submit(form)

      // The form should be hidden
      await waitFor(() => expect(form).not.toBeInTheDocument())

      // Now we need to find the item on the regular list and the
      // aggregate list.
      const aggListTitleEl = screen.getByText('All Items')
      const aggListEl = aggListTitleEl.closest('.root')

      // Expand the list so the item is visible
      fireEvent.click(aggListTitleEl)

      // Then find the corresponding item
      const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
      const aggListItemEl = aggListItemDescEl.closest('.root')

      // Expand the list item on each list to see the notes
      fireEvent.click(aggListItemDescEl)
      fireEvent.click(itemDescEl)

      // Now we need to check that the aggregate list item and regular list
      // item are updated.
      await waitFor(() => expect(aggListItemEl).not.toHaveTextContent('This item has notes now'))
      expect(listEl).not.toHaveTextContent('This item has notes now')

      // Finally, it should display the flash message.
      await waitFor(() => expect(screen.queryByText(/couldn't find/i)).toBeVisible())
    })
  })

  describe('when the server returns a 422 error', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(422),
          ctx.json({
            // No validation errors are actually expected for list items
            // since the form handles most validations and the backend
            // resolves other issues such as duplicate descriptions
            errors: ['Invalid attributes']
          })
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it("doesn't update the items and displays a flash error message", async () => {
      component = renderComponentWithMockCookies()

      // We're going to update an item on the 'Lakeview Manor' list
      const listTitleEl = await screen.findByText('Lakeview Manor')
      const listEl = listTitleEl.closest('.root')

      fireEvent.click(listTitleEl)

      // The list item we're going for is titled 'Nirnroot'.
      const itemDescEl = await within(listEl).findByText('Nirnroot')
      const itemEl = itemDescEl.closest('.root')
      const editIcon = within(itemEl).getByTestId('edit-item')

      fireEvent.click(editIcon)

      // It should display the list item edit form
      const form = await screen.findByTestId('inventory-list-item-form')
      expect(form).toBeVisible()

      // Now find the form fields and fill out the form.
      const quantityField = within(form).getByDisplayValue('4')

      // This is actually a valid value. Because the form handles any
      // validations that would lead to these errors, we're kind of fudging
      // things here by having the mock API return a 422 result.
      fireEvent.change(quantityField, { target: { value: '2' } })

      // Submit the form
      fireEvent.submit(form)

      // The form should not be hidden
      await waitFor(() => expect(form).toBeInTheDocument())

      // Now we need to find the item on the regular list and the
      // aggregate list.
      const aggListTitleEl = screen.getByText('All Items')
      const aggListEl = aggListTitleEl.closest('.root')

      // Expand the list so the item is visible
      fireEvent.click(aggListTitleEl)

      // Then find the corresponding item
      const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
      const aggListItemEl = aggListItemDescEl.closest('.root')

      // Now we need to check that the aggregate list item and regular list
      // item are updated.
      await waitFor(() => expect(within(aggListItemEl).queryByText('2')).not.toBeInTheDocument())
      expect(within(listEl).queryByText('2')).not.toBeInTheDocument()

      // Finally, it should display the flash message.
      await waitFor(() => expect(screen.queryByText(/Invalid attributes/)).toBeVisible())
    })
  })

  describe('when the server returns a 500 error', () => {
    const server = setupServer(
      rest.patch(`${backendBaseUri}/inventory_items/:id`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            errors: ['Something went horribly wrong']
          })
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it("doesn't update the items and displays a flash error message", async () => {
      component = renderComponentWithMockCookies()

      // We're going to update an item on the 'Lakeview Manor' list
      const listTitleEl = await screen.findByText('Lakeview Manor')
      const listEl = listTitleEl.closest('.root')

      fireEvent.click(listTitleEl)

      // The list item we're going for is titled 'Nirnroot'.
      const itemDescEl = await within(listEl).findByText('Nirnroot')
      const itemEl = itemDescEl.closest('.root')
      const editIcon = within(itemEl).getByTestId('edit-item')

      fireEvent.click(editIcon)

      // It should display the list item edit form
      const form = await screen.findByTestId('inventory-list-item-form')
      expect(form).toBeVisible()

      // Now find the form fields and fill out the form.
      const quantityField = within(form).getByDisplayValue('4')

      // Update the value on the form
      fireEvent.change(quantityField, { target: { value: '2' } })

      // Submit the form
      fireEvent.submit(form)

      // The form should be hidden
      await waitFor(() => expect(form).not.toBeInTheDocument())

      // Now we need to find the item on the regular list and the
      // aggregate list.
      const aggListTitleEl = screen.getByText('All Items')
      const aggListEl = aggListTitleEl.closest('.root')

      // Expand the list so the item is visible
      fireEvent.click(aggListTitleEl)

      // Then find the corresponding item
      const aggListItemDescEl = await within(aggListEl).findByText('Nirnroot')
      const aggListItemEl = aggListItemDescEl.closest('.root')

      // Expand the list item on each list to see the notes
      fireEvent.click(aggListItemDescEl)
      fireEvent.click(itemDescEl)

      // Now we need to check that the aggregate list item and regular list
      // item are updated.
      await waitFor(() => expect(within(aggListItemEl).queryByText('2')).not.toBeInTheDocument())
      expect(within(listEl).queryByText('2')).not.toBeInTheDocument()

      // Finally, it should display the flash message.
      await waitFor(() => expect(screen.queryByText(/something unexpected happened/i)).toBeVisible())
    })
  })
})
