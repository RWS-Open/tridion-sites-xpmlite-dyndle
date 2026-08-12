import { describe, it, expect } from "vitest";
import pageReducer, { setPageId, togglePageInfo, togglePageBuilder } from "../pageSlice";

describe("pageSlice reducer", () => {
  const initialState = {
    pageId: null,
    showPageInfo: false,
    showPageBuilder: false,
  };

  it("should return the initial state", () => {
    expect(pageReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setPageId", () => {
    const actual = pageReducer(initialState, setPageId("tcm_5-123-64"));
    expect(actual.pageId).toBe("tcm_5-123-64");
  });

  it("should handle togglePageInfo", () => {
    const actual = pageReducer(initialState, togglePageInfo(true));
    expect(actual.showPageInfo).toBe(true);
  });

  it("should handle togglePageBuilder", () => {
    const actual = pageReducer(initialState, togglePageBuilder(true));
    expect(actual.showPageBuilder).toBe(true);
  });
});
