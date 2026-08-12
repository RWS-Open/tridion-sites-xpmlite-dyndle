import type { AppConfig } from "../types/config";

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): AppConfig {
    try {
      if (typeof window !== "undefined" && typeof window.getConfig === "function") {
        return window.getConfig() || {};
      }
      if (typeof getConfig === "function") {
        return getConfig() || {};
      }
    } catch {
      // Ignore missing global getConfig function
    }
    return {};
  }

  public get<T = unknown>(key: keyof AppConfig, defaultValue?: T): T {
    const val = this.config[key];
    if (val !== undefined && val !== null) {
      return val as unknown as T;
    }
    return defaultValue as T;
  }

  public get clientId(): string {
    return (this.config.client_id as string) || "";
  }

  public get authorizationBaseUrl(): string {
    return (this.config.authorization_baseurl as string) || "";
  }

  public get openApiBaseUrl(): string {
    return (this.config.openapi_baseurl as string) || "";
  }

  public get defaultBinaryFolderId(): string {
    return (this.config.default_binary_folderId as string) || "";
  }

  public get experienceSpaceUrl(): string {
    return (this.config.experience_space_url as string) || "";
  }

  public get isStaging(): boolean {
    const stagingVal = this.config.staging;
    if (typeof stagingVal === "boolean") return stagingVal;
    if (typeof stagingVal === "string") return stagingVal.toLowerCase() === "true";
    return false;
  }

  public refresh(): AppConfig {
    this.config = this.loadConfig();
    return this.config;
  }
}
