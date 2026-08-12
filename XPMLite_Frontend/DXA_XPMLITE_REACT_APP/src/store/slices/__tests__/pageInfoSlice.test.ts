import { describe, it, expect } from "vitest";
import pageInfoReducer, {
  setComponentPresentation,
  setSelectedKeys,
  setExpandKeys,
  setLoading,
} from "../pageInfoSlice";
import { DataNode } from "../../../model/PageModel";

describe("pageInfoSlice reducer", () => {
  const initialState = {
    isLoading: false,
    toggleModalTreeView: false,
    componentPresentation: [],
    selectedKeys: { title: null, key: null, type: null },
    expandkeys: [],
    selectedComponentRowKeys: [],
    selectedComponentTemplate: [],
    pageInfoData: null,
    componentTemplates: [],
    updatedComponentTemplate: { label: null, value: null },
    errorLoading: null,
  };

  it("should return the initial state", () => {
    expect(pageInfoReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setComponentPresentation with serializable nodes", () => {
    const nodes: DataNode[] = [
      {
        title: "Home Page",
        id: "tcm_5-10-64",
        key: "tcm_5-10-64",
        iconType: "page",
        isLeaf: false,
        children: [],
      },
    ];
    const actual = pageInfoReducer(initialState, setComponentPresentation(nodes));
    expect(actual.componentPresentation).toEqual(nodes);
    expect(actual.componentPresentation[0].title).toBe("Home Page");
  });

  it("should handle setSelectedKeys", () => {
    const keys = { title: "Hero Region", key: "hero_region_key", type: "EmbeddedRegion" };
    const actual = pageInfoReducer(initialState, setSelectedKeys(keys));
    expect(actual.selectedKeys).toEqual(keys);
  });

  it("should handle setExpandKeys", () => {
    const keys = ["node_1", "node_2"];
    const actual = pageInfoReducer(initialState, setExpandKeys(keys));
    expect(actual.expandkeys).toEqual(keys);
  });

  it("should handle setLoading", () => {
    const actual = pageInfoReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });
});
