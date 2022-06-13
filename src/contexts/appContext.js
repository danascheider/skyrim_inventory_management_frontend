/*
 *
 * For more information about contexts and how they are used in SIM,
 * visit the docs on SIM contexts (/docs/contexts.md)
 *
 * This context makes heavy use of the SIM API. The requests it makes are
 * mediated through the simApi module (/src/utils/simApi.js). To get information
 * about the API, its requirements, and its responses, visit the docs:
 * https://github.com/danascheider/skyrim_inventory_management/tree/main/docs/api
 *
 */

import { createContext, useEffect, useState, useRef, useCallback } from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { sessionCookieName } from '../utils/config'
import { fetchUserProfile } from '../utils/simApi'
import logOutWithGoogle from '../utils/logOutWithGoogle'
import { isTestEnv } from '../utils/isTestEnv'
import paths, { authenticatedPaths } from '../routing/paths'

const LOADING = 'loading'
const DONE = 'done'

const AppContext = createContext()

// overrideValue allows us to set the context value in Storybook.
// I hate having the testing apparatus baked into the app code but
// none of the solutions I found worked and I don't understand
// Storybook decorators and whatnot enough to figure out how to
// set the value for the context in the story,
const AppProvider = ({ children, overrideValue = {} }) => {
  const { pathname } = useLocation()
  const [cookies, setCookie, removeCookie] = useCookies([sessionCookieName])

  const [flashAttributes, setFlashAttributes] = useState({ type: 'info', message: '' })
  const [flashVisible, setFlashVisible] = useState(false)

  const [modalAttributes, setModalAttributes] = useState({})
  const [modalVisible, setModalVisible] = useState(false)

  const [profileData, setProfileData] = useState(overrideValue.profileData)
  const [redirectPath, setRedirectPath] = useState(overrideValue.shouldRedirectTo)
  const [profileLoadState, setProfileLoadState] = useState(overrideValue.profileLoadState || LOADING)

  const mountedRef = useRef(true)

  const removeSessionCookie = useCallback(() => removeCookie(sessionCookieName), [removeCookie])
  const setSessionCookie = token => setCookie(sessionCookieName, token)

  const setShouldRedirectTo = useCallback(path => {
    mountedRef.current && setRedirectPath(path)
    mountedRef.current = false
  }, [])

  const onAuthenticatedPage = useCallback(() => (
    authenticatedPaths.indexOf(pathname) > -1
  ), [pathname])

  const shouldFetchProfileData = useCallback(() => {
    return !overrideValue.profileData && cookies[sessionCookieName] && onAuthenticatedPage()
  }, [overrideValue.profileData, cookies, onAuthenticatedPage])

  const logOutAndRedirect = useCallback((path = paths.login, callback = null) => {
    logOutWithGoogle(() => {
      removeSessionCookie()
      callback && callback()
      onAuthenticatedPage() && setShouldRedirectTo(path)
    })
  }, [removeSessionCookie, onAuthenticatedPage, setShouldRedirectTo])

  const value = {
    token: cookies[sessionCookieName],
    profileData,
    removeSessionCookie,
    setSessionCookie,
    profileLoadState,
    setShouldRedirectTo,
    logOutAndRedirect,
    flashVisible,
    flashAttributes,
    setFlashVisible,
    setFlashAttributes,
    setModalVisible,
    setModalAttributes,
    modalVisible,
    modalAttributes,
    ...overrideValue // enables you to only change certain values
  }

  const fetchProfileData = () => {
    if (shouldFetchProfileData()) {
      fetchUserProfile(cookies[sessionCookieName])
        .then(({ status, json }) => {
          if (!mountedRef.current) return

          if (status === 200) {
            setProfileData(json)
            if (!overrideValue.profileLoadState) setProfileLoadState(DONE)
          } else {
            throw new Error('Internal Server Error: ', json.errors[0])
          }
        })
        .catch(error => {
          if (process.env.NODE_ENV === 'development') console.error('Error returned while fetching profile data: ', error.message)

          // I feel like this might not be the right behaviour if the error was a 500,
          // but I also can't think of a case where an error like this would occur and
          // not be a 401, given the user profile will be created during the authorization
          // step if it doesn't exist already.
          logOutAndRedirect()
        })
    } else if (isTestEnv && !overrideValue.profileLoadState) {
      setProfileLoadState(DONE)
    }
  }

  useEffect(() => {
    if (onAuthenticatedPage() && !cookies[sessionCookieName] && mountedRef.current) logOutAndRedirect()
  }, [onAuthenticatedPage, cookies, logOutAndRedirect])

  useEffect(fetchProfileData, [
                                onAuthenticatedPage,
                                logOutAndRedirect,
                                overrideValue.profileLoadState,
                                shouldFetchProfileData,
                                cookies
                              ])

  useEffect(() => (() => mountedRef.current = false), [])

  return(
    <AppContext.Provider value={value}>
      {redirectPath ? <Navigate to={redirectPath} /> : children}
    </AppContext.Provider>
  )
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
  overrideValue: PropTypes.shape({
    token: PropTypes.string,
    profileData: PropTypes.shape({
      id: PropTypes.number,
      uid: PropTypes.string,
      email: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      image_url: PropTypes.string
    }),
    setSessionCookie: PropTypes.func,
    removeSessionCookie: PropTypes.func,
    setProfileData: PropTypes.func,
    flashVisible: PropTypes.bool,
    flashAttributes: PropTypes.shape({
      type: PropTypes.oneOf(['error', 'info', 'success']).isRequired,
      message: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
      header: PropTypes.string
    }),
    setFlashVisible: PropTypes.func,
    setFlashAttributes: PropTypes.func,
    logOutAndRedirect: PropTypes.func,
    setModalVisible: PropTypes.func,
    setModalAttributes: PropTypes.func,
    modalVisible: PropTypes.bool,
    modalAttributes: PropTypes.shape({
      Tag: PropTypes.elementType,
      props: PropTypes.object
    })
  })
}

export { AppContext, AppProvider }
