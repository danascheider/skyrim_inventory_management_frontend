import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import SlideToggle from 'react-slide-toggle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import withModal from '../../hocs/withModal'
import { useAppContext, useGamesContext } from '../../hooks/contexts'
import ModalGameForm from '../modalGameForm/modalGameForm'
import styles from './game.module.css'

const DEFAULT_DESCRIPTION = 'This game has no description.'
const DESTROY_CONFIRMATION = 'Are you sure you want to delete this game? This cannot be undone. You will lose all data associated with the game you delete.'

const Game = ({ gameId, name, description }) => {
  const [toggleEvent, setToggleEvent] = useState(0)

  const {
    setFlashAttributes,
    setFlashVisible,
    setModalVisible,
    setModalAttributes
  } = useAppContext()
  const { performGameDestroy } = useGamesContext()

  const mountedRef = useRef(true)
  const iconsRef = useRef(null)
  const editRef = useRef(null)
  const destroyRef = useRef(null)

  const refContains = (ref, el) => ref.current && (ref.current === el || ref.current.contains(el))

  const toggleDescription = e => {
    if (!e || !refContains(iconsRef, e.target)) setToggleEvent(Date.now)
  }

  const showEditForm = () => {
    setFlashVisible(false)

    const attributes = { id: gameId, name, description }

    const ModalComponent = withModal(ModalGameForm)
    setModalAttributes({
      Tag: ModalComponent,
      props: {
        title: 'Edit Game',
        type: 'edit',
        currentAttributes: attributes
      }
    })
    setModalVisible(true)
  }

  const destroyGame = e => {
    setFlashVisible(false)

    const confirmed = window.confirm(DESTROY_CONFIRMATION)

    const displayFlashAndUnmount = () => {
      setFlashVisible(true)
      mountedRef.current = false
    }

    if (confirmed) {
      const callbacks = {
        onSuccess: displayFlashAndUnmount,
        onInternalServerError: () => mountedRef.current && setFlashVisible(true)
      }

      performGameDestroy(gameId, callbacks)
    } else {
      setFlashAttributes({
        type: 'info',
        message: 'Your game was not deleted.'
      })
      
      setFlashVisible(true)
    }
  }

  useEffect(() => (
    () => mountedRef.current = false
  ), [])

  return(
    <div className={styles.root}>
      <div className={styles.header} onClick={toggleDescription}>
        <span ref={iconsRef} className={styles.editIcons}>
          <button
            ref={destroyRef}
            className={styles.icon}
            onClick={destroyGame}
            data-testid={`game-destroy-icon`}
          >
            <FontAwesomeIcon className={styles.fa} icon={faTimes} />
          </button>
          <button
            ref={editRef}
            className={styles.icon}
            onClick={showEditForm}
            data-testid={`game-edit-icon`}
          >
            <FontAwesomeIcon className={styles.fa} icon={faEdit} />
          </button>
        </span>
        <h3 className={styles.name}>{name}</h3>
      </div>
      <SlideToggle toggleEvent={toggleEvent} collapsed>
        {({ setCollapsibleElement }) => (
          <div className={styles.collapsible} ref={setCollapsibleElement}>
            <p className={styles.description}>{description || DEFAULT_DESCRIPTION}</p>
          </div>
        )}
      </SlideToggle>
    </div>
  )
}

Game.propTypes = {
  gameId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string
}

export default Game
