import type { ApiClient } from "../services/ApiClient";
import type { XpmItem, XpmTreeNode } from "../types/xpm";
import { formatTcmId } from "../utils/utils";
import { MediaTreeRenderer } from "./MediaTreeRenderer";
import { MediaViewRenderer } from "./MediaViewRenderer";
import { MediaModalRenderer } from "./MediaModalRenderer";

export interface MediaSelectedState {
  Id: string;
  Title: string;
}

export class Media {
  private api: ApiClient;

  private orgStructure: XpmTreeNode[] = [];
  private publication: XpmItem | null = null;
  private rootContentItems: XpmTreeNode[] = [];
  private selectedMedia: MediaSelectedState = { Id: "", Title: "" };
  private isLoading = false;
  private layout: "table" | "grid" = "table";
  private currentItems: XpmTreeNode[] = [];
  private targetElement: HTMLElement | null = null;

  private treeRenderer: MediaTreeRenderer;
  private viewRenderer: MediaViewRenderer;

  private dom = {
    sidebar: () => document.querySelector<HTMLElement>(".media-overlay .media-modal-sidebar"),
    body: () => document.querySelector<HTMLElement>(".media-overlay .media-modal-body"),
    title: () => document.querySelector<HTMLElement>(".media-overlay .selected-item-title"),
    saveBtn: () => document.querySelector<HTMLButtonElement>(".media-overlay .save")
  };

  constructor(api: ApiClient) {
    this.api = api;

    this.treeRenderer = new MediaTreeRenderer({
      onNodeSelect: (items) => this.layoutSwitcher(items),
      getChildren: (id) => this.getChildren(id),
      getSidebar: () => this.dom.sidebar(),
      getTitle: () => this.dom.title()
    });

    this.viewRenderer = new MediaViewRenderer(this.api, {
      getBody: () => this.dom.body(),
      onItemSelect: (id, title, binaryUrl) => this.selectMediaItem(id, title, binaryUrl)
    });
  }

  getTreeData(): XpmTreeNode[] {
    if (!this.publication) {
      return [];
    }
    return [
      {
        Id: this.publication.Id,
        title: this.publication.Title,
        items: this.orgStructure,
        contentItems: this.rootContentItems,
        loaded: true
      }
    ];
  }

  setActiveTreeNode(item: HTMLElement): void {
    this.treeRenderer.setActiveTreeNode(item);
  }

  updateOrgStructure(): void {
    this.treeRenderer.renderTree(this.getTreeData());
  }

  renderEmptyLayout(container: HTMLElement): void {
    this.viewRenderer.renderEmptyLayout(container);
  }

  async gridViewLayout(items: XpmTreeNode[]): Promise<void> {
    await this.viewRenderer.gridViewLayout(items);
  }

  async getGridCardTemplate(item: XpmTreeNode): Promise<string> {
    return await this.viewRenderer.getGridCardTemplate(item);
  }

  tableViewLayout(items: XpmTreeNode[]): void {
    this.viewRenderer.tableViewLayout(items);
  }

  layoutSwitcher(items: XpmTreeNode[] = []): void {
    this.currentItems = items;
    if (this.layout === "table") {
      this.tableViewLayout(items);
    } else {
      void this.gridViewLayout(items);
    }
  }

  setExpandedIcon(icon: HTMLElement, expanded: boolean): void {
    this.treeRenderer.setExpandedIcon(icon, expanded);
  }

  createTree(nodes: XpmTreeNode[] = []): HTMLUListElement {
    return this.treeRenderer.createTree(nodes);
  }

  async getChildren(id: string): Promise<XpmItem[]> {
    const itemId = formatTcmId(id);
    return await this.api.getRequest<XpmItem[]>(`/items/${itemId}/items?useDynamicVersion=true&recursive=false&details=Contentless`);
  }

  private selectMediaItem(id: string, title: string, binaryUrl: string): void {
    this.selectedMedia.Id = id;
    this.selectedMedia.Title = title;

    if (this.targetElement) {
      const displayImg = this.targetElement.querySelector("img");
      if (displayImg && binaryUrl) {
        displayImg.setAttribute("src", binaryUrl);
      }

      const saveBtn = this.dom.saveBtn();
      if (saveBtn) {
        saveBtn.removeAttribute("disabled");
        Object.assign(saveBtn.style, {
          cursor: "pointer",
          background: "#007373"
        });
      }
    }
  }

