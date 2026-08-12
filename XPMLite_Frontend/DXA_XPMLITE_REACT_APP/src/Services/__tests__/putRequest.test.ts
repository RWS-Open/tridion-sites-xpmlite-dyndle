import { describe, it, expect, vi, beforeEach } from "vitest";
import putService from "../putRequest";
import axiosClient from "../../oauth/apiClient";

vi.mock("../../oauth/apiClient", () => ({
  default: {
    put: vi.fn(),
  },
}));

describe("putService API helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should perform putRequest successfully", async () => {
    const mockResponse = { status: 200, data: { Id: "tcm_5-10-64" } };
    (axiosClient.put as any).mockResolvedValueOnce(mockResponse);

    const res = await putService.putRequest("tcm_5-10-64", { Title: "Updated Title" });
    expect(res).toEqual(mockResponse);
    expect(axiosClient.put).toHaveBeenCalledWith("/items/tcm_5-10-64", { Title: "Updated Title" });
  });

  it("should update publish page successfully", async () => {
    const mockResponse = { status: 200, data: { Id: "tcm_5-10-64" } };
    (axiosClient.put as any).mockResolvedValueOnce(mockResponse);

    const res = await putService.updatePublishPage({ Id: "tcm:5-10-64", Title: "Updated Page" });
    expect(res).toEqual(mockResponse);
  });
});
