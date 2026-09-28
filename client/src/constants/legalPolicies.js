export const LEGAL_DRAFT_NOTE =
  "Demo content for review. Replace with verified organization details and actual practices, then obtain legal review before public launch.";

export const POLICIES = {
  terms: {
    title: "Terms and Conditions",
    intro: "These terms describe the basic expectations for using the Citizen Assist demo.",
    sections: [
      {
        title: "What the service does",
        paragraphs: [
          "Citizen Assist helps people navigate application processes and connect with assistance. It is not a government body and does not issue certificates or guarantee an authority's decision.",
        ],
      },
      {
        title: "Your account",
        paragraphs: [
          "Use a mobile number you control, keep your PIN private, and tell us if you believe someone else has accessed your account. You are responsible for activity carried out through your account, subject to applicable law.",
        ],
      },
      {
        title: "Requests and information",
        paragraphs: [
          "Provide accurate information and documents for a request. The relevant authority decides whether an application is accepted, what documents are needed, and how long processing takes.",
        ],
      },
      {
        title: "Availability and changes",
        paragraphs: [
          "Features may change as the service develops. Before production, add the operator's legal identity, jurisdiction, complaint process, cancellation/refund terms if applicable, and a verified contact channel here.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "This draft explains the kinds of information a service like this may need to support an account and a request.",
    sections: [
      {
        title: "Information you provide",
        paragraphs: [
          "Depending on the feature you use, this may include your mobile number, account details, profile information, application details, and documents you choose to submit.",
        ],
      },
      {
        title: "Why information is used",
        paragraphs: [
          "Information may be used to authenticate you, operate the service you requested, provide updates, protect accounts, and meet legal obligations. Confirm these purposes against the production data flows before launch.",
        ],
      },
      {
        title: "Sharing and retention",
        paragraphs: [
          "This demo policy does not define the final recipients, legal basis, or retention periods. Document the actual sharing with agents, service providers, and authorities, plus deletion and retention schedules, before collecting real user data in production.",
        ],
      },
      {
        title: "Your choices and contact",
        paragraphs: [
          "Add the process for access, correction, deletion, consent withdrawal, and privacy questions, along with the responsible organization and verified contact details, before public launch.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    intro: "This demo records your cookie choice on this device and explains the storage currently used by the app.",
    sections: [
      {
        title: "Essential browser storage",
        paragraphs: [
          "The app stores sign-in state and your cookie preference in browser local storage. It also uses session storage to remember whether the home introduction has been shown during the current tab session. These are browser storage mechanisms, not HTTP cookies.",
        ],
      },
      {
        title: "Optional cookies",
        paragraphs: [
          "No optional analytics or advertising tools are configured by this demo. The consent choice is saved as a preference only; connect any optional cookie or tracking tools to this choice before enabling them.",
        ],
      },
      {
        title: "Third-party sign-in",
        paragraphs: [
          "If you choose Google sign-in, Google may use its own technologies under Google's policies. Review the provider's current terms and privacy information before production.",
        ],
      },
      {
        title: "Change your choice",
        paragraphs: [
          "Use Cookie preferences in the site footer to update your choice. Your selection is stored in this browser and can be cleared by removing this site's local storage.",
        ],
      },
    ],
  },
};
