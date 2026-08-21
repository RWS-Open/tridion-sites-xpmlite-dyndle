import { AuthService } from "../services/AuthService";
import { ApiClient } from "../services/ApiClient";
import { Media } from "../media/Media";
import { ComponentService } from "../services/ComponentService";
import { StyleInjectorService } from "../services/StyleInjectorService";
import { EditorFactory } from "../editor/EditorFactory";
import { XpmApiService } from "../services/XpmApiService";
import { ConfigService } from "../services/ConfigService";
import { formatTcmId, safeJsonParse } from "../utils/utils";
import tinymce from "tinymce/tinymce";
import { TinymceEditor } from "../editor/TinymceEditor";

export class Xpmlite {
  private auth: AuthService;
  private media: Media;
  private componentService: ComponentService;
  private xpmApi: XpmApiService;
  private configService: ConfigService;

  private pageLoader: HTMLElement | null;
  private loader: HTMLElement | null;

  private styleInjector = new StyleInjectorService();
  private editorFactory = new EditorFactory();

  constructor(
    auth: AuthService,
    api: ApiClient,
    media: Media,
    componentService: ComponentService,
    configService?: ConfigService
  ) {
    this.auth = auth;
    this.media = media;
    this.componentService = componentService;
    this.configService = configService || ConfigService.getInstance();

    this.xpmApi = new XpmApiService(api);
    this.pageLoader = document.querySelector(".page-loader");
    this.loader = document.querySelector(".loader");

    this.initEventDelegation();
  }

  public loginStatus(): void {
    const inputFields = document.querySelectorAll<HTMLElement>("[data-fieldname]");
    this.toggleEditorState(inputFields, false);

    if (typeof document !== "undefined" && document.cookie && document.cookie.includes("access_token")) {
      const token = this.auth.getCookie("access_token");
      if (token) {
        this.toggleEditorState(inputFields, true);
        this.styleInjector.injectHighlightStyles(this.configService.experienceSpaceUrl);
        this.componentService.renderComponent();
      }
    }
  }

  private toggleEditorState(inputFields: NodeListOf<Element>, enable: boolean): void {
    inputFields.forEach((item) => {
      item.classList.toggle("activeEditor", enable);
      item.classList.toggle("disabledEditor", !enable);
    });
  }

  private setLoadersVisibility(visible: boolean): void {
    const display = visible ? "block" : "none";
    if (this.loader) this.loader.style.display = display;
    if (this.pageLoader) this.pageLoader.style.display = display;
  }

  private async updateComponent(tcmid: string, targetElement: Element, indexPosition: string | null): Promise<void> {
    const inputField = targetElement.closest("[data-fieldname]");
    if (!inputField) return;

    inputField.classList.remove("xpm-active-field");
    let tagName = "";
    let inputValue = "";

    const inputEl = inputField.querySelector("input") as HTMLInputElement | null;
    const textareaInput = inputField.querySelector("textarea") as HTMLTextAreaElement | null;

    if (inputEl?.getAttribute("name")) {
      tagName = inputEl.getAttribute("name")!;
      inputValue = inputEl.value;
      if (inputEl.type === "datetime-local" && inputValue && inputValue.length === 16) {
        inputValue = `${inputValue}:00`;
      }
      inputField.innerHTML = inputValue;
    } else if (textareaInput?.getAttribute("name")) {
      tagName = textareaInput.getAttribute("name")!;
      const editorId = textareaInput.id;
      const targetEditor = tinymce.get(editorId);

      if (targetEditor) {
        inputValue = targetEditor.getContent();
        //this.editorFactory.destroyEditor(editorId);
        TinymceEditor.destroyEditor(editorId)
      } else {
        inputValue = textareaInput.value;
      }
      inputField.innerHTML = inputValue;
    }

    this.setLoadersVisibility(true);
    try {
      const isSuccess = await this.xpmApi.updateComponentPayload(tcmid, tagName, inputValue, indexPosition);
      if (isSuccess) {
        const storageData = safeJsonParse<Record<string, Record<string, string>>>(localStorage.getItem("clonedText"), {});
        storageData[tcmid] = storageData[tcmid] || {};
        storageData[tcmid][tagName] = inputValue;
        localStorage.setItem("clonedText", JSON.stringify(storageData));
      }
    } finally {
      this.setLoadersVisibility(false);
    }
  }

