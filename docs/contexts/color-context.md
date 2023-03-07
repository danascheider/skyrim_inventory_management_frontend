# ColorContext

The `ColorContext` keeps track of colour schemes. Set the colour scheme in the provider and then access it in the child/consumer component:

```tsx
/*
 *
 * /src/components/parent/parent.tsx
 *
 */

import { ColorProvider } from '../../contexts/colorContext'
import { GREEN } from '../../utils/colorSchemes'
import Child from '../child/child'

const Parent = () => (
  <ColorProvider colorScheme={GREEN}>
    <Child />
  </ColorProvider>
)

export default Parent

/*
 *
 * /src/components/child/child.tsx
 *
 */

import { useColorScheme } from '../../hooks/contexts'
import styles from './child.module.css'

const Child = () => {
  const { schemeColorDarkest, hoverColorDark, textColorPrimary } =
    useColorScheme()

  const styleVars = {
    '--background-color': schemeColorDarkest,
    '--hover-color': hoverColorDark,
    '--text-color': textColorPrimary,
  } as React.CSSProperties

  return (
    <div className={styles.root} style={styleVars}>
      Content or child components go here.
    </div>
  )
}

export default Child
```

The variables you set in `styleVars` can then be used in the child's CSS:

```css
/* /src/components/child/child.module.css */

.root {
  color: var(--text-color);
  background-color: var(--background-color);
}

.root:hover {
  background-color: var(--hover-color);
}
```

The `useColorScheme` hook can also be used to access the colour scheme in the child's children, as long as the same colour scheme is wanted for them.

## Types

The color scheme passed into the context provider must be of the `ColorScheme` type, exported from [this file](/src/utils/colorSchemes.ts). In general, you'll use the standard color schemes also exported from that file, designated `YELLOW`, `PINK`, `BLUE`, `GREEN`, and `AQUA`.
