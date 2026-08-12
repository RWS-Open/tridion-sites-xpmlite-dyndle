export interface MediaModalCallbacks {
  onLayoutChange: (layout: "table" | "grid") => void;
  onSave: () => void;
}

export class MediaModalRenderer {
  public static createModalShell(isLoading: boolean): { overlay: HTMLElement; modal: HTMLElement } {
    document.querySelector(".media-overlay")?.remove();

    const overlay = document.createElement("div");
    overlay.className = "media-overlay";
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      min-width: 300px;
      text-align: center;
      width:calc(100% - 300px);
      height:calc(100% - 100px);
    `;

    modal.innerHTML = `<div style="width: 100%;height: 100%;display: flex;justify-content: space-between;flex-direction: column;">
      <div style="width:100%;border-bottom:1px solid #eee; display:flex; align-items:center;justify-content:space-between;padding: 10px;">
        <h4 style="margin:0">Select an item</h4>
        <button class="closeModalBtn" style="background:transparent;border: 1px solid #fff;padding: 5px 20px; border-radius: 5px;cursor: pointer;">X</button>
      </div>
      <div class="media-modal-content" style="width:100%;display:flex; flex:1; overflow:hidden;">
        <div class="media-modal-sidebar" style="width:280px;min-width:250px;max-width:350px;overflow-y:auto; background:#fff;flex:3;border-right: 1px solid #e1e7eb;display:flex;justify-content: flex-start; height:calc(100vh - 200px);overflow-y:auto">
          ${isLoading ? `<span style="padding:10px;">Loading...</span>` : ""}
        </div>
        <div style="flex:7;background:#eee;height:calc(100vh - 200px); overflow-y:auto;padding:10px;">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:5px;">
            <div class="selected-item-title" style="display:flex;width:100%"></div>
            <div class="switch-view" style="display:flex;justify-content:flex-end;width:100%;gap:10px;padding-bottom:10px;">
              <svg data-layout="table" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" style="width:16px;height:16px;">
                <path d="M14.8125 3.5625H1.1875C1.13777 3.5625 1.09008 3.54275 1.05492 3.50758C1.01975 3.47242 1 3.42473 1 3.375V2.625C1 2.57527 1.01975 2.52758 1.05492 2.49242C1.09008 2.45725 1.13777 2.4375 1.1875 2.4375H14.8125C14.8622 2.4375 14.9099 2.45725 14.9451 2.49242C14.9802 2.52758 15 2.57527 15 2.625V3.375C15 3.42473 14.9802 3.47242 14.9451 3.50758C14.9099 3.54275 14.8622 3.5625 14.8125 3.5625ZM14.8125 8.5625H1.1875C1.13777 8.5625 1.09008 8.54275 1.05492 8.50758C1.01975 8.47242 1 8.42473 1 7.625V7.625C1 7.57527 1.01975 7.52758 1.05492 7.49242C1.09008 7.45725 1.13777 7.4375 1.1875 7.4375H14.8125C14.8622 7.4375 14.9099 7.45725 14.9451 7.49242C14.9802 7.52758 15 7.57527 15 7.625V8.375C15 8.42473 14.9802 8.47242 14.9451 8.50758C14.9099 3.54275 14.8622 3.5625 14.8125 3.5625ZM14.8125 13.5625H1.1875C1.13777 13.5625 1.09008 13.5427 1.05492 13.5076C1.01975 13.4724 1 13.4247 1 13.375V12.625C1 12.5753 1.01975 12.5276 1.05492 12.4924C1.09008 12.4573 1.13777 12.4375 1.1875 12.4375H14.8125C14.8622 12.4375 14.9099 12.4573 14.9451 12.4924C14.9802 12.5276 15 12.5753 15 12.625V13.375C15 13.4247 14.9802 13.4724 14.9451 13.5076C14.9099 13.5427 14.8622 13.5625 14.8125 13.5625Z"></path>
              </svg>
              <svg data-layout="grid" version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 15 13" style="width:16px;height:16px;">
                <path d="M1 6h6V1H1v5zm0 1v5h6V7H1zm13-1V1H8v5h6zm0 1H8v5h6V7zM1 0h13a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z"></path>
              </svg>
            </div>
          </div>
          <div class="media-modal-body">
            ${isLoading ? "Loading..." : ""}
          </div>
        </div>
      </div>
      <div style="width:100%;display:flex; align-items:center; justify-content:flex-end;gap:5px;border-top: 1px solid #dee2e6;padding: 10px;">
        <button class="save" style="border: 1px solid #dee2e6;padding: 5px 20px;border-radius: 5px;cursor: pointer;background-color:#007373;color:#fff;">Save & Finish</button>
        <button class="closeModalBtn" style="border: 1px solid #dee2e6;padding: 5px 20px;border-radius: 5px;cursor: pointer;">Cancel</button>
      </div>
    </div>`;

    overlay.appendChild(modal);
    return { overlay, modal };
  }

  public static bindModalEvents(modal: HTMLElement, overlay: HTMLElement, callbacks: MediaModalCallbacks): void {
    modal.querySelectorAll(".closeModalBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.style.overflow = "";
        overlay.remove();
      });
    });

    const switchView = modal.querySelector(".switch-view") as HTMLElement;
    if (switchView) {
      const svgs = switchView.querySelectorAll("svg");
      if (svgs.length > 0) svgs[0].style.color = "#007373";

      switchView.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const svg = target.closest("svg");
        if (!svg) return;
        svgs.forEach((icon) => {
          icon.style.color = "";
          icon.style.cursor = "pointer";
        });

        svg.style.color = "#007373";
        const layout = (svg.dataset.layout as "table" | "grid") || "table";
        callbacks.onLayoutChange(layout);
      });
    }

    const saveButton = modal.querySelector(".save") as HTMLButtonElement | null;
    if (saveButton) {
      saveButton.setAttribute("disabled", "true");
      Object.assign(saveButton.style, {
        cursor: "not-allowed",
        background: "#eee"
      });

      saveButton.addEventListener("click", () => {
        callbacks.onSave();
      });
    }
  }
}
