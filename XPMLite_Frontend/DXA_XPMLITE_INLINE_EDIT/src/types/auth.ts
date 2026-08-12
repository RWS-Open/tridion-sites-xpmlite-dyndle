export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthorizeOptions {
  path: string;
  windowName?: string;
  windowOptions?: string;
  callback?: (win: Window) => void;
}
