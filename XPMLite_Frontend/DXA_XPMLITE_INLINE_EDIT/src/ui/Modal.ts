export interface ModalOptions {
  title: string;
  body: string | HTMLElement;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
}

export class ModalService {
  private static instance: ModalService;
  private currentOnClose?: () => void;
  private keydownHandler?: (e: KeyboardEvent) => void;

  private constructor() {
    this.injectStyles();
  }

  public static getInstance(): ModalService {
    if (!ModalService.instance) {
      ModalService.instance = new ModalService();
    }
    return ModalService.instance;
  }

  private injectStyles(): void {
    if (typeof document === "undefined" || document.getElementById("xpm-modal-wrapper-styles")) return;

    const style = document.createElement("style");
    style.id = "xpm-modal-wrapper-styles";
    style.textContent = `
      .xpm-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483648;
      }

      .xpm-modal-container {
        background: #fff;
        border-radius: 8px;
        width: 680px;
        max-width: 90vw;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        position: relative;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .xpm-modal-body {
        padding: 10px 24px;
        overflow-y: auto;
        max-height: 80vh;
      }

      .xpm-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding: 10px 24px;
        border-bottom: 1px solid #dee2e6;
      }

      .xpm-modal-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
      }

      .xpm-modal-close:hover { color: #000; }
    `;
    document.head.appendChild(style);
  }

  public open(options: ModalOptions): void {
    this.close();

    this.currentOnClose = options.onClose;

    const overlay = document.createElement("div");
    overlay.className = "xpm-modal-overlay";
    overlay.id = "xpm-modal-wrapper";

    overlay.innerHTML = `
      <div class="xpm-modal-container">
        <div class="xpm-modal-header">
          <h3 style="margin: 0; font-size: 18px;">${options.title}</h3>
          <button type="button" class="xpm-modal-close" id="xpm-close-btn">&times;</button>
        </div>
        <div class="xpm-modal-body" id="xpm-modal-body"></div>
      </div>
    `;

    const bodyContainer = overlay.querySelector("#xpm-modal-body") as HTMLElement;

    if (typeof options.body === "string") {
      bodyContainer.innerHTML = options.body;
    } else {
      bodyContainer.appendChild(options.body);
    }

    document.body.appendChild(overlay);

    overlay.querySelector("#xpm-close-btn")?.addEventListener("click", () => this.close());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay && options.closeOnOverlayClick !== false) {
        this.close();
      }
    });

    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
    document.addEventListener("keydown", this.keydownHandler);
  }

  public close(overrideCallback?: () => void): void {
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = undefined;
    }

    const existingModal = document.getElementById("xpm-modal-wrapper");
    if (existingModal) {
      existingModal.remove();

      const callbackToRun = overrideCallback || this.currentOnClose;
      this.currentOnClose = undefined;

      if (callbackToRun) {
        callbackToRun();
      }
    }
  }
}
