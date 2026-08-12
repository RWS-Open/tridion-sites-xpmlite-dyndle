import { describe, it, expect } from "vitest";
import pageBuilderReducer, {
  setFormData,
  setPageTypeId,
  setSelectedPageSchema,
  setLoading,
  setErrorMessage,
} from "../pageBuilderSlice";

describe("pageBuilderSlice reducer", () => {
  const initialState = {
    isLoading: true,
    pageTypes: [],
    structureGroupIds: { home: null, pageTypes: null },
    pageTypeList: [],
    pageTypeId: null,
    selectedPageSchema: { label: null, value: null },
    selectedPageTemplate: { label: null, value: null },
    selectedPageType: { label: null, value: null },
    formData: { pagename: "New Page", filename: null },
    errorMessage: null,
  };

  it("should return the initial state", () => {
    expect(pageBuilderReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setFormData", () => {
    const actual = pageBuilderReducer(initialState, setFormData({ pagename: "My Page", filename: "my-page" }));
    expect(actual.formData.pagename).toBe("My Page");
    expect(actual.formData.filename).toBe("my-page");
  });

  it("should handle setPageTypeId", () => {
    const actual = pageBuilderReducer(initialState, setPageTypeId("tcm_5-99-4"));
    expect(actual.pageTypeId).toBe("tcm_5-99-4");
  });

  it("should handle setSelectedPageSchema", () => {
    const schema = { label: "Article Schema", value: "tcm_5-10-8" };
    const actual = pageBuilderReducer(initialState, setSelectedPageSchema(schema));
    expect(actual.selectedPageSchema).toEqual(schema);
  });

  it("should handle setLoading and setErrorMessage", () => {
    let actual = pageBuilderReducer(initialState, setLoading(false));
    expect(actual.isLoading).toBe(false);

    actual = pageBuilderReducer(actual, setErrorMessage("Failed to load"));
    expect(actual.errorMessage).toBe("Failed to load");
  });
});
