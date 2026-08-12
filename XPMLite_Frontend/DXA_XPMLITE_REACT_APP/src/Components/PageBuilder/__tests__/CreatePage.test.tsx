import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import CreatePage from "../CreatePage";
import { renderWithProviders } from "../../../testUtils";

describe("CreatePage Component Wizard", () => {
  it("should render steps header (Page Type, Page Template, Page Creation)", () => {
    renderWithProviders(<CreatePage />);
    expect(screen.getByText("Select Page Type")).toBeInTheDocument();
    expect(screen.getByText("Page Details")).toBeInTheDocument();
  });
});
