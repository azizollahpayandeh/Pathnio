import { registerRootComponent } from "expo";

// Import the background location task FIRST, so its TaskManager.defineTask()
// call runs the moment the JS bundle loads — including when the OS relaunches
// us headless in the background after the app is closed. Without this the task
// is undefined on a headless launch and background GPS stops once the app is
// closed, which is exactly what the driver app must keep doing.
import "./src/location/task";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent("main", () => App);
// it also ensures the environment is set up appropriately for Expo Go / dev builds.
registerRootComponent(App);
