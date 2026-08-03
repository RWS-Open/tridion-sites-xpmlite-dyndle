import { ApiClient } from "./apiClient";
import { ModalService } from "./modal";
import { ValidationHelper } from "./validationHelper";

interface SchemaLink {
    $type: string;
    IdRef: string;
    Title: string;
}

interface TridionItemRef {
    $type: string;
    IdRef: string;
    Title: string;
}

interface ComponentDataResponse {
    Id: string;
    BluePrintInfo: {
        OwningRepository: TridionItemRef;
        PrimaryBluePrintParentItem: TridionItemRef;
    };
    LocationInfo?: {
        OrganizationalItem: TridionItemRef;
    };
    Content: Record<string, any>
}

export class ComponentService {
    private modalService: ModalService;
    private api: ApiClient;
    private config: any

    constructor(apiInstance: ApiClient,) {
        this.config = typeof getConfig === "function" ? getConfig() : {};
        this.modalService = ModalService.getInstance();
        this.api = apiInstance;
    }

    private formatTcmId(tcmId: string): string {
        return tcmId ? tcmId.replace(/:/g, "_") : "";
    }

    private injectComponentStyles(): void {
        if (document.getElementById("xpm-component-add-style")) return;

        const style = document.createElement("style");
        style.id = "xpm-component-add-style";
        style.textContent = `
            .xpm-component-add-item {
                position: absolute !important;
                top: 0 !important;
                right: 0 !important;
                width: 28px;
                height: 28px;
                display: none;
                align-items: center;
                justify-content: center;
                background: #007373;
                color: #fff;
                border-radius: 4px;
                z-index: 2147483647 !important;
                cursor: pointer;
                box-sizing: border-box;
                border: none;
                padding: 0;
                margin:0 30px;
            }

            [data-component-id]:hover > .xpm-component-add-item {
                display: flex;
            }

            .xpm-component-add-item:hover {
                background: #005959;
            }
                .xpm-field { margin-bottom: 12px; }
                .xpm-field label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; padding-left: 0; }
                .xpm-field input, .xpm-field textarea { 
                    width: 100%; 
                    padding: 8px; 
                    box-sizing: border-box; 
                    border: 1px solid #ccc; 
                    border-radius: 4px; 
                }
                .xpm-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
                .xpm-btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; }
                .xpm-btn-primary { background: #007373; color: white; }
                .xpm-btn-secondary { background: #e0e0e0; color: #333; }
                .xpm-binary-upload { display: flex; align-items: center; position: relative;flex-direction: column; }
                .xpm-save-binary-btn {
                    position: absolute;
                    right: 0;
                    background: none;
                    border: none;
                    border-left: 1px solid #dee2e6;
                    padding: 12px;
                    cursor: pointer;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                }
                .xpm-save-binary-btn:hover { background: #007373; color: #fff; }
            `;
        document.head.appendChild(style);
    }

    private async getComponentFields(compId: string) {
        const formattedCompId = this.formatTcmId(compId);
        const componentData = await this.api.getRequest(`/items/${formattedCompId}?useDynamicVersion=true`);

        const schemaId = this.formatTcmId(componentData.Schema.IdRef);
        const schemaDetails = await this.api.getRequest(`/items/${schemaId}?useDynamicVersion=true`);

        return { schemaDetails, componentData };

    }

    private async openAddComponentModal(compId: string, triggerBtn?: HTMLButtonElement): Promise<void> {
        try {
            const responseData = await this.getComponentFields(compId);
            const { componentData, schemaDetails } = responseData;

            const { containerData, owningRepoComponent } = await this.fetchComponentContext(componentData);
            const fieldsHtml = await this.generateFieldsHtml(schemaDetails);
            const form = this.createModalForm(compId, fieldsHtml);

            this.bindFormEvents(form, containerData, owningRepoComponent);

            this.modalService.open({
                title: "Add Item to Component",
                body: form,
                closeOnOverlayClick: false,
                onClose: () => {
                    if (triggerBtn) {
                        triggerBtn.classList.remove("modal-loading")
                        triggerBtn.disabled = false;
                        triggerBtn.innerHTML = `
                        <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" width="16" height="16">
                            <path d="M9.16669 6.83331V1H6.8333v5.83331H1V9.1667h5.83331V15H9.1667V9.16669H15V6.8333z"></path>
                        </svg>`;
                    }

                    const submitBtn = form.querySelector<HTMLButtonElement>("button[type='submit']");
                    if (submitBtn) submitBtn.disabled = false;

                    const binaryButtons = form.querySelectorAll<HTMLButtonElement>(".xpm-save-binary-btn");
                    binaryButtons.forEach(btn => (btn.disabled = false));
                }
            });
        } catch (error) {
            console.error("Failed to load component modal:", error);
            if (triggerBtn) triggerBtn.disabled = false;
        }
    }

