# Contexts in SIM

SIM uses [React contexts](https://reactjs.org/docs/context.html) for state management. This prevents "smart" components that fetch data or control state from having to pass through props to their children, their children's children, and so on. There are currently four contexts:

* [AppContext](/docs/contexts/app-context.md)
* [GamesContext](/docs/contexts/games-context.md)
* [ShoppingListContext](/docs/contexts/shopping-list-context.md)
* [ColorContext](/docs/contexts/color-context.md)

For each context, there is a [custom hook](/src/hooks/contexts.js) that can be used to invoke it in consumers.