  private async showEditor(target: HTMLElement, itemPosition: number): Promise<boolean> {
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return false;

    const fieldContainer = target.closest("[data-fieldname]") as HTMLElement | null;
    const parentComponent = target.closest("[data-component-id]");
    if (!fieldContainer || !parentComponent) return false;

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "xpmlite-loading";
    loadingDiv.textContent = "Loading...";
    Object.assign(loadingDiv.style, { color: "#fff", position: "relative" });
    fieldContainer.parentNode?.insertBefore(loadingDiv, fieldContainer.nextSibling);

    const componentId = formatTcmId(parentComponent.getAttribute("data-component-id") || "");
    const fieldName = fieldContainer.getAttribute("data-fieldname") || "";

    const result = await this.xpmApi.fetchSchemaIdAndValue(componentId, fieldName, itemPosition);
    document.querySelector(".xpmlite-loading")?.remove();

    if (!result) return false;

    const lockInfo = result.lockInfo;
    const isCheckedOut = Array.isArray(lockInfo?.LockType) && lockInfo.LockType.some((t) => t.toLowerCase() === "checkedout");
    const lockUser = lockInfo?.LockUser?.Title?.trim() || lockInfo?.LockUser?.Description?.trim() || "";

    if (isCheckedOut && lockUser !== "") {
      const errorMsg = document.createElement("div");
      errorMsg.className = "xpmlite-error-msg";
      errorMsg.textContent = `Editing is not allowed as the component is checked out by user (${lockUser}).`;
      Object.assign(errorMsg.style, {
        color: "#d9534f",
        backgroundColor: "#f2dede",
        border: "1px solid #ebccd1",
        padding: "6px 10px",
        borderRadius: "4px",
        marginTop: "5px",
        fontSize: "12px",
        display: "block"
      });

      fieldContainer.parentNode?.insertBefore(errorMsg, fieldContainer.nextSibling);

      return false;
    }

    const { schemaId, rawContent } = result;

    if (rawContent !== undefined && rawContent !== null) {
      const storageData = safeJsonParse<Record<string, Record<string, string>>>(localStorage.getItem("clonedText"), {});
      storageData[componentId] = storageData[componentId] || {};
      if (!storageData[componentId][fieldName]) {
        storageData[componentId][fieldName] = fieldContainer.innerHTML;
      }
      localStorage.setItem("clonedText", JSON.stringify(storageData));
    }

    const fieldDef = await this.xpmApi.getFieldDefinition(schemaId, fieldName);

    if (!fieldDef) return false;

    switch (fieldDef.$type) {
      case "XhtmlFieldDefinition":
        this.editorFactory.renderRichText(fieldName, fieldContainer, rawContent);
        break;
      case "MultiLineTextFieldDefinition":
        this.editorFactory.renderPlainTextarea(fieldName, fieldContainer, rawContent);
        break;
      case "SingleLineTextFieldDefinition":
        this.editorFactory.renderInputField(fieldName, fieldContainer, rawContent);
        break;
      case "DateFieldDefinition":
        this.editorFactory.renderDateField(fieldName, fieldContainer, rawContent);
        break;
      default:
        this.editorFactory.renderInputField(fieldName, fieldContainer, rawContent);
        break;
    }
    return true;
  }

