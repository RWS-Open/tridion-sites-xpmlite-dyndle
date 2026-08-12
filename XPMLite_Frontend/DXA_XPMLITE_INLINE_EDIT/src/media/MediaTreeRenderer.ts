import type { XpmItem, XpmTreeNode } from "../types/xpm";
import { SVG_ICONS } from "./MediaIcons";

export interface MediaTreeCallbacks {
  onNodeSelect: (items: XpmTreeNode[]) => void;
  getChildren: (id: string) => Promise<XpmItem[]>;
  getSidebar: () => HTMLElement | null;
  getTitle: () => HTMLElement | null;
}

export class MediaTreeRenderer {
  private selectedTreeNode: HTMLElement | null = null;
  private callbacks: MediaTreeCallbacks;

  constructor(callbacks: MediaTreeCallbacks) {
    this.callbacks = callbacks;
  }

  public getSelectedNode(): HTMLElement | null {
    return this.selectedTreeNode;
  }

  public setActiveTreeNode(item: HTMLElement): void {
    if (this.selectedTreeNode) {
      Object.assign(this.selectedTreeNode.style, {
        backgroundColor: "",
        color: "",
        border: ""
      });
    }

    Object.assign(item.style, {
      backgroundColor: "#e5f2f2",
      border: "1px solid #007373",
      color: "#007373"
    });

    this.selectedTreeNode = item;
    const titleEl = this.callbacks.getTitle();
    if (titleEl) {
      titleEl.innerHTML = `<span style="display:flex;gap:5px; flex-direction:row;">
        ${SVG_ICONS.folder} ${item.textContent?.trim() || ""}
      </span>`;
    }
  }

  public setExpandedIcon(icon: HTMLElement, expanded: boolean): void {
    icon.innerHTML = expanded ? SVG_ICONS.expanded : SVG_ICONS.collapsed;
  }

  public renderTree(nodes: XpmTreeNode[]): void {
    const sidebar = this.callbacks.getSidebar();
    if (!sidebar) return;
    sidebar.innerHTML = "";
    sidebar.appendChild(this.createTree(nodes));
  }

  public createTree(nodes: XpmTreeNode[] = []): HTMLUListElement {
    const ul = document.createElement("ul");
    Object.assign(ul.style, { listStyle: "none", paddingLeft: "20px", margin: "0" });

    nodes.forEach((node) => {
      const icon = document.createElement("span");
      icon.style.lineHeight = "normal";
      this.setExpandedIcon(icon, false);

      const title = node.title ?? node.Title ?? "";
      const li = document.createElement("li");
      li.style.margin = "2px 0";

      const label = document.createElement("span");
      label.textContent = title;

      const item = document.createElement("div");
      item.className = "tree-node";
      Object.assign(item.style, {
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        gap: "6px"
      });

      item.appendChild(icon);
      item.appendChild(label);

      item.addEventListener("mouseenter", () => {
        if (this.selectedTreeNode !== item) item.style.backgroundColor = "#f5f5f5";
      });
      item.addEventListener("mouseleave", () => {
        if (this.selectedTreeNode !== item) item.style.backgroundColor = "";
      });

      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-children";
      Object.assign(childrenContainer.style, { display: "none", marginLeft: "10px" });

      li.appendChild(item);
      li.appendChild(childrenContainer);

      if (node.items && node.items.length > 0) {
        childrenContainer.appendChild(this.createTree(node.items));

        item.addEventListener("click", (e: MouseEvent) => {
          e.stopPropagation();
          this.setActiveTreeNode(item);
          const expanded = childrenContainer.style.display === "block";
          childrenContainer.style.display = expanded ? "none" : "block";
          this.setExpandedIcon(icon, !expanded);
          this.callbacks.onNodeSelect(node.contentItems || []);
        });
      } else {
        item.addEventListener("click", async (e: MouseEvent) => {
          e.stopPropagation();
          this.setActiveTreeNode(item);

          if (node.loaded) {
            const expanded = childrenContainer.style.display === "block";
            childrenContainer.style.display = expanded ? "none" : "block";
            this.setExpandedIcon(icon, !expanded);
            this.callbacks.onNodeSelect(node.contentItems || []);
            return;
          }

          childrenContainer.style.display = "block";
          childrenContainer.innerHTML = "<div style='padding:5px; color:#888;'>Loading...</div>";
          this.setExpandedIcon(icon, true);

          try {
            const targetId = node.Id ?? "";
            const children = await this.callbacks.getChildren(targetId);

            const folders: XpmTreeNode[] = children.filter((child) => child.$type === "Folder");
            const contentItems: XpmTreeNode[] = children.filter(
              (child) =>
                child.$type === "Folder" ||
                (child.$type === "Component" && child.ComponentType === "Multimedia")
            );

            node.items = folders;
            node.contentItems = contentItems;
            node.loaded = true;
            childrenContainer.innerHTML = "";

            if (node.items && node.items.length > 0) {
              childrenContainer.appendChild(this.createTree(node.items));
            } else {
              icon.style.visibility = "hidden";
            }
            this.callbacks.onNodeSelect(contentItems);
          } catch (error) {
            console.error("Failed to load children nodes:", error);
            childrenContainer.innerHTML = "<div style='padding:5px; color:red;'>Failed loading items</div>";
            childrenContainer.style.display = "none";
            this.setExpandedIcon(icon, false);
          }
        });
      }

      ul.appendChild(li);
    });

    return ul;
  }
}
