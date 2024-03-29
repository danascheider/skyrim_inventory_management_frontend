import {
  useState,
  useRef,
  useEffect,
  type FormEventHandler,
  type CSSProperties,
  type ChangeEvent,
  type RefObject,
} from 'react'
import classNames from 'classnames'
import { useColorScheme } from '../../hooks/contexts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareCheck } from '@fortawesome/free-regular-svg-icons'
import styles from './listEditForm.module.css'
import { measureText } from '../../utils/measureText'

const FIXED_BUTTON_WIDTH = 72 // px

interface EditFormProps {
  formRef: RefObject<any>
  maxTotalWidth: number
  title: string
  onSubmit: FormEventHandler
  className?: string
}

const ListEditForm = ({
  formRef,
  maxTotalWidth,
  className,
  title,
  onSubmit,
}: EditFormProps) => {
  const MAX_TEXT_WIDTH = maxTotalWidth - FIXED_BUTTON_WIDTH - 2

  const getInputTextWidth = (text: string) => {
    const font = '21px Quattrocento Sans'
    const textWidth = measureText(text, font)

    return Math.min(textWidth, MAX_TEXT_WIDTH)
  }

  const [inputValue, setInputValue] = useState(title)
  const [inputWidth, setInputWidth] = useState(
    `${getInputTextWidth(inputValue)}px`
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const {
    schemeColorDarkest,
    textColorPrimary,
    borderColor,
    schemeColorLightest,
  } = useColorScheme()

  const rootStyles = {
    '--scheme-color': schemeColorDarkest,
    '--text-color': textColorPrimary,
    '--border-color': borderColor,
    '--icon-hover-color': schemeColorLightest,
    '--max-width': `${maxTotalWidth}px`,
  } as CSSProperties

  const updateInputWidth = (e: ChangeEvent) => {
    const newValue = (e.currentTarget as HTMLInputElement)?.value || ''
    setInputValue(newValue)
    setInputWidth(`${getInputTextWidth(newValue)}px`)
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setInputWidth(`${getInputTextWidth(inputValue)}px`)
  }, [maxTotalWidth])

  return (
    <form
      className={classNames(className, styles.root)}
      style={rootStyles}
      ref={formRef}
      onSubmit={onSubmit}
      aria-label="List title edit form"
    >
      <input
        className={styles.input}
        onClick={(e) => e.stopPropagation()}
        onChange={updateInputWidth}
        type="text"
        name="title"
        aria-label="title"
        ref={inputRef}
        style={{ width: inputWidth }}
        defaultValue={inputValue}
        pattern="^\s*[A-Za-z0-9 \-',]*\s*$"
        title="Title can only contain alphanumeric characters, spaces, hyphens, commas, and apostrophes"
        data-testid="editListTitle"
      />
      <button
        className={styles.submit}
        ref={buttonRef}
        name="submit"
        type="submit"
      >
        <FontAwesomeIcon className={styles.fa} icon={faSquareCheck} />
      </button>
    </form>
  )
}

export default ListEditForm
