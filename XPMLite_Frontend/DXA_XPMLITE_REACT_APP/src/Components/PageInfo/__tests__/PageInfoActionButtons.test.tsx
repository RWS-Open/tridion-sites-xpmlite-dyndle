import { describe, it, expect, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import PageInfoActionButtons from "../PageInfoActionButtons";
import { renderWithProviders } from "../../../testUtils";

describe("PageInfoActionButtons Component", () => {
  it("should render action buttons and trigger delete callback", () => {
    const deleteMock = vi.fn();
    const preloadedState = {
      pageInfoReducer: {
        selectedKeys: { title: "Comp Node", key: "comp_123_region_0", type: "ComponentPresentation" },
      },
    };

    const { container } = renderWithProviders(<PageInfoActionButtons deletePageComponent={deleteMock} />, { preloadedState });
    const deleteBtn = container.querySelectorAll(".drawer-btn")[3];

    expect(deleteBtn).not.toBeDisabled();
    fireEvent.click(deleteBtn);
    expect(deleteMock).toHaveBeenCalledTimes(1);
  });

  it("should disable delete button when no ComponentPresentation is selected", () => {
    const deleteMock = vi.fn();
    const preloadedState = {
      pageInfoReducer: {
        selectedKeys: { title: "Region Node", key: "region_123", type: "EmbeddedRegion" },
      },
    };

    const { container } = renderWithProviders(<PageInfoActionButtons deletePageComponent={deleteMock} />, { preloadedState });
    const deleteBtn = container.querySelectorAll(".drawer-btn")[3];

    expect(deleteBtn).toBeDisabled();
  });
});
