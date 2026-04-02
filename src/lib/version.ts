import pkg from "../../package.json";

/** App version from package.json (bump in package.json for releases). */
export const APP_VERSION = pkg.version as string;
