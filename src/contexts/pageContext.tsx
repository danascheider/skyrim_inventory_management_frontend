import { createContext, useState, useEffect } from 'react'
import { ProviderProps } from '../types/contexts'
import { type FlashProps } from '../types/flashMessages'

interface PageContextType {
  flashProps: FlashProps
  setFlashProps: (props: FlashProps) => void
}

const defaultFlashProps: FlashProps = {
  type: 'info',
  message: '',
  hidden: true,
}

const PageContext = createContext<PageContextType>({
  flashProps: defaultFlashProps,
  setFlashProps: () => {},
})

const PageProvider = ({ children }: ProviderProps) => {
  const [flashProps, setFlashProps] = useState<FlashProps>(defaultFlashProps)

  useEffect(() => {
    if (flashProps.hidden === false) {
      setTimeout(() => setFlashProps({ ...flashProps, hidden: true }), 4000)
    }
  }, [flashProps])

  return (
    <PageContext.Provider value={{ flashProps, setFlashProps }}>
      {children}
    </PageContext.Provider>
  )
}

export { PageContext, PageProvider }
