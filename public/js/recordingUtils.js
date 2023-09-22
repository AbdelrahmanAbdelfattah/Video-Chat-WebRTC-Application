import * as store from "./store.js";

let mediaRecorder;
// Codecs, short for "compression-decompression," are software or hardware algorithms that encode and decode digital data,
// particularly audio and video. They play a crucial role in multimedia applications by compressing data for transmission or
// storage and then decompressing it for playback.
const vp9Codec = "video/webm; codecs=vp=9";
const v9Options = {
  mimType: vp9Codec,
};
const recordedChunks = [];

export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;

  if (MediaRecorder.isTypeSupported(vp9Codec)) {
    mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
  } else {
    mediaRecorder = new MediaRecorder(remoteStream);
  }

  // this eventListener will be excuted after the recorder will be stopped
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

export const pauseRecording = () => {
  mediaRecorder.pause();
};

export const resumeRecording = () => {
  mediaRecorder.resume();
};

export const stopRecording = () => {
  mediaRecorder.stop();
};

const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none;";
  a.href = url;
  a.download = "recording.webm";
  a.click();
  // release the resources related to this link (binary data in the memory)
  window.URL.revokeObjectURL(url);
};

const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    downloadRecordedVideo();
  }
};
