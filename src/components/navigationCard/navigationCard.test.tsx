import { describe, test, expect } from 'vitest'
import { BASE_APP_URI, renderWithRouter } from '../../support/testUtils'
import { BLUE } from '../../utils/colorSchemes'
import { ColorProvider } from '../../contexts/colorContext'
import paths from '../../routing/paths'
import NavigationCard from './navigationCard'

describe('NavigationCard component', () => {
  test('NavigationCard component displays properly', () => {
    const wrapper = renderWithRouter(
      <ColorProvider colorScheme={BLUE}>
        <NavigationCard href={paths.home}>Go Home!</NavigationCard>
      </ColorProvider>
    )
    expect(wrapper).toBeTruthy()

    const a = wrapper.container.querySelector('a')
    expect(a?.textContent).toBe('Go Home!')
    expect(a?.href).toBe(`${BASE_APP_URI}${paths.home}`)
  })

  test('matches snapshot', () => {
    const wrapper = renderWithRouter(
      <ColorProvider colorScheme={BLUE}>
        <NavigationCard href={paths.home}>Go Home!</NavigationCard>
      </ColorProvider>
    )

    expect(wrapper).toMatchSnapshot()
  })
})
