import { type MouseEventHandler } from 'react'
import classNames from 'classnames'
import { usePageContext } from '../../hooks/contexts'
import { ModalProps } from '../../types/pageContext'
import styles from './modal.module.css'

const Modal = ({ hidden, children }: ModalProps) => {
  const { setModalProps } = usePageContext()

  const hideModal: MouseEventHandler = (e) => {
    e.stopPropagation()

    setModalProps({ hidden: true, children: <></> })
  }

  return (
    <div
      className={classNames(styles.root, { [styles.hidden]: hidden })}
      onMouseDown={hideModal}
      data-testid="modal"
    >
      <div className={styles.container}>
        <div
          className={styles.content}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
