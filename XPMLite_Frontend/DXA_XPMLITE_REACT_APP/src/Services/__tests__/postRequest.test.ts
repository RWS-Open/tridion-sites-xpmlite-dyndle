import { describe, it, expect, vi, beforeEach } from "vitest";
import postService from "../postRequest";
import axiosClient from "../../oauth/apiClient";
import putService from "../putRequest";

vi.mock("../../oauth/apiClient", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("../putRequest", () => ({
  default: {
    putRequest: vi.fn(),
  },
}));

describe("postService API helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should perform postRequest successfully", async () => {
    const mockResponse = { status: 200, data: { Id: "tcm_5-100-64" } };
    (axiosClient.post as any).mockResolvedValueOnce(mockResponse);

    const res = await postService.postRequest("items/tcm_5-100-64", { test: true });
    expect(res).toEqual(mockResponse);
    expect(axiosClient.post).toHaveBeenCalledWith("/items/items/tcm_5-100-64", { test: true });
  });

  it("should perform checkout successfully when status is 200", async () => {
    const mockResponse = { status: 200, data: { Id: "tcm_5-100-64-v0" } };
    (axiosClient.post as any).mockResolvedValueOnce(mockResponse);

    const res = await postService.checkout("tcm_5-100-64");
    expect(res).toEqual(mockResponse);
  });

  it("should handle updateComponent retry lifecycle safely without infinite loops on failure", async () => {
    const mockError = new Error("Network / Server error");
    (putService.putRequest as any).mockRejectedValue(mockError);

    await expect(postService.updateComponent("tcm_5-100-64", { Title: "My Comp" })).rejects.toThrow(mockError);
    // Verified that it retries at most once (2 calls total) instead of infinite loop!
    expect(putService.putRequest).toHaveBeenCalledTimes(2);
  });
});
