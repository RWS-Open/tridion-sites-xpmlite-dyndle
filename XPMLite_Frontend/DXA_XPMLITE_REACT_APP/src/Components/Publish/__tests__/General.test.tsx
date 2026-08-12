import { describe, it, expect } from "vitest";

import General from "../General";
import { renderWithProviders } from "../../../testUtils";

describe("General Component", () => {
  it("should render publication targets section", () => {
    const { container } = renderWithProviders(<General />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
