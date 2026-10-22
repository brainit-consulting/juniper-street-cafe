// `||`, not `??`: a variable that is set but empty must fall through too.
export const siteUrl = (
  process.env.APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3456"
).replace(/\/$/, "");

export const site = {
  name: "Catering orders · Juniper Street Café",
  description: "The catering order book for Juniper Street Café, for the people who work there.",
};
