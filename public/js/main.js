import * as store from "./store.js";
import * as wss from "./wss.js";

const socket = io("/"); // Connect to the server
wss.registerSocketEvents(socket);
