import { describe, test, expect } from 'vitest'
import { BASE_APP_URI, renderAuthenticated } from '../../support/testUtils'
import UserInfo from './userInfo'

describe('<UserInfo />', () => {
  test('UserInfo displays user name and email', () => {
    const wrapper = renderAuthenticated(<UserInfo />)
    expect(wrapper).toBeTruthy()

    expect(wrapper.getByText('Edna St. Vincent Millay')).toBeTruthy()
    expect(wrapper.getByText('edna@gmail.com')).toBeTruthy()

    const img = wrapper.container.querySelector('img')
    expect(img?.src).toBe(`${BASE_APP_URI}/src/support/testProfileImg.png`)
  })

  test('UserInfo matches snapshot', () => {
    const wrapper = renderAuthenticated(<UserInfo />)
    expect(wrapper).toMatchSnapshot()
  })
})
