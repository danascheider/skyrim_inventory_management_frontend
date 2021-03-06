export const profileData = {
  id: 24,
  name: 'Jane Doe',
  email: 'jane.doe@gmail.com',
  uid: 'jane.doe@gmail.com',
  image_url: null
}

export const emptyShoppingLists = []

export const shoppingLists = [
  {
    id: 1,
    user_id: 24,
    aggregate: true,
    title: 'All Items',
    list_items: [
      {
        id: 2,
        list_id: 1,
        description: 'Ebony sword',
        quantity: 2,
        notes: 'notes 1 -- notes 2'
      },
      {
        id: 5,
        list_id: 1,
        description: 'Ingredients with "Frenzy" property',
        quantity: 4,
        notes: null
      },
      {
        id: 6,
        list_id: 1,
        description: "Item there's only one of on the aggregate list",
        quantity: 1,
        notes: 'notes1'
      }
    ]
  },
  {
    id: 2,
    user_id: 24,
    aggregate: false,
    title: 'Heljarchen Hall',
    list_items: [
      {
        id: 1,
        list_id: 2,
        description: 'Ebony sword',
        quantity: 1,
        notes: 'notes 1'
      },
      {
        id: 3,
        list_id: 2,
        description: 'Ingredients with "Frenzy" property',
        quantity: 4,
        notes: null
      },
      {
        id: 4,
        list_id: 2,
        description: "Item there's only one of on the aggregate list",
        quantity: 1,
        notes: 'notes1'
      }
    ]
  },
  {
    id: 3,
    user_id: 24,
    aggregate: false,
    title: 'Lakeview Manor',
    list_items: [
      {
        id: 5,
        list_id: 3,
        description: 'Ebony sword',
        quantity: 1,
        notes: 'notes 2'
      }
    ]
  }
]

export const shoppingListUpdateData = {
  user_id: 24,
  aggregate: false,
  list_items: [
    {
      id: 1,
      list_id: 1,
      description: 'Ebony sword',
      quantity: 1,
      notes: 'notes 1'
    },
    {
      id: 3,
      list_id: 1,
      description: 'Ingredients with "Frenzy" property',
      quantity: 4,
      notes: null
    }
  ]
}

export const removeOrAdjustItemsOnListDestroy = (aggregateList, items) => {
  const newAggregateListItems = []

  for (const item of items) {
    const existingAggregateListItem = aggregateList.list_items.find(listItem => listItem.description.toLowerCase() === item.description.toLowerCase())
    const aggregateListItem = removeOrAdjustItemOnItemDestroy(existingAggregateListItem, item)

    if (!aggregateListItem) continue // it should be removed from the array

    newAggregateListItems.push(aggregateListItem)
  }

  aggregateList.list_items = newAggregateListItems
  return newAggregateListItems.length === 0 ? null : aggregateList
}

export const removeOrAdjustItemOnItemDestroy = (aggregateListItem, destroyedItem) => {
  if (aggregateListItem.quantity === destroyedItem.quantity) return null

  aggregateListItem.quantity -= destroyedItem.quantity
  if (aggregateListItem.notes) aggregateListItem.notes.replace(destroyedItem.notes, '').replace(/^ --/, '').replace(/ -- $/, '')

  return aggregateListItem
}

const combineListItems = (existingItem, newItem) => {
  existingItem.quantity += newItem.quantity
  existingItem.description = newItem.description ?
    existingItem.description + ' -- ' + newItem.description :
    existingItem.description

  return existingItem
}

export const addOrCombineListItem = (list, item) => {
  const existingItem = list.list_items.find(listItem => listItem.description === item.description)
  
  if (!existingItem) return item

  return combineListItems(existingItem, item)
}

export const findListByListItem = (lists, itemId) => {
  for (const list of lists) {
    const item = list.list_items.find(listItem => listItem.id === itemId)
    if (item) return list
  }

  return null
}

export const adjustAggregateListItem = (aggregateListItem, deltaQuantity, oldNotes, newNotes) => {
  aggregateListItem.quantity = aggregateListItem.quantity + deltaQuantity

  if (oldNotes !== newNotes) {
    if (aggregateListItem.notes) {
      aggregateListItem.notes.replace(oldNotes, newNotes)
    } else {
      aggregateListItem.notes = newNotes
    }
  }

  return aggregateListItem
}
