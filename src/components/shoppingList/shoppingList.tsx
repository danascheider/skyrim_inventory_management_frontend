import {
  useState,
  useRef,
  useEffect,
  type MouseEventHandler,
  type FormEventHandler,
  type ReactElement,
  type CSSProperties,
} from 'react'
import AnimateHeight from 'react-animate-height'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { type RequestShoppingList } from '../../types/apiData'
import {
  useColorScheme,
  usePageContext,
  useShoppingListsContext,
} from '../../hooks/contexts'
import useComponentVisible from '../../hooks/useComponentVisible'
import useSize from '../../hooks/useSize'
import ShoppingListItemCreateForm from '../shoppingListItemCreateForm/shoppingListItemCreateForm'
import ListEditForm from '../listEditForm/listEditForm'
import styles from './shoppingList.module.css'

interface ShoppingListProps {
  listId: number
  title: string
  editable?: boolean
  children?: ReactElement | ReactElement[] | null
}

const ShoppingList = ({
  listId,
  title,
  editable = false,
  children,
}: ShoppingListProps) => {
  const { updateShoppingList, destroyShoppingList } = useShoppingListsContext()
  const { setFlashProps } = usePageContext()
  const [expanded, setExpanded] = useState(false)
  const [maxEditFormWidth, setMaxEditFormWidth] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const iconsRef = useRef<HTMLSpanElement>(null)

  const size = useSize(containerRef)

  const {
    componentRef,
    triggerRef,
    isComponentVisible,
    setIsComponentVisible,
  } = useComponentVisible()

  const {
    schemeColorDarkest,
    borderColor,
    textColorPrimary,
    textColorSecondary,
    hoverColorDark,
    schemeColorDark,
    schemeColorLightest,
  } = useColorScheme()

  const styleVars = {
    '--scheme-color': schemeColorDarkest,
    '--border-color': borderColor,
    '--text-color-primary': textColorPrimary,
    '--text-color-secondary': textColorSecondary,
    '--hover-color': hoverColorDark,
    '--scheme-color-lighter': schemeColorDark,
    '--scheme-color-lightest': schemeColorLightest,
    '--max-title-width': `${maxEditFormWidth - 32}px`,
  } as CSSProperties

  const shouldToggleDetails = (target: Node) => {
    if (
      iconsRef.current &&
      (iconsRef.current === target || iconsRef.current.contains(target))
    )
      return false

    if (
      componentRef.current &&
      (componentRef.current === target || componentRef.current.contains(target))
    )
      return false

    return true
  }

  const toggleDetails: MouseEventHandler = (e) => {
    const target = e.target as Node

    if (shouldToggleDetails(target)) {
      setExpanded(!expanded)
    }
  }

  const destroy: MouseEventHandler = (e) => {
    e.preventDefault()

    const confirmation = `Are you sure you want to delete the list "${title}"? You will also lose any list items on the list. This action cannot be undone.`
    const confirmed = window.confirm(confirmation)

    if (confirmed) {
      destroyShoppingList(listId)
    } else {
      setFlashProps({
        hidden: false,
        type: 'info',
        message: 'OK, your shopping list will not be destroyed.',
      })
    }
  }

  const extractAttributes = (formData: FormData): RequestShoppingList => {
    const attributes = ({ title } = Object.fromEntries(
      Array.from(formData.entries())
    ) as Record<string, string>)

    return attributes
  }

  const submitAndHideForm: FormEventHandler = (e) => {
    e.preventDefault()

    if (!componentRef.current) return

    const formData = new FormData(componentRef.current)
    const attributes = extractAttributes(formData)

    const onSuccess = () => setIsComponentVisible(false)

    updateShoppingList(listId, attributes, onSuccess)
  }

  useEffect(() => {
    if (!editable || !size || !iconsRef.current) return

    const width = size.width - iconsRef.current.offsetWidth + 16

    setMaxEditFormWidth(width)
  }, [editable, size])

  return (
    <div className={styles.root} style={styleVars}>
      <div
        role="button"
        ref={containerRef}
        className={styles.trigger}
        onClick={toggleDetails}
        aria-expanded={expanded}
        aria-controls={`list${listId}Details`}
      >
        {editable && (
          <span className={styles.icons} ref={iconsRef}>
            <button
              className={styles.icon}
              onClick={destroy}
              data-testid={`destroyShoppingList${listId}`}
            >
              <FontAwesomeIcon className={styles.fa} icon={faXmark} />
            </button>
            <button
              ref={triggerRef}
              className={styles.icon}
              data-testid={`editShoppingList${listId}`}
            >
              <FontAwesomeIcon className={styles.fa} icon={faPenToSquare} />
            </button>
          </span>
        )}
        {editable && isComponentVisible ? (
          <ListEditForm
            formRef={componentRef}
            className={styles.form}
            title={title}
            maxTotalWidth={maxEditFormWidth}
            onSubmit={submitAndHideForm}
          />
        ) : (
          <h3 className={styles.title}>{title}</h3>
        )}
      </div>
      <AnimateHeight
        id={`list${listId}Details`}
        duration={200}
        height={expanded ? 'auto' : 0}
      >
        <div className={styles.details}>
          {editable && <ShoppingListItemCreateForm listId={listId} />}
          {/* We only want to display the "This shopping list has no list items"
          message if there is no list item creation form */}
          {children || editable ? (
            children
          ) : (
            <p className={styles.emptyList}>
              This shopping list has no list items.
            </p>
          )}
        </div>
      </AnimateHeight>
    </div>
  )
}

export default ShoppingList
