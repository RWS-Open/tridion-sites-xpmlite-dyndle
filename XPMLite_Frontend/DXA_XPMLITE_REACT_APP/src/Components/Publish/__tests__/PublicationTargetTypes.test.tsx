import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PublicationTargetTypes from "../PublicationTargetTypes";
import { renderWithProviders } from "../../../testUtils";

describe("PublicationTargetTypes Component", () => {
  it("should render Target Types table and scheduling radio options", () => {
    const preloadedState = {
      publishReducer: {
        targetTypes: [
          { key: "tcm_0-1-65537", name: "Staging Target", Id: "tcm_0-1-65537" },
          { key: "tcm_0-2-65537", name: "Live Target", Id: "tcm_0-2-65537" },
        ],
        selectedPublishingTarget: ["tcm_0-1-65537"],
        publishingSchedule: 1,
      },
    };

    renderWithProviders(<PublicationTargetTypes />, { preloadedState });
    expect(screen.getByText("Select one or more target types to publish to:")).toBeInTheDocument();
    expect(screen.getByText("Publish immediately")).toBeInTheDocument();
    expect(screen.getByText("Staging Target")).toBeInTheDocument();
  });
});
