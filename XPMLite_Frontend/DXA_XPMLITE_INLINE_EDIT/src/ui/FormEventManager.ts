import { ApiClient } from "../services/ApiClient";
import { ModalService } from "./Modal";
import { SchemaFormRenderer } from "./SchemaFormRenderer";
import { FormPayloadExtractor } from "./FormPayloadExtractor";
import { BinaryUploadManager } from "../services/BinaryUploadManager";
import { ValidationHelper } from "./ValidationHelper";
import { FormStatusNotifier } from "./FormStatusNotifier";
import type { ComponentContextResolver } from "../services/ComponentContextResolver";
import type { FieldDefinition, SchemaLink, XpmItem } from "../types/xpm";
import { formatTcmId, safeJsonParse } from "../utils/utils";
import { TinymceEditor } from "../editor/TinymceEditor";

export class FormEventManager {

  private api: ApiClient;
  private modalService: ModalService;
  private binaryUploader: BinaryUploadManager;
  private resolver: ComponentContextResolver;
  private loadedCategories = new Map<string, Array<{ IdRef: string; Title: string }>>();

  constructor(api: ApiClient, modalService: ModalService, binaryUploader: BinaryUploadManager, resolver: ComponentContextResolver) {
    this.api = api;
    this.modalService = modalService;
    this.binaryUploader = binaryUploader;
    this.resolver = resolver;
  }

  public bind(form: HTMLFormElement, schemaObj: Record<string, FieldDefinition>, metadataSchemaObj: Record<string, FieldDefinition>, binaryContainerData: Record<string, unknown>, componentContainerData: Record<string, unknown>, selectedRegion: string = ""): void {
    this.initRepeatableGroups(form);
    this.bindClickHandlers(form, binaryContainerData);
    this.bindKeywordFocusHandler(form);
    this.bindSubmitHandler(form, schemaObj, metadataSchemaObj, componentContainerData, selectedRegion);

    form.querySelector("#xpm-cancel-btn")?.addEventListener("click", () => this.modalService.close());
  }

  private bindKeywordFocusHandler(form: HTMLFormElement): void {
    form.addEventListener("focusin", async (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const fieldGroup = target.closest<HTMLElement>('.xpm-field[data-field-type="KeywordFieldDefinition"]');
      if (!fieldGroup) return;

      const categoryId = fieldGroup.getAttribute("data-category-id");
      const selectEl = fieldGroup.querySelector<HTMLSelectElement>("select.xpm-keyword-select");
      const radioInputs = fieldGroup.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      if (categoryId && (selectEl || radioInputs.length > 0)) {
        try {
          let keywords = this.loadedCategories.get(categoryId);
          if (!keywords) {
            keywords = await this.resolver.getCategoryKeywords(categoryId);
            this.loadedCategories.set(categoryId, keywords);
          }

          if (selectEl && selectEl.options.length <= 1) {
            selectEl.disabled = true;
            selectEl.options[0].text = `-- Select ${fieldGroup.querySelector("label")?.innerText.replace("*", "").trim()} --`;
            keywords.forEach((keyword) => {
              const opt = document.createElement("option");
              opt.value = keyword.IdRef;
              opt.textContent = keyword.Title;
              selectEl.appendChild(opt);
            });
            selectEl.disabled = false;
          }

          if (radioInputs.length > 0 && keywords && keywords.length > 0) {
            radioInputs.forEach((radioInput) => {
              const val = radioInput.value.toLowerCase();
              const matchingKw = keywords!.find(
                (kw) =>
                  kw.Title.toLowerCase() === val ||
                  kw.IdRef.toLowerCase() === val ||
                  (val === "true" && (kw.Title.toLowerCase() === "true" || kw.Title.toLowerCase() === "yes")) ||
                  (val === "false" && (kw.Title.toLowerCase() === "false" || kw.Title.toLowerCase() === "no"))
              );
              if (matchingKw) {
                radioInput.value = matchingKw.IdRef;
              }
            });
          }
        } catch (error) {
          console.error("Failed to populate category keywords:", error);
        }
      }
    });
  }

  private initRepeatableGroups(form: HTMLFormElement): void {
    form.querySelectorAll(".xpm-embedded-group").forEach((group) => this.updateRemoveButtonsAndAddState(group));
  }

