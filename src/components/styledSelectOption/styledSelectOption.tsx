import {
  type CSSProperties,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from 'react'
import classNames, { type Argument } from 'classnames'
import styles from './styledSelectOption.module.css'

interface StyledSelectOptionProps {
  optionName: string
  onClick: MouseEventHandler
  onKeyDown: KeyboardEventHandler
  ariaSelected: boolean
  className?: Argument
}

const StyledSelectOption = ({
  optionName,
  onClick,
  onKeyDown,
  ariaSelected,
  className,
}: StyledSelectOptionProps) => {
  const displayName = () =>
    optionName.length > 24
      ? `${optionName.substring(0, 23).trim()}...`
      : optionName

  return (
    <li
      className={classNames(styles.root, className)}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="option"
      tabIndex={0}
      aria-selected={ariaSelected}
    >
      {displayName()}
    </li>
  )
}

export default StyledSelectOption
