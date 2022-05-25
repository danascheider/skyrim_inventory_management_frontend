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

describe('Creating a inventory list item - happy path', () => {
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

  describe('when there is no matching item on any inventory list', () => {
    const server = setupServer(
      rest.post(`${backendBaseUri}/inventory_lists/:listId/inventory_items`, (req, res, ctx) => {
        const listId = parseInt(req.params.listId)
        const description = req.body.inventory_list_item.description
        const quantity = req.body.inventory_list_item.quantity
        const unit_weight = req.body.inventory_list_item.unit_weight
        const notes = req.body.inventory_list_item.notes

        const json = [
          {
            id: 856,
            list_id: allInventoryLists[0].id,
            description,
            quantity,
            unit_weight,
            notes
          },
          {
            id: 855,
            list_id: listId,
            description,
            quantity,
            unit_weight,
            notes
          }
        ]

        return res(
          ctx.status(201),
          ctx.json(json)
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('adds the item to the list and hides the form', async () => {
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
      const unitWeightInput = within(listEl).getByPlaceholderText(/unit weight/i)

      const form = descriptionInput.closest('form')

      // Fill out and submit the form
      fireEvent.change(descriptionInput, { target: { value: 'Dwarven metal ingots' } })
      fireEvent.change(quantityInput, { target: { value: '10' } })
      fireEvent.change(notesInput, { target: { value: 'To make bolts with' } })
      fireEvent.change(unitWeightInput, { target: { value: '1' } })

      fireEvent.submit(form)

      // Item should be added to the list
      const itemTitle = await within(listEl).findByText('Dwarven metal ingots')
      const itemElOnRegList = itemTitle.closest('.root')
      expect(itemTitle).toBeVisible()

      // Form should be hidden
      await waitFor(() => expect(form).not.toBeVisible())

      // Check that the attributes of the item on the list are correct
      fireEvent.click(itemTitle)

      await waitFor(() => expect(within(itemElOnRegList).queryByText('10')).toBeVisible())
      expect(within(itemElOnRegList).getByText('To make bolts with')).toBeVisible()
      expect(within(itemElOnRegList).getByText('1')).toBeVisible()

      // The item should be added to the all items list - expand the list to see
      const allItemsTitle = await screen.findByText(/all items/i)
      const allItemsEl = allItemsTitle.closest('.root')

      fireEvent.click(allItemsTitle)

      const itemTitleOnAggList = await within(allItemsEl).findByText('Dwarven metal ingots')
      const itemElOnAggList = itemTitleOnAggList.closest('.root')

      expect(itemElOnAggList).toBeVisible()

      // Expand the item to show its attributes
      fireEvent.click(itemTitleOnAggList)

      await waitFor(() => expect(within(itemElOnAggList).queryByText('10')).toBeVisible())
      expect(itemElOnAggList).toHaveTextContent(/To make bolts with/)
      expect(within(itemElOnAggList).getByText('1')).toBeVisible()

      // There should be a flash message visible
      await waitFor(() => expect(screen.queryByText(/has been created/i)).toBeVisible())
    })
  })

  describe('when there is a matching item on another list', () => {
    const server = setupServer(
      rest.post(`${backendBaseUri}/inventory_lists/${allInventoryLists[2].id}/inventory_items`, (req, res, ctx) => {
        const listId = allInventoryLists[2].id
        const description = req.body.inventory_list_item.description
        const quantity = req.body.inventory_list_item.quantity
        const unit_weight = Number(req.body.inventory_list_item.unit_weight)
        const notes = req.body.inventory_list_item.notes

        const allItemsListItem = allInventoryLists[0].list_items.find(item => item.description.toLowerCase() === description.toLowerCase())

        const json = [
          {
            ...allItemsListItem,
            quantity: allItemsListItem.quantity + quantity,
            unit_weight,
            notes // just because in the existing matching item for this test the notes are null
          },
          {
            id: 855,
            list_id: listId,
            description,
            quantity,
            unit_weight,
            notes
          }
        ]

        return res(
          ctx.status(201),
          ctx.json(json)
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('updates the list items and displays a flash message', async () => {
      component = renderComponentWithMockCookies()

      const listTitle = await screen.findByText('Heljarchen Hall')
      const listEl = listTitle.closest('.root')

      // Expand the list element
      fireEvent.click(listTitle)

      const formTrigger = await within(listEl).findByText('Add item to list...')

      // Expand the form to add an item
      fireEvent.click(formTrigger)

      const descriptionInput = await within(listEl).findByPlaceholderText(/description/i)
      const quantityInput = within(listEl).getByDisplayValue('1')
      const unitWeightInput = within(listEl).getByPlaceholderText('Unit Weight')
      const notesInput = within(listEl).getByPlaceholderText(/notes/i)

      const form = descriptionInput.closest('form')

      // Fill out and submit the form
      fireEvent.change(descriptionInput, { target: { value: 'Nirnroot' } })
      fireEvent.change(quantityInput, { target: { value: '5' } })
      fireEvent.change(unitWeightInput, { target: { value: '1' } })
      fireEvent.change(notesInput, { target: { value: 'To make invisibility potions' } })

      fireEvent.submit(form)

      // Item should be added to the list
      const itemTitle = await within(listEl).findByText('Nirnroot')
      const itemElOnRegList = itemTitle.closest('.root')
      expect(itemTitle).toBeVisible()

      // Form should be hidden
      await waitFor(() => expect(form).not.toBeVisible())

      // Check that the attributes of the item on the list are correct
      fireEvent.click(itemTitle)

      await waitFor(() => expect(within(itemElOnRegList).queryByText('5')).toBeVisible())
      expect(itemElOnRegList).toHaveTextContent(/To make invisibility potions/)
      expect(within(itemElOnRegList).queryByText('1')).toBeVisible()

      // The item should be updated on the all items list but should not appear
      // on the list twice.
      const allItemsTitle = await screen.findByText(/all items/i)
      const allItemsEl = allItemsTitle.closest('.root')

      fireEvent.click(allItemsTitle)

      const item = await within(allItemsEl).findByText('Nirnroot')
      const itemEl = item.closest('.root')

      expect(item).toBeVisible()

      fireEvent.click(item)

      await waitFor(() => expect(within(itemEl).queryByText('9')).toBeVisible())
      expect(itemEl).toHaveTextContent(/To make invisibility potions/)
      expect(within(itemEl).queryByText('1')).toBeVisible()
    })
  })

  describe('when there is a matching item on the same list', () => {
    const server = setupServer(
      rest.post(`${backendBaseUri}/inventory_lists/${allInventoryLists[1].id}/inventory_items`, (req, res, ctx) => {
        const listId = allInventoryLists[1].id
        const description = req.body.inventory_list_item.description
        const quantity = req.body.inventory_list_item.quantity
        const notes = req.body.inventory_list_item.notes

        const regularListItem = allInventoryLists[1].list_items.find(item => item.description.toLowerCase() === description.toLowerCase())
        const allItemsListItem = allInventoryLists[0].list_items.find(item => item.description.toLowerCase() === description.toLowerCase())

        const json = [
          {
            ...allItemsListItem,
            quantity: allItemsListItem.quantity + quantity,
            notes: `${allItemsListItem.notes} -- ${notes}`
          },
          {
            ...regularListItem,
            quantity: regularListItem.quantity + quantity,
            notes: `${regularListItem.notes} -- ${notes}`
          }
        ]

        return res(
          ctx.status(200),
          ctx.json(json)
        )
      })
    )

    beforeAll(() => server.listen())
    beforeEach(() => server.resetHandlers())
    afterAll(() => server.close())

    it('updates the list items and displays a flash message', async () => {
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
      fireEvent.change(descriptionInput, { target: { value: 'Ebony sword' } })
      fireEvent.change(quantityInput, { target: { value: '2' } })
      fireEvent.change(notesInput, { target: { value: 'notes 3' } })

      fireEvent.submit(form)

      // The item should be present on the list but should be there only once. The
      // findByText query will fail if there is more than one matching element.
      const itemTitle = await within(listEl).findByText('Ebony sword')
      const itemElOnRegList = itemTitle.closest('.root')
      expect(itemTitle).toBeVisible()

      // Form should be hidden
      await waitFor(() => expect(form).not.toBeVisible())

      // Check that the attributes of the item on the list are correct
      fireEvent.click(itemTitle)

      await waitFor(() => expect(within(itemElOnRegList).queryByText('3')).toBeVisible())
      expect(itemElOnRegList).toHaveTextContent('notes 1 -- notes 3')

      // The item should be on the all items list only once as well.
      const allItemsTitle = await screen.findByText(/all items/i)
      const allItemsEl = allItemsTitle.closest('.root')

      fireEvent.click(allItemsTitle)

      const itemTitleOnAggList = await within(allItemsEl).findByText('Ebony sword')
      const itemElOnAggList = itemTitleOnAggList.closest('.root')

      expect(itemElOnAggList).toBeVisible()

      // Expand the item to see its attributes
      fireEvent.click(itemTitleOnAggList)

      await waitFor(() => expect(within(itemElOnAggList).queryByText('4')).toBeVisible())
      expect(itemElOnAggList).toHaveTextContent('notes 1 -- notes 2 -- notes 3')

      // There should be a flash message indicating the item was combined with another item
      await waitFor(() => expect(screen.queryByText(/combined with another item/i)).toBeVisible())
    })
  })
})