  private updateRemoveButtonsAndAddState(containerGroup: Element): void {
    const itemsContainer = containerGroup.querySelector(":scope > .xpm-embedded-items-container");
    if (!itemsContainer) return;

    const items = itemsContainer.querySelectorAll(":scope > .xpm-embedded-item");
    const maxOccursAttr = containerGroup.getAttribute("data-max-occurs");
    const maxOccurs = maxOccursAttr ? parseInt(maxOccursAttr, 10) : 1;

    items.forEach((item) => {
      const removeBtn = item.querySelector(":scope > .xpm-remove-embedded-btn") as HTMLElement | null;
      if (removeBtn) removeBtn.style.display = items.length > 1 ? "block" : "none";
    });

    const addBtn = containerGroup.querySelector(":scope > .xpm-add-embedded-btn, :scope > .xpm-add-item-btn") as HTMLButtonElement | null;
    if (addBtn && maxOccurs !== -1) {
      addBtn.style.display = items.length >= maxOccurs ? "none" : "inline-block";
    }
  }

  private bindClickHandlers(form: HTMLFormElement, binaryContainerData: Record<string, unknown>): void {
    form.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (this.handleRemoveItem(target)) return;
      if (this.handleAddEmbeddedField(target)) return;
      if (this.handleAddNonEmbeddedField(target)) return;
      this.handleBinaryUpload(target, binaryContainerData);
    });
  }

  private handleRemoveItem(target: HTMLElement): boolean {
    const removeBtn = target.closest<HTMLElement>(".xpm-remove-embedded-btn");
    if (!removeBtn) return false;

    const currentItem = removeBtn.closest(".xpm-embedded-item") as HTMLElement;
    const parentGroup = currentItem?.closest(".xpm-embedded-group");
    if (currentItem && parentGroup) {
      SchemaFormRenderer.destroyXhtmlEditors(currentItem);
      currentItem.remove();
      this.updateRemoveButtonsAndAddState(parentGroup);
    }
    return true;
  }

  private handleAddEmbeddedField(target: HTMLElement): boolean {
    const addEmbeddedBtn = target.closest<HTMLElement>(".xpm-add-embedded-btn");
    if (!addEmbeddedBtn) return false;

    const groupEl = addEmbeddedBtn.closest(".xpm-embedded-group");
    const containerEl = groupEl?.querySelector(":scope > .xpm-embedded-items-container");
    const rawSchema = containerEl?.getAttribute("data-embedded-schema");

    if (containerEl && rawSchema && groupEl) {
      const subSchema = safeJsonParse<Record<string, FieldDefinition>>(rawSchema, {});
      const newItemEl = document.createElement("div");
      newItemEl.className = "xpm-embedded-item";
      newItemEl.innerHTML = `<button type="button" class="xpm-btn xpm-btn-danger xpm-remove-embedded-btn">Remove</button>${SchemaFormRenderer.generateFormFromSchema(subSchema)}`;
      containerEl.appendChild(newItemEl);
      SchemaFormRenderer.initEditors(newItemEl);
      this.updateRemoveButtonsAndAddState(groupEl);
    }
    return true;
  }

  private handleAddNonEmbeddedField(target: HTMLElement): boolean {
    const addItemBtn = target.closest<HTMLElement>(".xpm-add-item-btn");
    if (!addItemBtn) return false;

    const groupEl = addItemBtn.closest(".xpm-embedded-group");
    const containerEl = groupEl?.querySelector(":scope > .xpm-embedded-items-container");
    const rawSchema = containerEl?.getAttribute("data-field-schema");

    if (containerEl && rawSchema && groupEl) {
      const fieldDef = safeJsonParse<FieldDefinition>(rawSchema, { $type: "SingleLineTextFieldDefinition" });
      const fieldName = groupEl.getAttribute("data-field-name") || "";
      const label = fieldDef.Description || fieldDef.Name || fieldName;
      const type = fieldDef.$type;

      const newItemEl = document.createElement("div");
      newItemEl.className = "xpm-embedded-item";
      const innerHtml = type === "MultimediaLinkFieldDefinition" ? `
        <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
          <label>${label}</label>
          <div class="xpm-binary-upload">
            <input type="file" accept=".jpg,.jpeg,.png" data-role="binary-file" />
            <input type="hidden" data-role="binary-link" />
            <button class="xpm-save-binary-btn" type="button"><svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" width="16" height="16"><path d="M14.125 13.5C14.125 13.8438 13.8438 14.125 13.5 14.125C13.1562 14.125 12.875 13.8438 12.875 13.5C12.875 13.1562 13.1562 12.875 13.5 12.875C13.8438 12.875 14.125 13.1562 14.125 13.5ZM11.5 12.875C11.1562 12.875 10.875 13.1562 10.875 13.5C10.875 13.8438 11.1562 14.125 11.5 14.125C11.8438 14.125 12.125 13.8438 12.125 13.5C12.125 13.1562 11.8438 12.875 11.5 12.875ZM16 11.375V14.625C16 15.3844 15.3844 16 14.625 16H1.375C0.615625 16 0 15.3844 0 14.625V11.375C0 10.6156 0.615625 10 1.375 10H5.25V6.89687H3.60313C2.49063 6.89687 1.93438 5.55 2.71875 4.7625L7.11562 0.365625C7.60313 -0.121875 8.39375 -0.121875 8.88437 0.365625L13.2812 4.7625C14.0688 5.55 13.5094 6.89687 12.3969 6.89687H10.75V10H14.625C15.3844 10 16 10.6156 16 11.375ZM6.25 5.89688V11.75C6.25 11.8875 6.3625 12 6.5 12H9.5C9.6375 12 9.75 11.8875 9.75 11.75V5.89688H12.3969C12.6188 5.89688 12.7313 5.62812 12.575 5.46875L8.17813 1.07187C8.08125 0.975 7.92188 0.975 7.825 1.07187L3.42813 5.46875C3.27188 5.625 3.38125 5.89688 3.60625 5.89688H6.25ZM15 11.375C15 11.1687 14.8313 11 14.625 11H10.75V11.75C10.75 12.4406 10.1906 13 9.5 13H6.5C5.80937 13 5.25 12.4406 5.25 11.75V11H1.375C1.16875 11 1 11.1687 1 11.375V14.625C1 14.8313 1.16875 15 1.375 15H14.625C14.8313 15 15 14.8313 15 14.625V11.375Z"></path></svg></button>
          </div>
        </div>`
        : `
        <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
          <label>${label}</label>
          <input type="text" data-role="value" />
        </div>`;

      newItemEl.innerHTML = `<button type="button" class="xpm-btn xpm-btn-danger xpm-remove-embedded-btn">Remove</button>${innerHtml}`;
      containerEl.appendChild(newItemEl);
      SchemaFormRenderer.initEditors(newItemEl);
      this.updateRemoveButtonsAndAddState(groupEl);
    }
    return true;
  }

  private handleBinaryUpload(target: HTMLElement, binaryContainerData: Record<string, unknown>): void {
    const saveBinaryBtn = target.closest<HTMLElement>(".xpm-save-binary-btn");
    if (!saveBinaryBtn) return;

    const fieldEl = saveBinaryBtn.closest(".xpm-field");
    const fileInput = fieldEl?.querySelector('[data-role="binary-file"]') as HTMLInputElement | null;
    const hiddenLinkInput = fieldEl?.querySelector('[data-role="binary-link"]') as HTMLInputElement | null;

    if (fileInput) {
      this.binaryUploader.upload(fileInput, saveBinaryBtn as HTMLButtonElement, binaryContainerData).then((linkData: SchemaLink | null) => {
        if (linkData && hiddenLinkInput) {
          hiddenLinkInput.value = JSON.stringify(linkData);
        }
      });
    }
  }

  private bindSubmitHandler(form: HTMLFormElement, schemaObj: Record<string, FieldDefinition>, metadataSchemaObj: Record<string, FieldDefinition>, componentContainerData: Record<string, unknown>, selectedRegion: string = ""): void {
    form.addEventListener("submit", async (e: SubmitEvent) => {
      e.preventDefault();
      TinymceEditor.triggerSave();
      if (!ValidationHelper.validateForm(form)) return;

      const submitBtn = form.querySelector<HTMLButtonElement>("button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving and Publishing..."
        Object.assign(submitBtn.style, {
          backgroundColor: "#d9d9d9",
          color: "#333",
          cursor: "not-allowed"
        })
      }
      try {
        const titleInput = form.querySelector<HTMLInputElement>("#xpm-component-name");
        const componentTitle = titleInput ? titleInput.value.trim() : "";

        if (!componentTitle) {
          FormStatusNotifier.show(form, "Component Title is required.", "error");
          if (submitBtn) submitBtn.disabled = false;
          submitBtn?.removeAttribute("style")
          return;
        }

        componentContainerData.Title = componentTitle;
        componentContainerData.Content = FormPayloadExtractor.extract(form, schemaObj);

        if (Object.keys(metadataSchemaObj).length > 0) {
          const metadataSection = form.querySelector('[data-section="metadata"]');
          const metadataTarget = metadataSection?.querySelector('.xpm-collapsible-body') || metadataSection || form;

          componentContainerData.Metadata = FormPayloadExtractor.extract(metadataTarget, metadataSchemaObj);
        }

        const checkinResponse = await this.api.postService<XpmItem>(`/items?autoCheckIn=true`, componentContainerData);
        if (checkinResponse) {
          const result = await this.updatePageComponentPresentation(checkinResponse, selectedRegion, componentTitle);
          if (!result) {
            FormStatusNotifier.show(form, "Failed to save item.", "error");
            return
          }

          await this.publishAndPollStatus(form, (result as XpmItem)?.BluePrintInfo?.OwningRepository?.IdRef as string, (result as XpmItem).Id);

        }
      } catch (err) {
        console.error("Failed to save component item:", err);
        FormStatusNotifier.show(form, err as any, "error");
      }
      finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Save and Publish"
          submitBtn.removeAttribute("style")
        }
      }
    });
  }

  private async publishAndPollStatus(form: HTMLFormElement, publicationId: string, pageId: string): Promise<void> {

    const pubId = formatTcmId(publicationId);

    const publicationTargetResponse = await this.api.getRequest<XpmItem>(`/items/${pubId}?useDynamicVersion=false`);
    const businessProcessTypeRef = publicationTargetResponse?.BusinessProcessType?.IdRef;

    if (!businessProcessTypeRef) {
      throw new Error("Missing BusinessProcessType reference.");
    }

    const businessProcessTypes = formatTcmId(businessProcessTypeRef);
    const publishableTargetTypes = await this.api.getRequest<XpmItem[]>(`/items/${businessProcessTypes}/publishableTargetTypes`);

    if (!publishableTargetTypes || publishableTargetTypes.length === 0) {
      throw new Error("No publishable target types available.");
    }

    const selectedPublishableTargetType = publishableTargetTypes[0].Id as string;
    const publishData = {
      Ids: [pageId],
      TargetIdsOrPurposes: [selectedPublishableTargetType],
      PublishInstruction: {
        ResolveInstruction: {
          IncludeChildPublications: false,
          IncludeComponentLinks: true,
          IncludeCurrentPublication: true,
          IncludeDynamicVersion: false,
          IncludeWorkflow: false,
          PublishInChildPublications: [],
          PublishNewContent: true
        }
      }
    };

    const publishResponse = await this.api.postService<XpmItem>(`/items/publish`, publishData);
    if (!publishResponse?.PublishTransactionIds?.[0]) {
      throw new Error("Failed to initialize publish transaction.");
    }

    const publishTransactionId = formatTcmId(publishResponse.PublishTransactionIds[0]);
    const isSuccess = await this.pollPublishingStatus(publishTransactionId);

    if (isSuccess) {
      FormStatusNotifier.show(form, "Item saved successfully and sent for publishing.", "success");
      setTimeout(() => this.modalService.close(), 1500);
      window.location.reload()
    } else {
      FormStatusNotifier.show(form, "Publishing timed out or failed. Check publishing queue.", "error");
    }
  }

  private async pollPublishingStatus(transactionId: string, maxRetries = 20, delayMs = 3000): Promise<boolean> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let retries = 0; retries < maxRetries; retries++) {
      const status = await this.api.getRequest<XpmItem>(`/items/${transactionId}?useDynamicVersion=false`);

      if (status?.IsCompleted) {
        return status.State === "Success";
      }

      if (status?.State === "Failed") {
        return false;
      }

      await delay(delayMs);
    }

    return false;
  }

  private async updatePageComponentPresentation(checkinResponse: XpmItem, selectedRegion: string, componentTitle: string): Promise<boolean | XpmItem> {
    const pageId = localStorage.getItem("pageTcmId");
    if (!pageId) return false;

    const formattedPageId = formatTcmId(pageId);
    const checkoutResponse = await this.api.postService<XpmItem>(`/items/${formattedPageId}/checkOut`, {});
    if (!checkoutResponse) return false;

    const pageData = { ...checkoutResponse };
    const publicationId = pageData.BluePrintInfo?.OwningRepository?.IdRef?.split("-")[1];
    const regions = Array.isArray(pageData.Regions) ? (pageData.Regions as Record<string, unknown>[]) : [];

    const newComponentPresentation = {
      $type: "ComponentPresentation",
      Component: {
        $type: "Link",
        IdRef: `tcm:${publicationId}-${checkinResponse.Id?.split("-")[1]}`,
        Title: checkinResponse.Title || componentTitle
      },
      ComponentTemplate: this.extractComponentTemplate(regions, selectedRegion),
      Conditions: []
    };

    const isUpdated = this.findRegionRecursive(regions, selectedRegion, newComponentPresentation);

    if (isUpdated) {
      pageData.Regions = regions;
      const checkinId = formatTcmId(checkoutResponse.Id);
      const updatedPageResponse = await this.api.putService<XpmItem>(`/items/${checkinId}`, pageData);
      if (updatedPageResponse) {
        const result = await this.api.postService<XpmItem>(`/items/${checkinId}/checkIn`, { RemovePermanentLock: true });
        return result;
      }
    }
    return false;
  }

  private findRegionRecursive(pageRegions: Record<string, unknown>[], selectedRegion: string, newComponentPresentation: Record<string, unknown>): boolean {
    if (!Array.isArray(pageRegions) || pageRegions.length === 0) return false;

    for (const region of pageRegions) {
      const regionName = (region.RegionName || region.name || region.Name || region.Title || "") as string;
      if (selectedRegion && regionName === selectedRegion) {
        if (!Array.isArray(region.ComponentPresentations)) region.ComponentPresentations = [];
        (region.ComponentPresentations as Record<string, unknown>[]).push(newComponentPresentation);
        return true;
      }

      const nestedRegions = region.Regions as Record<string, unknown>[] | undefined;
      if (Array.isArray(nestedRegions) && nestedRegions.length > 0) {
        const found = this.findRegionRecursive(nestedRegions, selectedRegion, newComponentPresentation);
        if (found) return true;
      }
    }

    if (!selectedRegion && pageRegions.length > 0) {
      const firstRegion = pageRegions[0];
      if (!Array.isArray(firstRegion.ComponentPresentations)) firstRegion.ComponentPresentations = [];
      (firstRegion.ComponentPresentations as Record<string, unknown>[]).push(newComponentPresentation);
      return true;
    }

    return false;
  }

  private extractComponentTemplate(pageRegions: Record<string, unknown>[], selectedRegion: string): Record<string, unknown> | null {
    if (!Array.isArray(pageRegions) || !selectedRegion) {
      return null;
    }

    for (const region of pageRegions) {
      const regionName = region.RegionName as string;

      if (regionName === selectedRegion) {
        const presentations = region.ComponentPresentations;
        if (Array.isArray(presentations)) {
          for (const cp of presentations as Record<string, unknown>[]) {
            if (cp?.ComponentTemplate && typeof cp.ComponentTemplate === "object") {
              return cp.ComponentTemplate as Record<string, unknown>;
            }
          }
        }
        return null;
      }

      const nestedRegions = region.Regions as Record<string, unknown>[] | undefined;
      if (Array.isArray(nestedRegions) && nestedRegions.length > 0) {
        const found = this.extractComponentTemplate(nestedRegions, selectedRegion);
        if (found) return found;
      }
    }
    return null;
  }
}