  private async updateMedia(componentResponse: XpmItem, itemPosition: number, fieldName: string, overlay: HTMLElement): Promise<void> {
    try {
      this.isLoading = true;
      const saveBtn = this.dom.saveBtn();
      if (saveBtn) {
        saveBtn.textContent = "Saving...";
        saveBtn.setAttribute("disabled", "true");
      }
      const parentRef = componentResponse?.BluePrintInfo?.PrimaryBluePrintParentItem?.IdRef;

      const checkoutId = formatTcmId(parentRef);
      const checkoutResponse = await this.api.postService<XpmItem>(`/items/${checkoutId}/checkOut`, {});

      const position = Number(itemPosition);

      if (!checkoutResponse.Content) {
        throw new Error("Checkout content is missing");
      }

      const content = checkoutResponse.Content as Record<string, unknown>;
      let currentIndex = 0;

      const updateRecursive = (obj: unknown): boolean => {
        if (!obj || typeof obj !== "object") return false;

        if (Array.isArray(obj)) {
          for (const item of obj) {
            if (updateRecursive(item)) return true;
          }
          return false;
        }

        const record = obj as Record<string, unknown>;
        const matchingKey = Object.keys(record).find((k) => k.toLowerCase() === fieldName.toLowerCase());

        if (matchingKey !== undefined) {
          const targetValue = record[matchingKey];

          if (Array.isArray(targetValue)) {
            if (position >= 0 && position < targetValue.length) {
              const targetItem = targetValue[position];
              if (targetItem && typeof targetItem === "object") {
                (targetItem as Record<string, string>).IdRef = this.selectedMedia.Id;
                (targetItem as Record<string, string>).Title = this.selectedMedia.Title;
                return true;
              }
            }
          } else {
            if (currentIndex === position) {
              if (targetValue && typeof targetValue === "object") {
                (targetValue as Record<string, string>).IdRef = this.selectedMedia.Id;
                (targetValue as Record<string, string>).Title = this.selectedMedia.Title;
              } else {
                record[matchingKey] = {
                  IdRef: this.selectedMedia.Id,
                  Title: this.selectedMedia.Title
                };
              }
              return true;
            }
            currentIndex++;
          }
        }

        for (const key of Object.keys(record)) {
          if (key === "$type") continue;
          const child = record[key];
          if (child && typeof child === "object") {
            if (updateRecursive(child)) return true;
          }
        }

        return false;
      };

      updateRecursive(content);

      const targetUpdateId = formatTcmId(checkoutResponse.Id);
      const updateComponent = await this.api.putService<XpmItem>(`/items/${targetUpdateId}`, checkoutResponse);

      const targetCheckInId = formatTcmId(updateComponent.Id);
      await this.api.postService<XpmItem>(`/items/${targetCheckInId}/checkIn`, { "RemovePermanentLock": true });

      this.isLoading = false;
      overlay.remove();

      if (saveBtn) {
        saveBtn.textContent = "Save & Finish";
        saveBtn.removeAttribute("disabled");
      }
    } catch (error) {
      console.error("Failed to update selected media", error);
      this.isLoading = false;
      const saveBtn = this.dom.saveBtn();
      if (saveBtn) {
        saveBtn.removeAttribute("disabled");
        saveBtn.textContent = "Save & Finish";
      }
    }
  }

  async render(componentId: string, fieldName: string, itemPosition: number, currentTargetElement: HTMLElement): Promise<void> {
    this.targetElement = currentTargetElement;
    this.isLoading = true;
    this.selectedMedia = { Id: "", Title: "" };

    const { overlay, modal } = MediaModalRenderer.createModalShell(this.isLoading);
    document.body.appendChild(overlay);

    let activeComponentResponse: XpmItem | null = null;

    MediaModalRenderer.bindModalEvents(modal, overlay, {
      onLayoutChange: (layout) => {
        this.layout = layout;
        this.layoutSwitcher(this.currentItems);
      },
      onSave: () => {
        if (activeComponentResponse) {
          void this.updateMedia(activeComponentResponse, itemPosition, fieldName, overlay);
        }
      }
    });

    try {
      const id = formatTcmId(componentId);
      const componentResponse = await this.api.getRequest<XpmItem>(`/items/${id}?useDynamicVersion=true`);
      activeComponentResponse = componentResponse;

      const repoRef = componentResponse.BluePrintInfo?.OwningRepository?.IdRef;
      const owningRepository = formatTcmId(repoRef);

      this.isLoading = true;
      const [publication, orgStructure] = await Promise.all([
        this.api.getRequest<XpmItem>(`/items/${owningRepository}?useDynamicVersion=true`),
        this.api.getRequest<XpmItem[]>(`/items/${owningRepository}/items?useDynamicVersion=true&recursive=false&details=Contentless`)
      ]);

      this.publication = publication;
      this.orgStructure = orgStructure.filter((item) => item.$type === "Folder");
      this.rootContentItems = orgStructure.filter((item) => item.$type === "Folder" || (item.$type === "Component" && item.ComponentType === "Multimedia"));
      this.isLoading = false;

      const modalBody = modal.querySelector(".media-modal-body");
      if (modalBody) modalBody.innerHTML = "";

      this.updateOrgStructure();
      this.layoutSwitcher(this.rootContentItems);
    } catch (error) {
      console.error("Failed to load items:", error);
      this.isLoading = false;

      const modalBody = modal.querySelector(".media-modal-body");
      if (modalBody) modalBody.innerHTML = "";

      const sidebar = this.dom.sidebar();
      if (sidebar) sidebar.innerHTML = "<div style='color:red; padding:10px;'>Failed to load repository structure.</div>";
    }
  }
}
