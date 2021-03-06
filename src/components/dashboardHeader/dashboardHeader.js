import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import paths from '../../routing/paths'
import { useAppContext } from '../../hooks/contexts'
import LogoutDropdown from '../logoutDropdown/logoutDropdown'
import anonymousAvatar from './anonymousAvatar.jpg'
import styles from './dashboardHeader.module.css'

const DashboardHeader = () => {
  const {
    profileData,
    logOutAndRedirect
  } = useAppContext()

  const [dropdownVisible, setDropdownVisible] = useState(false)
  const mountedRef = useRef(true)

  const logOutFunction = useCallback((callback = null) => {
    setDropdownVisible(false);

    logOutAndRedirect(paths.home, () => {
      callback && callback()
      mountedRef.current = false
    })
  }, [logOutAndRedirect])

  useEffect(() => {
    return () => (mountedRef.current = false)
  }, [])

  return(
    <div className={styles.root}>
      <div className={styles.bar}>
        <span className={styles.headerContainer}>
          <h1 className={styles.header}>
            <Link className={styles.headerLinkLarge} to={paths.dashboard.main}>Skyrim Inventory<br className={styles.bp} /> Management</Link>
            <Link className={styles.headerLinkSmall} to={paths.dashboard.main}>S. I. M.</Link>
          </h1>
        </span>
        {profileData ?
        <button className={styles.profile} onClick={() => setDropdownVisible(!dropdownVisible)}>
          <div className={styles.profileText}>
            <p className={styles.textTop}>{profileData.name}</p>
            <p className={styles.textBottom}>{profileData.email}</p>
          </div>
          <img className={styles.avatar} src={profileData.image_url || anonymousAvatar} alt='User avatar' referrerPolicy='no-referrer' />
        </button> :
        null
        }
        <LogoutDropdown
          className={dropdownVisible ? styles.logoutDropdown : styles.hidden}
          logOutFunction={logOutFunction}
        />
      </div>
    </div>
  )
}

export default DashboardHeader
