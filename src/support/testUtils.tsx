import { type ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { JSDOM } from 'jsdom'
import { render as originalRender } from '@testing-library/react'
import { LoginContext } from '../contexts/loginContext'
import {
  loadingLoginContextValue,
  loginContextValue,
  unauthenticatedLoginContextValue,
} from './data/contextValues'

export const BASE_APP_URI = 'http://localhost:5173'

declare global {
  namespace NodeJS {
    interface Global {
      document: Document
      window: Window
    }
  }
}

const setDom = (url?: string) => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: url || 'http://localhost:5173',
  })

  global.window = dom.window as unknown as Window & typeof globalThis
  global.document = dom.window.document
}

/**
 *
 * Test Renderers
 *
 */

export const render = (ui: ReactElement, url?: string) => {
  setDom(url)

  return originalRender(ui)
}

export const renderWithRouter = (ui: ReactElement, url?: string) =>
  render(<BrowserRouter>{ui}</BrowserRouter>, url)

export const renderAuthenticated = (ui: ReactElement, url?: string) =>
  renderWithRouter(
    <LoginContext.Provider value={loginContextValue}>
      {ui}
    </LoginContext.Provider>,
    url
  )

export const renderUnauthenticated = (ui: ReactElement, url?: string) =>
  renderWithRouter(
    <LoginContext.Provider value={unauthenticatedLoginContextValue}>
      {ui}
    </LoginContext.Provider>,
    url
  )

export const renderAuthLoading = (ui: ReactElement, url?: string) =>
  renderWithRouter(
    <LoginContext.Provider value={loadingLoginContextValue}>
      {ui}
    </LoginContext.Provider>,
    url
  )
