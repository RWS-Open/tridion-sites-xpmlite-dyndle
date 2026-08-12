import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import Cookies from "js-cookie";
import FooterBar from "../FooterBar";
import { renderWithProviders } from "../../testUtils";

describe("FooterBar Component", () => {
  beforeEach(() => {
    Cookies.set("access_token", "mock-token-123");
  });

  it("should render page info, create page, and publish buttons when authorized", () => {
    renderWithProviders(<FooterBar />);
    expect(screen.getByTitle("Page Info")).toBeInTheDocument();
    expect(screen.getByTitle("Create Page")).toBeInTheDocument();
    expect(screen.getByTitle("Refresh")).toBeInTheDocument();
  });

  it("should toggle page info visibility when Page Info button is clicked", () => {
    const { store } = renderWithProviders(<FooterBar />);
    const pageInfoBtn = screen.getByTitle("Page Info");
    fireEvent.click(pageInfoBtn);

    expect(store.getState().pageReducer.showPageInfo).toBe(true);
  });

  it("should toggle page builder visibility when Create Page button is clicked", () => {
    const { store } = renderWithProviders(<FooterBar />);
    const createPageBtn = screen.getByTitle("Create Page");
    fireEvent.click(createPageBtn);

    expect(store.getState().pageReducer.showPageBuilder).toBe(true);
  });
});
