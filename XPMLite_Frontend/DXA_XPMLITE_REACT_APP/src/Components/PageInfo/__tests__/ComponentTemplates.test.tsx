import { describe, it, expect } from "vitest";
import ComponentTemplates from "../ComponentTemplates";
import { renderWithProviders } from "../../../testUtils";

describe("ComponentTemplates Component", () => {
  it("should render component templates dropdown", () => {
    const preloadedState = {
      pageInfoReducer: {
        componentTemplates: [
          { IdRef: "tcm_5-1-32", Link: "link", Title: "Article Template" },
          { IdRef: "tcm_5-2-32", Link: "link", Title: "News Template" },
        ],
        selectedComponentTemplate: [{ IdRef: "tcm_5-1-32", Title: "Article Template" }],
        selectedComponentRowKeys: ["tcm_5-10-16"],
        selectedKeys: { key: "comp_tcm_5-10-16_region_0" },
      },
    };

    const { container } = renderWithProviders(<ComponentTemplates />, { preloadedState });
    expect(container.querySelector(".ant-select")).toBeInTheDocument();
  });
});
