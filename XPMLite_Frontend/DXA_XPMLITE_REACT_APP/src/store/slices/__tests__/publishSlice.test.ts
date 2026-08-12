import { describe, it, expect } from "vitest";
import publishReducer, {
  setSelectedPublishingTarget,
  setPublishPriority,
  setCurrentPublicationToPublishing,
  setLoading,
} from "../publishSlice";

describe("publishSlice reducer", () => {
  const initialState = {
    parentPublication: { key: "", name: "", Id: "" },
    childPublications: [],
    selectedChildPublications: [],
    selectedPublishingTarget: [],
    publishingSchedule: 1,
    publishPriority: "Normal",
    publishToCurrentPublication: true,
    publishDate: null,
    additionalSettings: {
      linkedItems: 1,
      itemsInProgress: 1,
      overridePriority: 1,
    },
    targetTypes: [],
    isLoading: false,
    errorMessage: null,
    ispublishRequested: false,
  };

  it("should handle setSelectedPublishingTarget", () => {
    const targets = ["target_1", "target_2"];
    const actual = publishReducer(initialState, setSelectedPublishingTarget(targets));
    expect(actual.selectedPublishingTarget).toEqual(targets);
  });

  it("should handle setPublishPriority", () => {
    const actual = publishReducer(initialState, setPublishPriority("High"));
    expect(actual.publishPriority).toBe("High");
  });

  it("should handle setCurrentPublicationToPublishing", () => {
    const actual = publishReducer(initialState, setCurrentPublicationToPublishing(false));
    expect(actual.publishToCurrentPublication).toBe(false);
  });

  it("should handle setLoading", () => {
    const actual = publishReducer(initialState, setLoading(true));
    expect(actual.isLoading).toBe(true);
  });
});
