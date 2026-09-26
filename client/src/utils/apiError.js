const FALLBACK_MESSAGE = "Something went wrong. Try again.";

const MESSAGES_BY_STATUS = {
  400: "Check the information and try again.",
  401: "The phone number or PIN is not correct.",
  403: "This account cannot do that.",
  409: "An account already exists for this phone number.",
  429: "Too many wrong PIN attempts. Try again later.",
};

export const getApiErrorMessage = (error) => {
  const serverMessage = error.response?.data?.message;

  if (serverMessage) {
    return serverMessage;
  }

  return MESSAGES_BY_STATUS[error.response?.status] ?? FALLBACK_MESSAGE;
};
