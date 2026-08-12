import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OAuth from "../OAuth";
import Cookies from "js-cookie";

describe("OAuth Component", () => {
  it("should render CM Login button when user is not authorized", () => {
    const updateAuthMock = vi.fn();
    render(<OAuth authorization={false} updateAuthorization={updateAuthMock} />);
    expect(screen.getByText("CM Login")).toBeInTheDocument();
  });

  it("should render logout button when user is authorized", () => {
    const updateAuthMock = vi.fn();
    const { container } = render(<OAuth authorization={true} updateAuthorization={updateAuthMock} />);
    expect(container.querySelector(".loginStatus")).toBeInTheDocument();
  });

  it("should remove access token cookie on logout click", () => {
    const updateAuthMock = vi.fn();
    Cookies.set("access_token", "test-token");
    
    // Mock window.location.reload
    const originalReload = window.location.reload;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: vi.fn() },
    });

    const { container } = render(<OAuth authorization={true} updateAuthorization={updateAuthMock} />);
    const logoutBtn = container.querySelector(".loginStatus")!;
    fireEvent.click(logoutBtn);

    expect(Cookies.get("access_token")).toBeUndefined();
    expect(updateAuthMock).toHaveBeenCalledWith(false);

    window.location.reload = originalReload;
  });
});
