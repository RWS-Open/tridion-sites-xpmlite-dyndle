import { AuthService } from "./AuthService";
import { ConfigService } from "./ConfigService";

export class ApiError extends Error {
  public status: number;
  public url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

export class ApiClient {
  private auth: AuthService;
  private configService: ConfigService;
  private headers: Record<string, string>;
  private binaryCache = new Map<string, string>();

  constructor(authInstance: AuthService, configService?: ConfigService) {
    this.auth = authInstance;
    this.configService = configService || ConfigService.getInstance();
    this.headers = {
      "Content-Type": "application/json",
      "accept": "application/json"
    };
  }

  private authHeader(options: RequestInit, token: string | null): void {
    options.credentials = "include";
    if (token) {
      options.headers = {
        ...(options.headers as Record<string, string>),
        "Authorization": `Bearer ${token}`
      };
    }
  }

  private async getAccessToken(): Promise<string | null> {
    const accessToken = this.auth.getCookie("access_token");
    if (accessToken) {
      return accessToken;
    }

    const refreshToken = this.auth.getCookie("refresh_token");
    if (refreshToken) {
      const response = await this.auth.getTokenFrmRefreshToken(refreshToken);
      return response ? response.access_token : null;
    }

    console.warn("No active tokens found.");
    return null;
  }

  private buildUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const openApiBase = this.configService.openApiBaseUrl.replace(/\/+$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return openApiBase ? `${openApiBase}${path}` : path;
  }

  async sendRequest<T = unknown>(url: string, options: RequestInit = {}, responseType: "json" | "blob" = "json"): Promise<T> {
    const token = await this.getAccessToken();
    const isFormData = options.body instanceof FormData;

    const combinedHeaders: Record<string, string> = {
      ...this.headers,
      ...(options.headers as Record<string, string> || {})
    };

    if (isFormData) {
      delete combinedHeaders["Content-Type"];
      delete combinedHeaders["content-type"];
    }

    const requestOptions: RequestInit = { ...options, headers: combinedHeaders };

    this.authHeader(requestOptions, token);
    const targetUrl = this.buildUrl(url);

    try {
      const response = await fetch(targetUrl, requestOptions);

      if (!response.ok) {
        throw new ApiError(`HTTP Error Status: ${response.status}`, response.status, targetUrl);
      }

      if (responseType === "blob") {
        return (await response.blob()) as unknown as T;
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error(`Transaction failure targeting endpoint [${url}]:`, error);
      throw error;
    }
  }

  async getRequest<T = unknown>(url: string): Promise<T> {
    return this.sendRequest<T>(url, { method: "GET" });
  }

  async getBinaryContent(absoluteUrl: string): Promise<string> {
    if (!absoluteUrl) return "";

    if (this.binaryCache.has(absoluteUrl)) {
      return this.binaryCache.get(absoluteUrl)!;
    }

    try {
      const imageBlob: Blob = await this.sendRequest<Blob>(absoluteUrl, { method: "GET", headers: { "accept": "image/*" } }, "blob");
      const objectUrl = URL.createObjectURL(imageBlob);
      this.binaryCache.set(absoluteUrl, objectUrl);
      return objectUrl;
    } catch (error) {
      console.error("Failed to download protected binary asset:", error);
      return "";
    }
  }

  clearBinaryCache(): void {
    this.binaryCache.forEach((objectUrl) => { URL.revokeObjectURL(objectUrl); });
    this.binaryCache.clear();
  }

  async postService<T = unknown>(url: string, data: unknown): Promise<T> {
    const isBinaryOrFormData = data instanceof FormData || data instanceof File || data instanceof Blob;
    return this.sendRequest<T>(url, { method: "POST", body: isBinaryOrFormData ? (data as BodyInit) : JSON.stringify(data) });
  }

  async putService<T = unknown>(url: string, data: unknown): Promise<T> {
    return this.sendRequest<T>(url, { method: "PUT", body: JSON.stringify(data) });
  }
}
