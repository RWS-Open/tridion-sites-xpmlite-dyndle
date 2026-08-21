import { ApiClient } from "./ApiClient";
import type { SchemaLink, XpmItem } from "../types/xpm";
import { safeJsonParse } from "../utils/utils";
import { ValidationHelper } from "../ui/ValidationHelper";

export interface BinaryUploadResponse {
  TempFileId: string;
  MultimediaType: SchemaLink;
  MimeType?: string;
  FileName: string;
}

export class BinaryUploadManager {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  public async upload(fileInput: HTMLInputElement, uploadBtn: HTMLButtonElement, containerData: Record<string, unknown>): Promise<SchemaLink | null> {
    const file = fileInput.files?.[0];

    if (!ValidationHelper.validate(fileInput, Boolean(file), "Please upload a valid image file.")) {
      return null;
    }

    try {
      uploadBtn.disabled = true;
      const payload = new FormData();
      payload.append("file", file!);

      const binaryResponse = await this.api.postService<BinaryUploadResponse>(`/binary/upload`, payload);
      const payloadContainer = safeJsonParse<Record<string, unknown>>(JSON.stringify(containerData), { ...containerData });

      payloadContainer.Title = file!.name.split(".")[0]+Date.now();
      payloadContainer.BinaryContent = {
        IsExternal: false,
        ExternalBinaryUri: "",
        UploadFromFile: binaryResponse.TempFileId,
        MultimediaType: {
          $type: "Link",
          IdRef: binaryResponse.MultimediaType.IdRef,
          Title: binaryResponse.MultimediaType.Title
        },
        MimeType: file!.type || binaryResponse.MimeType || "application/octet-stream",
        Filename: binaryResponse.FileName,
        Size: file!.size
      };

      const createResponse = await this.api.postService<XpmItem>("/items?autoCheckIn=true", payloadContainer);
      if (createResponse?.Id) {
        this.renderStatus(`Binary saved: <strong>${createResponse.Title}</strong>`, uploadBtn, "success");
        return {
          $type: "Link",
          IdRef: createResponse.Id,
          Title: createResponse.Title
        };
      }

      this.renderStatus("Failed to create binary component.", uploadBtn, "error");
      return null;
    } catch (error) {
      console.error("Binary creation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Error uploading binary.";
      this.renderStatus(errorMessage, uploadBtn, "error");
      return null;
    } finally {
      uploadBtn.disabled = false;
    }
  }

  private renderStatus(message: string, uploadBtn: HTMLButtonElement, status: "success" | "error"): void {
    const parent = uploadBtn.parentElement?.parentElement;
    if (!parent) return;

    const existingStatus = parent.querySelector(".media-upload-status");
    if (existingStatus) existingStatus.remove();

    const span = document.createElement("span");
    span.className = "media-upload-status";
    span.innerHTML = message;
    Object.assign(span.style, {
      color: status === "success" ? "#007373" : "#dc3545",
      fontSize: "12px",
      marginLeft: "8px",
      display: "inline-block"
    });
    parent.appendChild(span);
  }
}
