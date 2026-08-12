import { ApiClient } from "./ApiClient";
import { ConfigService } from "./ConfigService";
import type { FieldDefinition, SchemaLink, TaxonomyNode, TaxonomyResponse, XpmItem } from "../types/xpm";
import { formatTcmId } from "../utils/utils";

export interface ComponentFieldsResult {
  schemaDetails: XpmItem;
  owningComponentData: XpmItem;
}

export interface ComponentContextResult {
  binaryContainerData: XpmItem;
  componentContainerData: XpmItem;
}

export class ComponentContextResolver {
  private api: ApiClient;
  private configService: ConfigService;

  constructor(api: ApiClient, configService?: ConfigService) {
    this.api = api;
    this.configService = configService || ConfigService.getInstance();
  }

  public async getComponentFields(compId: string): Promise<ComponentFieldsResult> {

    const formattedCompId = formatTcmId(compId);
    const componentData = await this.api.getRequest<XpmItem>(`/items/${formattedCompId}?useDynamicVersion=true`);

    const parentId = componentData.BluePrintInfo?.PrimaryBluePrintParentItem?.IdRef;
    if (!parentId) {
      throw new Error(`Primary blueprint parent item missing for component [${compId}]`);
    }

    const owningPublicationId = formatTcmId(parentId);
    const owningComponentData = await this.api.getRequest<XpmItem>(`/items/${owningPublicationId}?useDynamicVersion=true`);

    const schemaIdRef = owningComponentData.Schema?.IdRef;
    if (!schemaIdRef) {
      throw new Error(`Schema reference missing for owning component [${owningPublicationId}]`);
    }

    const schemaId = formatTcmId(schemaIdRef);
    const schemaDetails = await this.api.getRequest<XpmItem>(`/items/${schemaId}?useDynamicVersion=true`);

    return { schemaDetails, owningComponentData };
  }

  public async fetchComponentContext(componentData: XpmItem, schemaDetails?: XpmItem): Promise<ComponentContextResult> {

    const owningRepositoryId = formatTcmId(componentData.BluePrintInfo?.OwningRepository?.IdRef);
    const primaryParentId = formatTcmId(componentData.BluePrintInfo?.PrimaryBluePrintParentItem?.IdRef);

    const owningRepoComponent = await this.api.getRequest<XpmItem>(`/items/${primaryParentId}?useDynamicVersion=true`);

    const componentLocationInfo = formatTcmId(owningRepoComponent.LocationInfo?.OrganizationalItem?.IdRef);

    const existingMediaTcmId = formatTcmId(this.getExistingMediaId((owningRepoComponent.Content as Record<string, unknown>) || {})[0]);

    let mediaFolderLocationId = "";
    if (existingMediaTcmId) {
      const binaryComponentData = await this.api.getRequest<XpmItem>(`/items/${existingMediaTcmId}?useDynamicVersion=true`);
      mediaFolderLocationId = formatTcmId(binaryComponentData.LocationInfo?.OrganizationalItem?.IdRef);
    } else {
      const publicationId = componentData.BluePrintInfo?.OwningRepository?.IdRef?.match(/:(\d+)-(\d+)-(\d+)/)?.[2];
      const defaultFolderId = this.configService.defaultBinaryFolderId;
      mediaFolderLocationId = `tcm_${publicationId}-${defaultFolderId}-2`;
    }

    const [binaryContainerData, multimediaSchemaList, componentContainerData] = await Promise.all([
      this.api.getRequest<XpmItem>(`/item/defaultModel/Component?containerId=${mediaFolderLocationId}`),
      this.api.getRequest<SchemaLink[]>(`/items/${owningRepositoryId}/schemaLinks?schemaPurpose=Multimedia`),
      this.api.getRequest<XpmItem>(`/item/defaultModel/Component?containerId=${componentLocationInfo}`)
    ]);

    const schemaFields = (schemaDetails?.Fields || schemaDetails || {}) as Record<string, FieldDefinition>;
    const allowedSchemaLink = this.extractAllowedTargetSchemaLink(schemaFields);

    if (!binaryContainerData.Schema) {
      binaryContainerData.Schema = { $type: "Link", IdRef: "", Title: "" };
    }

    if (allowedSchemaLink?.IdRef) {
      binaryContainerData.Schema.IdRef = allowedSchemaLink.IdRef;
      binaryContainerData.Schema.Title = allowedSchemaLink.Title;
    } else if (Array.isArray(multimediaSchemaList) && multimediaSchemaList.length > 0) {
      const imageSchema = multimediaSchemaList.find((schema: SchemaLink) => schema.Title === "Image") || multimediaSchemaList[0];
      if (imageSchema) {
        binaryContainerData.Schema.IdRef = imageSchema.IdRef;
        binaryContainerData.Schema.Title = imageSchema.Title;
      }
    }

    return { binaryContainerData, componentContainerData };
  }

  private extractAllowedTargetSchemaLink(schemaObj: Record<string, FieldDefinition>): SchemaLink | null {

    for (const [key, fieldDef] of Object.entries(schemaObj)) {
      if (key.startsWith("$") || !fieldDef || typeof fieldDef !== "object") continue;

      if (fieldDef.$type === "MultimediaLinkFieldDefinition") {
        const targetSchemas: SchemaLink[] = fieldDef.AllowedTargetSchemas || [];
        if (targetSchemas.length > 0 && targetSchemas[0].IdRef) {
          return {
            $type: "Link",
            IdRef: targetSchemas[0].IdRef,
            Title: targetSchemas[0].Title || "Multimedia Schema"
          };
        }
      } else if (fieldDef.$type === "EmbeddedSchemaFieldDefinition" && fieldDef.EmbeddedFields) {
        const nested = this.extractAllowedTargetSchemaLink(fieldDef.EmbeddedFields);
        if (nested) return nested;
      }
    }
    return null;
  }

  private getExistingMediaId(content: Record<string, unknown>, media: string[] = []): string[] {

    if (!content || typeof content !== "object") return media;
    if (content.IdRef && typeof content.IdRef === "string") {
      media.push(content.IdRef);
    }

    for (const key of Object.keys(content)) {
      const val = content[key];
      if (typeof val === "object" && val !== null) {
        this.getExistingMediaId(val as Record<string, unknown>, media);
      }
    }
    return media;
  }

  public async getCategoryKeywords(categoryIdRef: string): Promise<Array<{ IdRef: string; Title: string }>> {
    if (!categoryIdRef) return [];
    const formattedId = formatTcmId(categoryIdRef);
    try {
      const response = await this.api.getRequest<TaxonomyResponse>(`/items/${formattedId}/taxonomy?includeAlternativeLabels=false`);
      if (response?.ChildNodes) {
        return response.ChildNodes.map((item: TaxonomyNode) => ({
          IdRef: item.Id,
          Title: item.Title
        }));
      }
      return [];
    } catch (err) {
      console.warn(`Failed to load keywords for Category ${categoryIdRef}:`, err);
      return [];
    }
  }
}
