import { registerRootComponent } from 'expo';

import App from './App';

if (!__DEV__) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}

registerRootComponent(App);
