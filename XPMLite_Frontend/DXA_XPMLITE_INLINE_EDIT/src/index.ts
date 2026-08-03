import { AuthService } from "./auth";
import { ApiClient } from "./apiClient";
import { Media } from "./media";
import { Xpmlite } from "./xpmlite";
import { ComponentService } from "./component";

import "./assets/css/xpmlite.css";

export let authService: AuthService;
export let apiClient: ApiClient;
export let mediaService: Media;
export let xpmService: Xpmlite;
export let componentService: ComponentService;

const init = () => {
    const config = typeof window.getConfig === "function" ? window.getConfig() : {}
    const isStaging = String(config.staging).toLowerCase() === "true";

    if (!isStaging) {
        return
    }

    authService = new AuthService();
    apiClient = new ApiClient(authService);
    mediaService = new Media(apiClient);
    componentService = new ComponentService(apiClient)
    xpmService = new Xpmlite(authService, apiClient, mediaService, componentService);
    xpmService.loginStatus();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}