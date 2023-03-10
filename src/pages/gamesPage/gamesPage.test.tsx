import { describe, test, expect, beforeEach, afterEach, vitest } from 'vitest'
import {
  screen,
  act,
  waitFor,
  waitForElementToBeRemoved,
  cleanup,
} from '@testing-library/react'
import {
  renderAuthenticated,
  renderAuthLoading,
  testUser,
} from '../../support/testUtils'
import { emptyGames, allGames } from '../../support/data/games'
import { internalServerErrorResponse } from '../../support/data/errors'
import { PageProvider } from '../../contexts/pageContext'
import { GamesProvider } from '../../contexts/gamesContext'
import GamesPage from './gamesPage'

describe('<GamesPage />', () => {
  afterEach(() => {
    fetch.resetMocks()
    cleanup()
  })

  describe('viewing games', () => {
    describe('when loading', () => {
      test('displays the loader', () => {
        const wrapper = renderAuthLoading(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )
        expect(wrapper).toBeTruthy()

        expect(screen.getByTestId('pulseLoader')).toBeTruthy()
      })

      test('matches snapshot', () => {
        const wrapper = renderAuthLoading(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )

        expect(wrapper).toMatchSnapshot()
      })
    })

    describe('when there are no games', () => {
      beforeEach(() => {
        fetch.mockResponseOnce(JSON.stringify(emptyGames), { status: 200 })
      })

      test('games page displays a message that there are no games', async () => {
        const wrapper = renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )
        expect(wrapper).toBeTruthy()

        await waitFor(() => {
          expect(screen.findByText('You have no games.')).toBeTruthy()
          expect(screen.queryByTestId('pulseLoader')).toBeFalsy()
        })
      })

      test('matches snapshot', () => {
        const wrapper = renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )
        expect(wrapper).toMatchSnapshot()
      })
    })

    describe('when there are multiple games', () => {
      beforeEach(() => {
        fetch.mockResponseOnce(JSON.stringify(allGames), { status: 200 })
      })

      // Descriptions should be hidden by default but Vitest has no way of knowing
      // that, as noted in the test file for the GameLineItem component.
      test('displays the title and description of each game', async () => {
        renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )

        await waitFor(() => {
          expect(screen.findByText('My Game 1')).toBeTruthy()
          expect(
            screen.findByText('This is a game with a description')
          ).toBeTruthy()

          expect(screen.findByText('My Game 2')).toBeTruthy()
          expect(
            screen.findByText('This game has no description.')
          ).toBeTruthy()

          expect(
            screen.getByText(
              'Game with a really really really really really long name'
            )
          ).toBeTruthy()
          expect(
            screen.getByText(
              /Cum audissem Antiochum, Brute, ut solebam, cum M\. Pisone/
            )
          ).toBeTruthy()

          expect(screen.queryByTestId('pulseLoader')).toBeFalsy()
          expect(screen.queryByText('You have no games.')).toBeFalsy()
        })
      })

      test('matches snapshot', () => {
        const wrapper = renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )
        expect(wrapper).toMatchSnapshot()
      })
    })

    describe('when the server returns an error', () => {
      beforeEach(() => {
        fetch.mockResponseOnce(JSON.stringify(internalServerErrorResponse), {
          status: 500,
        })
      })

      test('displays error content', async () => {
        renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )

        await waitFor(() => {
          expect(screen.findByText('500 Internal Server Error')).toBeTruthy()
        })
      })

      test("doesn't break the dashboard", () => {
        renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )

        expect(screen.getByText('Your Games')).toBeTruthy()
      })

      test('matches snapshot', () => {
        const wrapper = renderAuthenticated(
          <PageProvider>
            <GamesProvider>
              <GamesPage />
            </GamesProvider>
          </PageProvider>
        )

        expect(wrapper).toMatchSnapshot()
      })
    })
  })
})
