export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  aiApiBaseUrl:
    process.env.AI_API_BASE_URL ??
    process.env.BUILT_IN_FORGE_API_URL ??
    "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  pdfConverterCmd: process.env.PDF_CONVERTER_CMD ?? "manus-md-to-pdf",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY ?? "",
};
