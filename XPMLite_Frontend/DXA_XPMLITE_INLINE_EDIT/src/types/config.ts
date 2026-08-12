export interface AppConfig {
  staging?: boolean | string;
  client_id?: string;
  authorization_baseurl?: string;
  openapi_baseurl?: string;
  default_binary_folderId?: string;
  experience_space_url?: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    getConfig?: () => AppConfig;
  }
  function getConfig(): AppConfig;
}