    private async fetchComponentContext(componentData: Record<string, any>) {
        const owningRepositoryId = this.formatTcmId(componentData.BluePrintInfo.OwningRepository.IdRef);
        const primaryParentId = this.formatTcmId(componentData.BluePrintInfo.PrimaryBluePrintParentItem.IdRef);

        const owningRepoComponent: ComponentDataResponse = await this.api.getRequest(`/items/${primaryParentId}?useDynamicVersion=true`);

        // const folderLocationId = this.formatTcmId(owningRepoComponent.LocationInfo?.OrganizationalItem?.IdRef || "");
        const exsitingMediaTcmId = this.formatTcmId(this.getExistingMediaId(owningRepoComponent.Content)[0])
        let mediaFolderLocationId = ""
        if (exsitingMediaTcmId) {
            const binaryComponentData = await this.api.getRequest(`/items/${exsitingMediaTcmId}?useDynamicVersion=true`);
            mediaFolderLocationId = this.formatTcmId(binaryComponentData.LocationInfo.OrganizationalItem.IdRef)
        } else {
            const publicationId = componentData.BluePrintInfo.OwningRepository.IdRef?.match(/:(\d+)-(\d+)-(\d+)/)[2];
            mediaFolderLocationId = `tcm_${publicationId}-${this.config.default_binary_folderId}-2`;
        }

        const [containerData, multimediaSchemaList] = await Promise.all([
            this.api.getRequest(`/item/defaultModel/Component?containerId=${mediaFolderLocationId}`),
            this.api.getRequest(`/items/${owningRepositoryId}/schemaLinks?schemaPurpose=Multimedia`)
        ]);

        const imageSchema = multimediaSchemaList.find((schema: SchemaLink) => schema.Title === "Image");
        if (imageSchema) {
            containerData.Schema.IdRef = imageSchema.IdRef;
            containerData.Schema.Title = imageSchema.Title;
        } else {
            console.warn("Multimedia Image Schema not found in target repository.");
        }

        return { containerData, owningRepoComponent };
    }

    private getExistingMediaId(content: Record<string, any>, media: string[] = []) {
        if (!content || typeof content !== 'object') return media;

        if (content.IdRef) {
            media.push(content.IdRef as string);
        }

        for (const key of Object.keys(content)) {
            if (typeof content[key] === 'object' && content[key] !== null) {
                this.getExistingMediaId(content[key], media);
            }
        }

        return media
    }

    private async generateFieldsHtml(schemaDetails: Record<string, any>): Promise<string> {
        const embeddedFields = Object.entries(schemaDetails.Fields || {})
            .filter(([fieldKey, field]: [string, any]) => {
                if (fieldKey.toLowerCase() === "link" || field?.Name?.toLowerCase() === "link") {
                    return false;
                }
                return (
                    field.$type === "EmbeddedSchemaFieldDefinition" ||
                    field.$type === "ComponentLinkFieldDefinition"
                );
            })
            .map(([_, field]) => field);

        const htmlSegments = await Promise.all(
            embeddedFields.map(async (field: any) => {
                if (field.$type === "ComponentLinkFieldDefinition") {
                    const targetSchemas = field.AllowedTargetSchemas || [];

                    const nestedHtmls = await Promise.all(
                        targetSchemas.map(async (allowedSchema: Record<string, any>) => {
                            const allowedSchemaId = this.formatTcmId(allowedSchema.IdRef);
                            const nestedSchemaFields = await this.api.getRequest(
                                `/items/${allowedSchemaId}?useDynamicVersion=true`
                            );
                            return await this.generateFieldsHtml(nestedSchemaFields);
                        })
                    );

                    return nestedHtmls.join("");
                }

                return Object.entries(field.EmbeddedFields || {})
                    .filter(([fieldKey, embeddedField]: [string, any]) => {
                        if (fieldKey === "$type") return false;

                        if (fieldKey.toLowerCase() === "link") return false;
                        if (embeddedField.$type === "ComponentLinkFieldDefinition") return false;

                        return true;
                    })
                    .map(([_, embeddedField]: [string, any]) => this.renderSingleField(embeddedField))
                    .join("");
            })
        );

        return htmlSegments.join("");
    }

