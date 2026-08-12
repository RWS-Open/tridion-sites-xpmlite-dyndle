import type { ApiClient } from "../services/ApiClient";
import type { XpmTreeNode } from "../types/xpm";
import { SVG_ICONS } from "./MediaIcons";

export interface MediaViewCallbacks {
  getBody: () => HTMLElement | null;
  onItemSelect: (id: string, title: string, binaryUrl: string) => void;
}

export class MediaViewRenderer {
  private api: ApiClient;
  private callbacks: MediaViewCallbacks;

  constructor(api: ApiClient, callbacks: MediaViewCallbacks) {
    this.api = api;
    this.callbacks = callbacks;
  }

  public renderEmptyLayout(container: HTMLElement): void {
    container.innerHTML = `<div style="padding:15px; color:#666;"> No media items found</div>`;
  }

  public async getGridCardTemplate(item: XpmTreeNode): Promise<string> {
    const isFolder = item.$type === "Folder";
    const dateStr = item.VersionInfo?.RevisionDate ? new Date(item.VersionInfo.RevisionDate).toLocaleString() : "";
    let binaryImage = "";
    if (!isFolder && item.BinaryContent?.Url) {
      try {
        binaryImage = await this.api.getBinaryContent(item.BinaryContent.Url);
      } catch (error) {
        console.error(`Failed to fetch binary image for item ${item.Id}:`, error);
      }
    }
    return `
      <div class="multimedia-card" style="border:1px solid #ccc; border-radius:8px; width: 100%; min-height: 210px; box-sizing:border-box; display:flex; flex-direction:column; gap:5px; justify-content: center; align-items: center; background-color:#fff; cursor:pointer;">
        ${!isFolder
        ? `<img src="${binaryImage || ""}" style="object-fit:cover; height:140px; width:100%; max-width:220px; border-radius:8px" data-component-id="${item.Id || ""}" data-component-title="${item.Title || ""}" />`
        : SVG_ICONS.folderLarge
      }
        <div style="width:100%; height:auto; border-radius:8px; overflow:hidden; padding: 0 10px; box-sizing: border-box; text-align: center;">
          <h5 style="font-size:14px; margin: 4px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.Title || ""}</h5>
          <p style="font-size:12px; margin:0; color: #666;">${dateStr}</p>
        </div>
      </div>`;
  }

  public async gridViewLayout(items: XpmTreeNode[]): Promise<void> {
    const body = this.callbacks.getBody();
    if (!body) return;

    if (!Array.isArray(items) || !items.length) {
      this.renderEmptyLayout(body);
      return;
    }

    body.innerHTML = "";
    const grid = document.createElement("div");
    Object.assign(grid.style, {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 230px)",
      gap: "20px",
      justifyContent: "start"
    });

    body.appendChild(grid);

    grid.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest(".multimedia-card") as HTMLElement | null;
      if (!card || (!card.querySelector("img") && card.dataset.type !== "Folder")) return;

      grid.querySelectorAll(".multimedia-card").forEach((selectedCard) => {
        const htmlCard = selectedCard as HTMLElement;
        htmlCard.style.background = "#fff";
        htmlCard.style.border = "1px solid #ccc";
      });

      card.style.background = "#e5f2f2";
      card.style.border = "1px solid #007373";

      const targetImg = card.querySelector("img") as HTMLImageElement | null;
      if (targetImg) {
        this.callbacks.onItemSelect(
          targetImg.dataset.componentId || "",
          targetImg.dataset.componentTitle || "",
          targetImg.src
        );
      }
    });

    const cardTemplates = await Promise.all(items.map((item) => this.getGridCardTemplate(item)));
    const fragment = document.createDocumentFragment();
    cardTemplates.forEach((cardHtml) => {
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = cardHtml.trim();
      if (tempContainer.firstElementChild) {
        fragment.appendChild(tempContainer.firstElementChild);
      }
    });

    grid.appendChild(fragment);
  }

  public tableViewLayout(items: XpmTreeNode[]): void {
    const body = this.callbacks.getBody();
    if (!body) return;

    if (!Array.isArray(items) || !items.length) {
      this.renderEmptyLayout(body);
      return;
    }

    body.innerHTML = "";
    const table = document.createElement("table");
    Object.assign(table.style, {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff"
    });

    table.innerHTML = `
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Name</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Status</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Schema</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Shared From</th>
          <th style="padding:10px;border:1px solid #ddd;text-align:left;font-weight:normal;">Date Modified</th>
        </tr>
      </thead>
      <tbody></tbody>`;

    const tbody = table.querySelector("tbody");

    items.forEach((item) => {
      const row = document.createElement("tr");
      row.dataset.componentId = item.Id || "";
      row.dataset.componentTitle = item.Title || "";
      row.dataset.imgSrc = item.BinaryContent?.Url || "";
      row.style.cursor = "pointer";

      const schemaTitle = item?.LinkedSchema?.Title ?? item?.Schema?.Title ?? "";
      const owningRepo = item?.BluePrintInfo?.OwningRepository?.Title ?? "";
      const modDate = item.VersionInfo?.RevisionDate ? new Date(item.VersionInfo.RevisionDate).toLocaleString() : "";
      const iconSvg = item.$type === "Folder" ? SVG_ICONS.folder : SVG_ICONS.media;

      row.innerHTML = `
        <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
          ${iconSvg} ${item.Title || ""}
        </td>
        <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
          ${item.IsPublishedInContext ? "Published" : ""}
        </td>
        <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
          ${schemaTitle}
        </td>
        <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
          ${owningRepo}
        </td>
        <td style="padding:8px;border-bottom:1px solid #e3e6eb;text-align:left;font-weight:normal;">
          ${modDate}
        </td>`;

      row.addEventListener("click", async () => {
        tbody?.querySelectorAll("tr").forEach((trow) => (trow.style.background = "none"));
        row.style.background = "#e5f2f2";

        const binaryImage = await this.api.getBinaryContent(row.dataset.imgSrc as string);
        if (binaryImage) {
          this.callbacks.onItemSelect(
            row.dataset.componentId || "",
            row.dataset.componentTitle || "",
            binaryImage
          );
        }
      });

      tbody?.appendChild(row);
    });

    body.appendChild(table);
  }
}
