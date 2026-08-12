import { AuthService } from "./services/AuthService";
import { ApiClient } from "./services/ApiClient";
import { Media } from "./media/Media";
import { Xpmlite } from "./core/Xpmlite";
import { ComponentService } from "./services/ComponentService";
import { ConfigService } from "./services/ConfigService";

import "./assets/css/xpmlite.css";

export class XpmEditorApp {
	public configService: ConfigService;
	public authService!: AuthService;
	public apiClient!: ApiClient;
	public mediaService!: Media;
	public componentService!: ComponentService;
	public xpmService!: Xpmlite;

	constructor() {
		this.configService = ConfigService.getInstance();
	}

	public init(): void {
		if (!this.configService.isStaging) {
			return;
		}

		this.authService = new AuthService(this.configService);
		this.apiClient = new ApiClient(this.authService, this.configService);
		this.mediaService = new Media(this.apiClient);
		this.componentService = new ComponentService(this.apiClient);
		this.xpmService = new Xpmlite(this.authService, this.apiClient, this.mediaService, this.componentService, this.configService);

		this.xpmService.loginStatus();
	}
}

const app = new XpmEditorApp();

const bootstrapApp = () => {
	app.init();
};

if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", bootstrapApp);
	} else {
		bootstrapApp();
	}
}