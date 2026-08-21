export class StyleInjectorService {
  public injectHighlightStyles(configUrl?: string): void {
    this.injectStyle(
      "xpm-field-highlight-style",
      `
      .activeEditor:hover {
        outline: 2px solid #007373 !important;
        outline-offset: -2px;
        transition: all 0.5s;
        cursor: pointer;
        border-radius: 4px;
      }
      `
    );

    this.injectStyle(
      "xpm-component-editor-style",
      `
      .xpm-component-editor-link {
        position: absolute !important;
        top: 0 !important; right: 0 !important;
        width: 28px !important; height: 28px !important;
        display: none; align-items: center; justify-content: center;
        background: #007373; color: #fff; border-radius: 4px;
        z-index: 2147483647 !important; cursor: pointer; text-decoration: none; box-sizing: border-box;
      }
      [data-component-id]:hover > .xpm-component-editor-link { display: flex; }
      .xpm-component-editor-link:hover, .xpm-component-editor-link svg:hover { color: #fff; }
      `
    );

    this.injectStyle(
      "xpm-region-highlight-style",
      `
      .xpm-region-highlight:hover { outline: 2px solid #007373 !important; outline-offset: -2px; }
      `
    );

    this.injectStyle(
      "xpm-component-add-style",
      `
      .xpm-component-highlight:hover { outline: 2px solid #007373 !important; outline-offset: -2px; }
      .xpm-component-add-item {
        position: absolute !important; top: 0 !important; right: 0 !important;
        width: 28px; height: 28px; display: none; align-items: center; justify-content: center;
        background: #007373; color: #fff; border-radius: 4px; z-index: 2147483647 !important;
        cursor: pointer; box-sizing: border-box; border: none; padding: 0; margin: 0 30px;
      }
      [data-region]:hover > .xpm-component-add-item { display: flex; }
      .xpm-component-add-item:hover { background: #005959; }
      .xpm-field { margin-bottom: 12px; }
      .xpm-field label { display: inline-block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
      .xpm-field input[type="text"], .xpm-field textarea, .xpm-field input[type="datetime-local"], .xpm-field select{ 
        width: 100%; padding: 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; 
      }
      .xpm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
      .xpm-btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; }
      .xpm-btn-primary { background: #007373; color: #fff; }
      .xpm-btn-secondary { background: #e0e0e0; color: #333; }
      .xpm-btn-danger { background: #dc3545; color: #fff; padding: 4px 8px; font-size: 12px; float: right; margin-bottom: 8px; }
      .xpm-binary-upload { display: flex; align-items: center; gap: 8px; }
      .xpm-binary-upload input[type="file"] { flex: 1; }
      .xpm-save-binary-btn {
        background: #f0f0f0; border: 1px solid #ccc; padding: 6px 8px; cursor: pointer; border-radius: 4px; display: flex; align-items: center;
      }
      .xpm-save-binary-btn:hover { background: #007373; color: #fff; }
      .xpm-embedded-group { border: 1px solid #007373; padding: 12px; margin-bottom: 12px; border-radius: 4px; background: #fafafa; }
      .xpm-embedded-item { border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px; background: #fff; border-radius: 4px; }
      
      /* Accordion Details Styling */
      .xpm-collapsible-section {
        border: 1px solid #d1d5db; border-radius: 6px; margin-top: 20px; background: #ffffff; overflow: hidden;
      }
      .xpm-collapsible-section[open] { border-color: #007373; }
      .xpm-collapsible-header {
        display: flex; align-items: center; justify-content: space-between; padding: 12px 16px;
        background: #f8fafc; font-weight: 600; font-size: 14px; color: #1e293b; cursor: pointer; user-select: none; list-style: none;
      }
      .xpm-collapsible-header::-webkit-details-marker { display: none; }
      .xpm-collapsible-header:hover { background: #f1f5f9; }
      .xpm-collapsible-arrow { transition: transform 0.2s ease; color: #64748b; }
      .xpm-collapsible-section[open] .xpm-collapsible-arrow { transform: rotate(180deg); color: #007373; }
      .xpm-collapsible-body { padding: 16px; border-top: 1px solid #e2e8f0; background: #ffffff; }
      `
    );

    if (configUrl) {
      this.attachComponentLinks(configUrl);
    }
  }

  private injectStyle(id: string, cssText: string): void {
    if (typeof document === "undefined" || document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  public attachComponentLinks(baseUrl: string): void {
    const componentLinks = document.querySelectorAll<HTMLElement>("[data-component-id]");
    componentLinks.forEach((item) => {
      item.classList.add("xpm-component-highlight");
      if (item.querySelector(".xpm-component-editor-link")) return;

      const compId = item.dataset.componentId;
      if (!compId) return;

      if (getComputedStyle(item).position === "static") {
        item.style.position = "relative";
      }

      const link = document.createElement("a");
      link.className = "xpm-component-editor-link";
      link.target = "_blank";
      link.title = compId;
      link.href = `${baseUrl}/component?item=${encodeURIComponent(compId)}`;
      link.innerHTML = `
        <svg viewBox="64 64 896 896" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M574 665.4a8.03 8.03 0 00-11.3 0L446.5 781.6c-53.8 53.8-144.6 59.5-204 0-59.5-59.5-53.8-150.2 0-204l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3l-39.8-39.8a8.03 8.03 0 00-11.3 0L191.4 526.5c-84.6 84.6-84.6 221.5 0 306s221.5 84.6 306 0l116.2-116.2c3.1-3.1 3.1-8.2 0-11.3L574 665.4zm258.6-474c-84.6-84.6-221.5-84.6-306 0L410.3 307.6a8.03 8.03 0 000 11.3l39.7 39.7c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c53.8-53.8 144.6-59.5 204 0 59.5 59.5 53.8 150.2 0 204L665.3 562.6a8.03 8.03 0 000 11.3l39.8 39.8c3.1 3.1 8.2 3.1 11.3 0l116.2-116.2c84.5-84.6 84.5-221.5 0-306.1zM610.1 372.3a8.03 8.03 0 00-11.3 0L372.3 598.7a8.03 8.03 0 000 11.3l39.6 39.6c3.1 3.1 8.2 3.1 11.3 0l226.4-226.4c3.1-3.1 3.1-8.2 0-11.3l-39.5-39.6z"/>
        </svg>`;
      item.appendChild(link);
    });

    document.querySelectorAll<HTMLElement>("[data-region]").forEach((region) => {
      region.classList.add("xpm-region-highlight");
    });
  }
}
