let state = {
  socketId: null,
  localStream: null,
  allowConnectionsFromStrangers: false,
  screenSharingActive: false,
  screenSharingStream: null,
  remoteStream: null,
};

export const setSocketId = (socketId) => {
  state = { ...state, socketId: socketId };
  console.log(state);
};

export const setLocalStream = (stream) => {
  state = { ...state, localStream: stream };
};

export const setAllowConnectionFromStrangers = (allowConnection) => {
  state = { ...state, allowConnectionsFromStrangers: allowConnection };
};

export const setScreenSharingActive = (screenSharingActive) => {
  state = { ...state, screenSharingActive };
};

export const setScreenSharingStream = (stream) => {
  state = { ...state, screenSharingStream: stream };
};

export const setRemoteStream = (stream) => {
  state = { ...state, remoteStream: stream };
};

export const getState = () => {
  return state;
};
