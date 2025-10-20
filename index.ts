import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import { registerGlobals } from '@livekit/react-native-webrtc';

import App from './App';

// registerGlobals() must be called before any other imports or code
registerGlobals();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately.
registerRootComponent(App);
