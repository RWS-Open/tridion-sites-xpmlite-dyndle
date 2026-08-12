import "@testing-library/jest-dom";

// Mock global window configuration
if (typeof window !== "undefined") {
  window.getConfig = () => ({
    staging: "true",
    client_id: "test-client-id",
    redirect_uri: "http://localhost:4200",
    openapi_baseurl: "https://sites.tridiondemo.com/api/v3.0",
    authorization_baseurl: "https://access.tridiondemo.com/access-management/connect",
    contentServiceUrl: "https://sites.tridiondemo.com:8081/cd/api",
    experience_space_url: "https://sites.tridiondemo.com/ui/editor",
    default_binary_folderId: "57",
  });

  window.getPageTypeImages = () => [];
}

// Mock matchMedia for Ant Design components in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
