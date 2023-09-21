import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

let connectedUserDetails;
let peerConnection;

const defaultConstraints = {
  audio: true,
  video: true,
};

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:13902" }],
};

export const getLocalPreview = () => {
  console.log("the video is playing from getLocalPreview");
  //  The navigator object is a part of the JavaScript Web API,
  //  specifically the Browser Object Model (BOM). It provides information
  //  about the client's web browser and its capabilities. It's not part of the core JavaScript language
  //  but is available in browser environments.
  //  navigator.mediaDevices:
  //  Provides access to media input devices like cameras and microphones through the MediaDevices API.

  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      store.setLocalStream(stream);
    })
    .catch((err) => {
      console.log("error occured when trying to get an access to camera");
      console.log(err);
    });
};

const createPeerConnection = () => {
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    console.log("getting ice candidate from stun server");
    if (event.candidate) {
      // send our ice candidate to other peer
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("Successfully connected with other peer");
    }
  };

  // reciving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);
  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to perrconnection

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConnection.addTrack(track, localStream);
    }
  }
};

export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    socketId: calleePersonalCode,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = { callType, calleePersonalCode };

    ui.showCallingDialog(callingDialogRejectCallHandler);
    wss.sendPreOffer(data);
  }
};

export const handlePreOffer = (data) => {
  const { callerSocketId, callType } = data;

  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};

export const acceptCallHandler = () => {
  console.log("call accepted");
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

export const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => {
  console.log("rejecting the call");
};

export const sendPreOfferAnswer = (preOfferAnswer) => {
  const data = {
    callerSocketId: connectedUserDetails.socketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;

  ui.removeAllDialogs();

  //user disconnect for example
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that callee has not been found
  }

  //user in another call for example
  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that callee is not able to connect
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    console.log("call rejected");
    ui.showInfoDialog(preOfferAnswer);
    //show dialog that call is rejected by callee
  }

  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    //send webREC offer
    sendWebRTCOffer();
  }
};

const sendWebRTCOffer = async () => {
  const offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer: offer,
  });
};

export const handleWebRTCOffer = async (data) => {
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
    answer: answer,
  });
};

export const handleWebRTCAnswer = async (data) => {
  console.log("handle webRTC answer");
  await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
  try {
    await peerConnection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error("error occured when trying to add recieved candidate", err);
  }
};
