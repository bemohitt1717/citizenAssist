const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const MESSAGES_BY_STATUS = {
  400: "Please check your details and try again.",
  401: "Incorrect mobile number or PIN.",
  403: "You don't have access to do that.",
  409: "An account already exists for this number.",
  429: "Too many attempts. Please try again later.",
};

export const getApiErrorMessage = (error) => {
  const serverMessage = error.response?.data?.message;

  if (serverMessage) {
    return serverMessage;
  }

  return MESSAGES_BY_STATUS[error.response?.status] ?? FALLBACK_MESSAGE;
};