  private formatDateIfISO(val: string): string {
    if (!val) return "";
    const trimmed = val.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const month = monthNames[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    return val;
  }

  private cancelEditing(target: HTMLElement): void {
    const field = target.closest("[data-fieldname]") as HTMLElement | null;
    if (!field) return;

    field.classList.remove("xpm-active-field");

    const parentComponent = field.closest("[data-component-id]");
    if (!parentComponent) return;

    const rawComponentId = parentComponent.getAttribute("data-component-id") || "";
    const sanitizedComponentId = formatTcmId(rawComponentId);
    const fieldName = field.getAttribute("data-fieldname") || "";

    const textarea = field.querySelector("textarea");
    if (textarea?.id) {
      TinymceEditor.destroyEditor(textarea.id);
    }

    const cachedText = safeJsonParse<Record<string, Record<string, string>>>(localStorage.getItem("clonedText"), {});
    const compStorage = cachedText?.[rawComponentId] || cachedText?.[sanitizedComponentId];
    let originalContent: string | undefined;

    if (compStorage) {
      if (compStorage[fieldName] !== undefined) {
        originalContent = compStorage[fieldName];
      } else {
        const matchingKey = Object.keys(compStorage).find((k) => k.toLowerCase() === fieldName.toLowerCase());
        if (matchingKey) {
          originalContent = compStorage[matchingKey];
        }
      }
    }

    if (originalContent !== undefined && originalContent.trim() !== "") {
      field.innerHTML = this.formatDateIfISO(originalContent);
    } else {
      const inputEl = field.querySelector("input, textarea") as HTMLInputElement | HTMLTextAreaElement | null;
      const fallbackVal = inputEl ? inputEl.value : field.innerText;
      field.innerHTML = this.formatDateIfISO(fallbackVal);
    }
  }

  private initEventDelegation(): void {
    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const saveBtn = target.closest(".saveComponent");
      const cancelBtn = target.closest(".cancelComponentEditing") as HTMLElement | null;

      if (cancelBtn) {
        this.cancelEditing(cancelBtn);
        return;
      }

      if (saveBtn) {
        e.stopPropagation();
        const parentComp = saveBtn.closest("[data-component-id]");
        const indexElement = saveBtn.closest("[data-index]");
        if (!parentComp || !indexElement) return;

        const compId = parentComp.getAttribute("data-component-id");
        if (!compId) return;

        const nestedIndex = indexElement.parentElement?.closest("[data-index]");
        const indexPosition = nestedIndex ? nestedIndex.getAttribute("data-index") : indexElement.getAttribute("data-index");

        void this.updateComponent(formatTcmId(compId), saveBtn, indexPosition);
      }
    });

    document.addEventListener("dblclick", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const fieldContainer = target.closest("[data-fieldname]");
      if (!fieldContainer || fieldContainer.classList.contains("disabledEditor")) return;

      e.preventDefault();
      e.stopPropagation();

      const fieldType = fieldContainer.getAttribute("data-fieldname");
      const indexElement = target.closest("[data-index]");
      const parentComp = target.closest("[data-component-id]");
      const parentField = target.closest("[data-fieldname]");

      if (!parentComp || !parentField || !indexElement) return;

      const nestedIndex = indexElement.parentElement?.closest("[data-index]");
      const itemPosition = Number(nestedIndex ? nestedIndex.getAttribute("data-index") : indexElement.getAttribute("data-index"));

      if ((fieldType === "image" || fieldType === "media" || target.tagName === "IMG") && this.media) {
        const componentId = formatTcmId(parentComp.getAttribute("data-component-id") || "");
        const fieldName = parentField.getAttribute("data-fieldname") || "";
        void this.media.render(componentId, fieldName, itemPosition, fieldContainer as HTMLElement);
      } else {
        void this.showEditor(target, itemPosition);
      }
    });

    document.addEventListener("change", (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target.closest("[data-fieldname]")) return;

      const regionEl = target.closest("[data-region]");
      if (!regionEl) return;

      const region = regionEl.getAttribute("data-region") || "";
      const localStorageData = safeJsonParse<Record<string, string>>(localStorage.getItem(region), {});

      localStorageData[target.name] = target.value;
      localStorage.setItem(region, JSON.stringify(localStorageData));
    });
  }
}
