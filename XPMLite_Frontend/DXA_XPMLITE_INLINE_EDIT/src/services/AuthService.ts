import { ConfigService } from "./ConfigService";
import type { AuthorizeOptions, TokenResponse } from "../types/auth";

export class AuthService {
  private siteUrl: string;
  private configService: ConfigService;
  private clientId: string;
  private scope: string;
  private headers: Record<string, string>;
  private _oauthWindow: Window | null = null;
  private _oauthInterval: number | null = null;
  private refreshPromise: Promise<TokenResponse | null> | null = null;

  constructor(configService?: ConfigService) {
    this.siteUrl = window.location.origin;
    this.configService = configService || ConfigService.getInstance();
    this.clientId = this.configService.clientId;
    this.scope = "openid profile role forwarded offline_access";

    this.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json"
    };
  }

  getCookie(cookieName: string): string | null {
    if (typeof document === "undefined" || !document.cookie) return null;

    const cookies: Record<string, string> = {};
    const cookiePairs = document.cookie.split(";");

    cookiePairs.forEach(item => {
      const splitIndex = item.indexOf("=");
      if (splitIndex === -1) return;

      const key = item.substring(0, splitIndex).trim();
      const value = item.substring(splitIndex + 1);
      cookies[key] = value;
    });

    return cookies[cookieName] || null;
  }

  logout(): void {
    const domain = window.location.hostname;
    document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  public saveTokens(tokenData: TokenResponse): void {
    const currentTime = new Date();
    const expiresIn = tokenData.expires_in || 3600;

    const accessExpiry = new Date(currentTime.getTime() + expiresIn * 1000);
    const refreshExpiry = new Date(currentTime.getTime() + expiresIn * 1000);

    const isSecure = window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";

    document.cookie = `access_token=${tokenData.access_token}; expires=${accessExpiry.toUTCString()}${secureFlag}; SameSite=Strict; path=/`;
    document.cookie = `refresh_token=${tokenData.refresh_token}; expires=${refreshExpiry.toUTCString()}${secureFlag}; SameSite=Strict; path=/`;

    window.setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  private async fetchTokenExchange(bodyParams: Record<string, string>): Promise<TokenResponse | null> {
    const rawBaseUrl = this.configService.authorizationBaseUrl;
    if (!rawBaseUrl) {
      console.error("Authorization base URL is missing in configuration.");
      return null;
    }

    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    const options: RequestInit = {
      method: "POST",
      headers: this.headers,
      body: new URLSearchParams(bodyParams)
    };

    try {
      const response = await fetch(`${baseUrl}/token`, options);
      if (!response.ok) {
        throw new Error(`Token transaction failed with status: ${response.status}`);
      }

      const data: TokenResponse = await response.json();
      this.saveTokens(data);
      return data;
    } catch (error) {
      console.error("Critical error handling token exchange:", error);
      return null;
    }
  }

  public async getTokenFrmRefreshToken(refreshToken: string): Promise<TokenResponse | null> {
    if (!refreshToken) return null;

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const data = {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: this.configService.clientId,
      redirect_uri: this.siteUrl
    };

    this.refreshPromise = this.fetchTokenExchange(data).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  async login(): Promise<void> {
    const loginStatusEl = document.querySelector(".loginStatus");
    const loginText = loginStatusEl ? loginStatusEl.textContent?.trim() || "" : "";

    if (loginText === "Logout") {
      this.logout();
      window.location.reload();
      return;
    }

    const hasAccessToken = Boolean(this.getCookie("access_token"));
    const hasRefreshToken = Boolean(this.getCookie("refresh_token"));

    if (!hasAccessToken && hasRefreshToken) {
      const refreshToken = this.getCookie("refresh_token");
      if (refreshToken) {
        await this.getTokenFrmRefreshToken(refreshToken);
        return;
      }
    }

    const rawBaseUrl = this.configService.authorizationBaseUrl;
    if (!rawBaseUrl) {
      console.error("Cannot perform OAuth login: authorization_baseurl is undefined.");
      return;
    }

    const baseUrl = rawBaseUrl.replace(/\/+$/, "");
    const authPath = `${baseUrl}/authorize?client_id=${encodeURIComponent(this.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(this.siteUrl)}&scope=${encodeURIComponent(this.scope)}`;

    this.authorize({
      path: authPath,
      callback: async (authWindow: Window) => {
        try {
          const urlParams = new URLSearchParams(authWindow.location.search);
          const authorizationCode = urlParams.get("code");
          if (!authorizationCode) return;

          const data = {
            code: authorizationCode,
            grant_type: "authorization_code",
            client_id: this.clientId,
            redirect_uri: this.siteUrl
          };

          await this.fetchTokenExchange(data);
        } catch (err) {
          console.error("Failed to authorize:", err);
        }
      }
    });
  }

  authorize(options: AuthorizeOptions): void {
    const windowName = options.windowName || "ConnectWithOAuth";
    const windowOptions = options.windowOptions || "location=0,status=0,width=800,height=400";
    const fallbackCallback = () => {
      window.setTimeout(() => {
        window.location.reload();
      }, 2000);
    };
    const callback = options.callback || fallbackCallback;

    this._oauthWindow = window.open(options.path, windowName, windowOptions);

    if (this._oauthInterval !== null) {
      clearInterval(this._oauthInterval);
    }

    this._oauthInterval = window.setInterval(() => {
      let isSameOrigin = false;

      try {
        if (this._oauthWindow && this._oauthWindow.location && this._oauthWindow.location.href) {
          isSameOrigin = true;
        }
      } catch {
        isSameOrigin = false;
      }

      if (isSameOrigin && this._oauthWindow?.location.href.includes(this.siteUrl) && this._oauthInterval !== null) {
        clearInterval(this._oauthInterval);
        this._oauthInterval = null;
        callback(this._oauthWindow);
        this._oauthWindow.close();
        return;
      }

      if ((!this._oauthWindow || this._oauthWindow.closed) && this._oauthInterval !== null) {
        clearInterval(this._oauthInterval);
        this._oauthInterval = null;
      }
    }, 1000);
  }
}
