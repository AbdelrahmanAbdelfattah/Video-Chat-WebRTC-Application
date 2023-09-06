import * as store from "./store.js";
import * as wss from "./wss.js";

//initialization of socketIO connection
const socket = io("/"); // Connect to the server
wss.registerSocketEvents(socket);

//register event for personal code copy buttons
const personlaCodeCopyButton = document.getElementById(
  "personal_code_copy_button"
);
personlaCodeCopyButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard.writeText(personalCode);
});
