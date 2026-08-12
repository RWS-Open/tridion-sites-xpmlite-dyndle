import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import PublishContainer from "../PublishContainer";
import { renderWithProviders } from "../../../testUtils";

describe("PublishContainer Component", () => {
  it("should render tabs for General and Additional Settings", () => {
    renderWithProviders(
      <PublishContainer isPublishRequested={false} setIsPublishRequested={vi.fn()} />
    );
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Additional Settings")).toBeInTheDocument();
  });
});
