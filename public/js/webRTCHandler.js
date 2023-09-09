import * as wss from "./wss.js";

export const sendPreOffer = (callType, calleePersonalCode) => {
  const data = { callType, calleePersonalCode };

  wss.sendPreOffer(data);
};

export const handlePreOffer = (data) => {
  console.log("pre-offer came");
  console.log(data);
};
