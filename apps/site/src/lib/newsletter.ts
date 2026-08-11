// Only a completed double opt-in should hide signup forms. The old key was set
// as soon as the form submitted, so changing it also resets stale local state.
export const newsletterSubscribedKey = "ian.newsletter.confirmed.v1";
