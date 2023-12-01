import {
  useState,
  useRef,
  type CSSProperties,
  type RefObject,
  type MouseEventHandler,
} from 'react'
import classNames from 'classnames'
import AnimateHeight from 'react-animate-height'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark,
  faPenToSquare,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import {
  useColorScheme,
  usePageContext,
  useShoppingListsContext,
} from '../../hooks/contexts'
import ShoppingListItemEditForm from '../wishListItemEditForm/wishListItemEditForm'
import styles from './wishListItem.module.css'

interface ShoppingListItemProps {
  itemId: number
  listTitle: string
  description: string
  quantity: number
  unitWeight?: number | null
  notes?: string | null
  editable?: boolean
}

/**
 *
 * If the unit weight has an integer value, we want to display it
 * as an integer. Only if it has a non-zero value in the decimal
 * place should it be displayed as a decimal.
 *
 */

const formatWeight = (weight?: number | null) => {
  if (!weight) return '-'

  weight = Number(weight)
  return weight % 1 === 0 ? weight.toFixed(0) : weight.toFixed(1)
}

const ShoppingListItem = ({
  itemId,
  listTitle,
  description,
  quantity,
  unitWeight,
  notes,
  editable = false,
}: ShoppingListItemProps) => {
  const { apiCallsInProgress, setFlashProps, setModalProps } = usePageContext()
  const { destroyShoppingListItem, updateShoppingListItem } =
    useShoppingListsContext()

  const [expanded, setExpanded] = useState(false)
  const [incrementerDisabled, setIncrementerDisabled] = useState(
    !!apiCallsInProgress.shoppingListItems.length
  )

  const iconsRef = useRef<HTMLSpanElement>(null)
  const incRef = useRef<HTMLButtonElement>(null)
  const decRef = useRef<HTMLButtonElement>(null)

  const colorScheme = useColorScheme()
  const {
    schemeColorDark,
    hoverColorLight,
    textColorSecondary,
    borderColor,
    schemeColorLightest,
    textColorTertiary,
  } = colorScheme

  const styleVars = {
    '--main-color': schemeColorDark,
    '--title-text-color': textColorSecondary,
    '--border-color': borderColor,
    '--body-background-color': schemeColorLightest,
    '--body-text-color': textColorTertiary,
    '--hover-color': hoverColorLight,
  } as CSSProperties

  const refContains = (ref: RefObject<HTMLElement>, el: Node) =>
    ref.current && (ref.current === el || ref.current.contains(el))

  const iconRefContains = (el: Node) =>
    refContains(iconsRef, el) ||
    refContains(incRef, el) ||
    refContains(decRef, el)

  const toggleDetails: MouseEventHandler = (e) => {
    const target = e.target as Node

    if (!iconRefContains(target)) setExpanded(!expanded)
  }

  const displayEditForm: MouseEventHandler = (e) => {
    e.preventDefault()

    setModalProps({
      hidden: false,
      children: (
        <ShoppingListItemEditForm
          itemId={itemId}
          description={description}
          listTitle={listTitle}
          quantity={quantity}
          unitWeight={unitWeight}
          notes={notes}
          buttonColor={colorScheme}
        />
      ),
    })
  }

  const destroy: MouseEventHandler = (e) => {
    e.preventDefault()

    const confirmed = window.confirm(
      'Destroy wish list item? Your aggregate list will be updated to reflect the change. This action cannot be undone.'
    )

    if (confirmed) {
      destroyShoppingListItem(itemId)
    } else {
      setFlashProps({
        hidden: false,
        type: 'info',
        message: 'OK, your wish list item will not be deleted.',
      })
    }
  }

  const incrementQuantity: MouseEventHandler = (e) => {
    e.preventDefault()

    setIncrementerDisabled(true)

    const onRequestComplete = () => setIncrementerDisabled(false)

    updateShoppingListItem(
      itemId,
      { quantity: quantity + 1 },
      onRequestComplete,
      onRequestComplete
    )
  }

  const decrementQuantity: MouseEventHandler = (e) => {
    e.preventDefault()

    if (quantity === 1) {
      const confirmed = window.confirm(
        "You can't reduce wish list item quantity below 1. Would you like to delete this item? This cannot be undone."
      )

      if (confirmed) {
        setIncrementerDisabled(true)
        destroyShoppingListItem(itemId, null, () =>
          setIncrementerDisabled(false)
        )
      } else {
        setFlashProps({
          hidden: false,
          type: 'info',
          message: 'OK, your wish list item will not be deleted.',
        })
      }
    } else {
      const onRequestComplete = () => setIncrementerDisabled(false)

      setIncrementerDisabled(true)
      updateShoppingListItem(
        itemId,
        { quantity: quantity - 1 },
        onRequestComplete,
        onRequestComplete
      )
    }
  }

  return (
    <div
      className={classNames(styles.root, { [styles.expanded]: expanded })}
      style={styleVars}
    >
      <div
        className={styles.trigger}
        onClick={toggleDetails}
        aria-expanded={expanded}
        aria-controls={`shoppingListItem${itemId}Details`}
      >
        <span
          className={classNames(styles.descriptionContainer, {
            [styles.descriptionContainerEditable]: editable,
          })}
        >
          {editable && (
            <span className={styles.editIcons} ref={iconsRef}>
              <button
                className={styles.icon}
                onClick={destroy}
                data-testid={`destroyShoppingListItem${itemId}`}
              >
                <FontAwesomeIcon className={styles.fa} icon={faXmark} />
              </button>
              <button
                className={styles.icon}
                onClick={displayEditForm}
                data-testid={`editShoppingListItem${itemId}`}
              >
                <FontAwesomeIcon className={styles.fa} icon={faPenToSquare} />
              </button>
            </span>
          )}
          <h3 className={styles.description}>{description}</h3>
        </span>
        <span className={editable ? styles.quantityEditable : styles.quantity}>
          {editable && (
            <button
              className={styles.icon}
              ref={incRef}
              onClick={incrementQuantity}
              data-testid={`incrementShoppingListItem${itemId}`}
              disabled={incrementerDisabled}
            >
              <FontAwesomeIcon className={styles.fa} icon={faChevronUp} />
            </button>
          )}
          <span className={styles.quantityContent}>{quantity}</span>
          {editable && (
            <button
              className={styles.icon}
              ref={decRef}
              onClick={decrementQuantity}
              data-testid={`decrementShoppingListItem${itemId}`}
              disabled={incrementerDisabled}
            >
              <FontAwesomeIcon className={styles.fa} icon={faChevronDown} />
            </button>
          )}
        </span>
      </div>
      <AnimateHeight
        id={`shoppingListItem${itemId}Details`}
        duration={200}
        height={expanded ? 'auto' : 0}
      >
        <div className={styles.details}>
          <h4 className={styles.label}>Unit Weight:</h4>
          <p className={styles.value}>{formatWeight(unitWeight)}</p>

          {editable && (
            <>
              <h4 className={styles.label}>Notes:</h4>
              <p className={styles.value}>{notes || '-'}</p>
            </>
          )}
        </div>
      </AnimateHeight>
    </div>
  )
}

export default ShoppingListItem
