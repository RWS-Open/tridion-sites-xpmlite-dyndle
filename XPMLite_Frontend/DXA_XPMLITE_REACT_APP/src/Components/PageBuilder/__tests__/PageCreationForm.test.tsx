import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import PageCreationForm from "../PageCreationForm";
import { renderWithProviders } from "../../../testUtils";

describe("PageCreationForm Component", () => {
  it("should render page name and file name input fields", () => {
    const preloadedState = {
      pageBuilderReducer: {
        formData: { pagename: "New Test Page", filename: "new-test-page" },
        selectedPageType: { label: "Standard Page", value: "tcm_5-1-4" },
        selectedPageSchema: { label: "General Schema", value: "tcm_5-10-8" },
        selectedPageTemplate: { label: "General Template", value: "tcm_5-12-128" },
      },
    };

    renderWithProviders(<PageCreationForm pageTemplate={null} getPageTemplate={vi.fn()} />, { preloadedState });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("New Test Page")).toBeInTheDocument();
  });
});
