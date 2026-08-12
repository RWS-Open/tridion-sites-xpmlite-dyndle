import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import PublicationList from "../PublicationList";
import { renderWithProviders } from "../../../testUtils";

describe("PublicationList Component", () => {
  it("should render publication table and checkbox options", () => {
    const preloadedState = {
      publishReducer: {
        parentPublication: { key: "tcm_5-1-1", name: "Master Site", Id: "tcm_5-1-1" },
        childPublications: [
          { key: "tcm_6-1-1", name: "Child Site A", Id: "tcm_6-1-1" },
          { key: "tcm_7-1-1", name: "Child Site B", Id: "tcm_7-1-1" },
        ],
        publishToCurrentPublication: true,
        selectedChildPublications: [],
      },
    };

    renderWithProviders(<PublicationList />, { preloadedState });
    expect(screen.getByText("Publish items in publications:")).toBeInTheDocument();
    expect(screen.getByText("Child Site A")).toBeInTheDocument();
  });
});