    private renderSingleField(field: Record<string, any>): string {
        const fieldName = field.Name;
        const fieldLabel = field.Description || fieldName;
        const fieldHeight = field.Height ?? 0;

        const isRequired = typeof field.MinOccurs === "number" ? field.MinOccurs > 0 : false;
        const requiredAttr = isRequired ? 'data-required="true"' : '';
        const labelAsterisk = isRequired ? ' <span style="color: #d9534f; font-weight: bold;">*</span>' : '';

        if (field.$type === "MultimediaLinkFieldDefinition") {
            return `
            <div class="xpm-field">
                <label for="xpm-${fieldName}">${fieldLabel}${labelAsterisk}</label>
                <div class="xpm-binary-upload">
                    <input type="file" id="xpm-${fieldName}" name="${fieldName}" accept=".jpg,.jpeg,.png" data-binary-field="${fieldName}" ${requiredAttr}/>
                    <button class="xpm-save-binary-btn" data-target-field="${fieldName}" type="button" title="Upload Binary">
                        <svg version="1.1" fill="currentColor" viewBox="0 0 16 16" width="16" height="16">
                            <path d="M15.498 3.498L12.502.502A1.714 1.714 0 0 0 11.29 0H1.714C.767 0 0 .767 0 1.714v12.572C0 15.233.767 16 1.714 16h12.572c.947 0 1.714-.768 1.714-1.714V4.71c0-.455-.18-.89-.502-1.212zm-5.212-2.355V4.57H3.429V1.143h6.857zm4.571 13.143a.572.572 0 0 1-.571.571H1.714a.572.572 0 0 1-.571-.571V1.714c0-.315.256-.571.571-.571h.572v3.714c0 .474.383.857.857.857h7.428a.857.857 0 0 0 .858-.857V1.16c.1.025.192.077.265.15l2.996 2.996a.568.568 0 0 1 .167.404v9.576zM8 7.143a3.146 3.146 0 0 0-3.143 3.143A3.146 3.146 0 0 0 8 13.429a3.146 3.146 0 0 0 3.143-3.143A3.146 3.146 0 0 0 8 7.143zm0 5.143c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"></path>
                        </svg>
                    </button>
                </div>
            </div>`;
        }

        const inputControl = fieldHeight >= 1
            ? `<textarea id="xpm-${fieldName}" name="${fieldName}" rows="${fieldHeight}" placeholder="Enter ${fieldName}" ${requiredAttr}></textarea>`
            : `<input type="text" id="xpm-${fieldName}" name="${fieldName}" placeholder="Enter ${fieldName}" ${requiredAttr} />`;

        return `
        <div class="xpm-field">
            <label for="xpm-${fieldName}">${fieldLabel} ${labelAsterisk}</label>
            ${inputControl}
        </div>`;
    }

    private createModalForm(compId: string, fieldsHtml: string): HTMLFormElement {
        const form = document.createElement("form");
        form.innerHTML = `
        <input type="hidden" name="componentId" value="${compId}" />
        ${fieldsHtml}
        <div class="xpm-actions">
            <button type="button" class="xpm-btn xpm-btn-secondary" id="xpm-cancel-btn">Cancel</button>
            <button type="submit" class="xpm-btn xpm-btn-primary">Save Item</button>
        </div>`;
        return form;
    }

    private bindFormEvents(form: HTMLFormElement, containerData: Record<string, any>, owningRepoComponent: ComponentDataResponse): void {
        let uploadedBinaryItem: SchemaLink | null = null;

        form.addEventListener("click", (e: MouseEvent) => e.stopPropagation());

        form.addEventListener("input", (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
                ValidationHelper.clearError(target);
            }
        });

        // Binary upload
        const binaryButtons = form.querySelectorAll<HTMLButtonElement>(".xpm-save-binary-btn");

