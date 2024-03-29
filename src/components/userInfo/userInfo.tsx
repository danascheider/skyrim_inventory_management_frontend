import { type MouseEventHandler, useState } from 'react'
import classnames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { useGoogleLogin } from '../../hooks/contexts'
import anonymousAvatar from './anonymousAvatar.jpg'
import styles from './userInfo.module.css'

const UserInfo = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const { user, signOut } = useGoogleLogin()

  const toggleDropdown: MouseEventHandler = (): void => {
    setDropdownVisible(!dropdownVisible)
  }

  if (user) {
    const { displayName, email, photoURL } = user

    return (
      <span className={styles.root}>
        <div className={styles.main}>
          <div className={styles.button} role="button" onClick={toggleDropdown}>
            <FontAwesomeIcon icon={faBars} className={styles.hamburger} />
            <span className={styles.info}>
              <p className={styles.name}>{displayName}</p>
              <p className={styles.email}>{email}</p>
            </span>
            <img
              className={styles.img}
              src={photoURL || anonymousAvatar}
              alt="User profile image"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
        <menu
          className={classnames(styles.dropdown, {
            [styles.active]: dropdownVisible,
          })}
        >
          <div role="button" onClick={signOut}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            <p className={styles.signOutText}>Sign Out</p>
          </div>
        </menu>
      </span>
    )
  } else {
    return (
      <div className={styles.main}>
        <div className={styles.button}>
          <FontAwesomeIcon icon={faBars} className={styles.hamburger} />
          <img
            className={styles.img}
            src={anonymousAvatar}
            alt="User profile image"
          />
        </div>
      </div>
    )
  }
}

export default UserInfo
