import { ApiClient } from "./ApiClient";
import { ModalService } from "../ui/Modal";
import { SchemaFormRenderer } from "../ui/SchemaFormRenderer";
import { BinaryUploadManager } from "./BinaryUploadManager";
import { ComponentContextResolver } from "./ComponentContextResolver";
import { FormEventManager } from "../ui/FormEventManager";
import type { FieldDefinition } from "../types/xpm";

export class ComponentService {
	private modalService: ModalService;
	private api: ApiClient;
	private resolver: ComponentContextResolver;
	private eventManager: FormEventManager;

	constructor(apiInstance: ApiClient) {
		this.api = apiInstance;
		this.modalService = ModalService.getInstance();

		this.resolver = new ComponentContextResolver(this.api);
		const binaryUploader = new BinaryUploadManager(this.api);
		this.eventManager = new FormEventManager(
			this.api,
			this.modalService,
			binaryUploader,
			this.resolver
		);
	}

	public renderComponent(): void {
		this.addComponentUpdateLink();
	}

	private addComponentUpdateLink(): void {
		const regions = document.querySelectorAll<HTMLElement>("[data-region]");

		regions.forEach((item) => {
			if (item.querySelector(".xpm-component-add-item")) return;
			const component = item.querySelectorAll<HTMLElement>(
				"[data-component-id]"
			)[0];
			if (!component) return;

			const compId = component.dataset.componentId || "";
			const selectedRegion = item.getAttribute("data-region") || "";
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
				button.classList.add("modal-loading");
				void this.openAddComponentModal(compId, button, selectedRegion);
			});

			item.appendChild(button);
		});
	}

	private resetTriggerButton(triggerBtn?: HTMLButtonElement): void {
		if (!triggerBtn) return;
		triggerBtn.classList.remove("modal-loading");
		triggerBtn.disabled = false;
		triggerBtn.innerHTML = `
		<svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" width="16" height="16">
			<path d="M9.16669 6.83331V1H6.8333v5.83331H1V9.1667h5.83331V15H9.1667V9.16669H15V6.8333z"></path>
		</svg>`;
	}

	private async openAddComponentModal(compId: string, triggerBtn?: HTMLButtonElement, selectedRegion: string = ""): Promise<void> {
		try {
			const { owningComponentData, schemaDetails } = await this.resolver.getComponentFields(compId);
			const schemaFields = (schemaDetails.Fields || {}) as Record<string, FieldDefinition>;
			const metadataSchemaFields = (schemaDetails.MetadataFields || {}) as Record<string, FieldDefinition>;

			const { binaryContainerData, componentContainerData } = await this.resolver.fetchComponentContext(owningComponentData, schemaDetails);

			if (schemaDetails.Id) {
				componentContainerData.Schema = { $type: "Link", IdRef: schemaDetails.Id, Title: schemaDetails.Title || schemaDetails.Name || "" };
			} else if (owningComponentData.Schema) {
				componentContainerData.Schema = { $type: "Link", IdRef: owningComponentData.Schema.IdRef, Title: owningComponentData.Schema.Title || "" };
			}

			let fieldsHtml = SchemaFormRenderer.generateFormFromSchema(schemaFields);

			if (Object.keys(metadataSchemaFields).length > 0) {
				fieldsHtml += `
					<details class="xpm-collapsible-section" data-section="metadata">
						<summary class="xpm-collapsible-header">
							<span class="xpm-collapsible-title">Metadata</span>
							<svg class="xpm-collapsible-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
								<path d="M2 4l4 4 4-4"/>
							</svg>
						</summary>
						<div class="xpm-collapsible-body">
							${SchemaFormRenderer.generateFormFromSchema(metadataSchemaFields)}
						</div>
					</details>`;
			}

			const form = SchemaFormRenderer.createModalForm(compId, fieldsHtml);
			
			this.eventManager.bind(form, schemaFields, metadataSchemaFields, binaryContainerData as Record<string, unknown>, componentContainerData as Record<string, unknown>, selectedRegion);

			this.modalService.open({
				title: "Add New Component",
				body: form,
				closeOnOverlayClick: false,
				onClose: () => {
					SchemaFormRenderer.destroyXhtmlEditors(form);
					this.resetTriggerButton(triggerBtn);
				}
			});
			SchemaFormRenderer.initEditors(form);
		} catch (error) {
			console.error("Failed to load component modal:", error);
			this.resetTriggerButton(triggerBtn);
		}
	}
}
