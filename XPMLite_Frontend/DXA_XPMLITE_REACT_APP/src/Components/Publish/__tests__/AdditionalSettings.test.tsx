import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import AdditionalSettings from "../AdditionalSettings";
import { renderWithProviders } from "../../../testUtils";

describe("AdditionalSettings Component", () => {
  it("should render Priority select options and radio settings", () => {
    const preloadedState = {
      publishReducer: {
        publishPriority: "Normal",
        additionalSettings: {
          linkedItems: 1,
          itemsInProgress: 1,
          overridePriority: 1,
        },
      },
    };

    renderWithProviders(<AdditionalSettings />, { preloadedState });
    expect(screen.getByText("Dependent items")).toBeInTheDocument();
    expect(screen.getByText("Items in progress")).toBeInTheDocument();
    expect(screen.getByText("Publishing priority")).toBeInTheDocument();
  });
});