        binaryButtons.forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const fieldName = btn.dataset.targetField;
                if (!fieldName) return;

                const fileInput = form.querySelector<HTMLInputElement>(`#xpm-${fieldName}`);
                if (fileInput) {
                    btn.disabled = true;
                    try {
                        uploadedBinaryItem = await this.uploadMultimedia(fileInput, btn, containerData);
                    } finally {
                        btn.disabled = false
                    }
                }
            });
        });

        // Submit listener
        const submitBtn = form.querySelector<HTMLButtonElement>("button[type='submit']");

        form.addEventListener("submit", async (e: SubmitEvent) => {
            e.preventDefault();

            if (!ValidationHelper.validateForm(form)) {
                return;
            }

            if (submitBtn) submitBtn.disabled = true;

            const formData = new FormData(form);
            const formValues = Object.fromEntries(formData);
            try {

                await this.saveComponentItem(formValues, owningRepoComponent.Id, uploadedBinaryItem);
                this.showFormStatusMessage(form, "Item saved successfully!", "success");

                setTimeout(() => {
                    this.modalService.close();
                }, 1500);

            } catch (err) {
                console.error("Failed to save component item:", err);
                if (submitBtn) submitBtn.disabled = false;
                this.showFormStatusMessage(form, "An error occurred while saving. Please try again.", "error");
            }
        });

        // Cancel listener
        form.querySelector("#xpm-cancel-btn")?.addEventListener("click", () => {
            this.modalService.close();
        });
    }

    private showFormStatusMessage(form: HTMLFormElement, message: string, type: "success" | "error"): void {
        let statusDiv = form.querySelector<HTMLElement>(".xpm-status-message");

        if (!statusDiv) {
            statusDiv = document.createElement("div");
            statusDiv.className = "xpm-status-message";
            statusDiv.style.marginBottom = "12px";
            statusDiv.style.padding = "8px 12px";
            statusDiv.style.borderRadius = "4px";
            statusDiv.style.fontWeight = "bold";
            statusDiv.style.fontSize = "14px";

            const actionsDiv = form.querySelector(".xpm-actions");
            if (actionsDiv) {
                form.insertBefore(statusDiv, actionsDiv);
            } else {
                form.appendChild(statusDiv);
            }
        }

        if (type === "success") {
            statusDiv.style.backgroundColor = "#d4edda";
            statusDiv.style.color = "#155724";
            statusDiv.style.border = "1px solid #c3e6cb";
        } else {
            statusDiv.style.backgroundColor = "#f8d7da";
            statusDiv.style.color = "#721c24";
            statusDiv.style.border = "1px solid #f5c6cb";
        }

        statusDiv.innerText = message;
    }

    private async uploadMultimedia(fileInput: HTMLInputElement, uploadBtn: HTMLButtonElement, containerData: Record<string, any>): Promise<SchemaLink | any> {
        const file = fileInput.files?.[0];

        if (!ValidationHelper.validate(fileInput, !!file, "Please upload a valid image file (JPEG or PNG).")) {
            return null
        }
        if (!file || !ValidationHelper.validate(fileInput, ["image/jpeg", "image/png"].includes(file.type), "Only JPEG and PNG image files are allowed.")) {
            fileInput.value = "";
            return null;
        }
        try {
            uploadBtn.disabled = true;

            const payload = new FormData();
            payload.append("file", file);

            const binaryResponse = await this.api.postService(`/binary/upload`, payload);

            const payloadContainer = JSON.parse(JSON.stringify(containerData));
            payloadContainer.Title = file.name;
            payloadContainer.BinaryContent = {
                IsExternal: false,
                ExternalBinaryUri: "",
                UploadFromFile: binaryResponse.TempFileId,
                MultimediaType: {
                    $type: "Link",
                    IdRef: binaryResponse.MultimediaType.IdRef,
                    Title: binaryResponse.MultimediaType.Title
                },
                MimeType: file.type || binaryResponse.MimeType || "application/octet-stream",
                Filename: binaryResponse.FileName,
                Size: file.size
            }

            const createBinaryComponentResponse = await this.api.postService('/items?autoCheckIn=true', payloadContainer)
            if (createBinaryComponentResponse?.status === 201 || createBinaryComponentResponse?.Id) {
                const message = `Binary component saved successfully with ID:<strong> ${createBinaryComponentResponse.Id}</strong> and title: <strong>${createBinaryComponentResponse.Title}.</strong>`

                this.binaryUploadStatus(message, uploadBtn, "success")
                return {
                    $type: "Link",
                    IdRef: createBinaryComponentResponse.Id,
                    Title: createBinaryComponentResponse.Title,
                };
            }
            const errorMessage = createBinaryComponentResponse?.Message || "Failed to create binary component.";
            this.binaryUploadStatus(errorMessage, uploadBtn, "error")
            return null;

        } catch (error: any) {
            console.error("Binary component creation failed:", error);
            const errorMessage = error?.message || "An unexpected error occurred during upload.";
            this.binaryUploadStatus(errorMessage, uploadBtn, "error");
            return null;
        } finally {
            uploadBtn.disabled = false;
        }
    }

    private binaryUploadStatus(message: string | any, uploadBtn: HTMLButtonElement, status: "success" | "error") {

        const parent = uploadBtn.parentElement;
        if (!parent) return;

        const existingStatus = parent.querySelector(".media-upload-status");
        if (existingStatus) {
            existingStatus.remove();
        }

        uploadBtn.style.color = status === "success" ? "#007373" : "#dc3545";
        const span = document.createElement('span')
        span.className = "media-upload-status"
        span.innerHTML = message;

        Object.assign(span.style, {
            color: status === "success" ? "#007373" : "#dc3545",
            fontSize: "12px",
            marginLeft: "8px",
            display: "inline-block"
        })
        parent.appendChild(span);
    }

    private async saveComponentItem(data: Record<string, any>, componentId: string, binaryItemLink: SchemaLink | null): Promise<void> {
        const owningComponentId = this.formatTcmId(componentId);

        const checkoutResponse = await this.api.postService(`/items/${owningComponentId}/checkOut`, {});

        const buildItem: Record<string, any> = {
            $type: "FieldsValueDictionary"
        };

        Object.entries(data).forEach(([key, value]) => {
            if (key === "componentId") return;
            buildItem[key] = value !== "" ? value : null;
        });

        if (binaryItemLink) {
            const binaryFieldKey =
                Object.keys(data).find(k => k.toLowerCase().includes("media") || k.toLowerCase().includes("image")) || "media";

            buildItem[binaryFieldKey] = {
                $type: "Link",
                IdRef: binaryItemLink.IdRef,
                Title: binaryItemLink.Title
            };
        }

        const contentObj = checkoutResponse.Content;

        const targetArrayKey = Object.keys(contentObj).find(key => Array.isArray(contentObj[key]));

        if (!targetArrayKey) {
            throw new Error("Could not find a valid list array inside checkoutResponse.Content");
        }

        contentObj[targetArrayKey].push(buildItem);

        const checkedOutId = this.formatTcmId(checkoutResponse.Id);
        const updateComponent = await this.api.putService(`/items/${checkedOutId}`, checkoutResponse);

        const updatedComponentId = this.formatTcmId(updateComponent.Id);
        const checkInResponse = await this.api.postService(`/items/${updatedComponentId}/checkIn`, {
            "RemovePermanentLock": true
        })
        console.log("Component successfully updated and checked in:", checkInResponse);
    }

    private addComponentUpdateLink(): void {
        this.injectComponentStyles();

        const componentLinks = document.querySelectorAll<HTMLElement>("[data-component-id]");

        componentLinks.forEach(item => {
            if (item.querySelector(".xpm-component-add-item")) return;

            const compId = item.dataset.componentId;
            if (!compId) return;

            if (getComputedStyle(item).position === "static") {
                item.style.position = "relative";
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "xpm-component-add-item";
            button.title = `Add item to ${compId}`;

            button.innerHTML = `
                <svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" width="16" height="16">
                    <path d="M9.16669 6.83331V1H6.8333v5.83331H1V9.1667h5.83331V15H9.1667V9.16669H15V6.8333z"></path>
                </svg>`;

            button.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.disabled = true;
                button.innerHTML = "Loading...";
                button.classList.add("modal-loading")
                this.openAddComponentModal(compId, button);
            });

            item.appendChild(button);
        });
    }

    public renderComponent(): void {
        this.addComponentUpdateLink();
    }
}