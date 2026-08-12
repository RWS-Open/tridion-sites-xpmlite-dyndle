import { ApiClient } from "./ApiClient";
import type { FieldDefinition, LockInfo, XpmItem } from "../types/xpm";
import { findFieldValue, formatTcmId } from "../utils/utils";

export interface SchemaAndValueResult {
  schemaId: string;
  rawContent: string;
  lockInfo?: LockInfo | null;
}

export class XpmApiService {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async getTargetPublicationId(componentId: string): Promise<string> {
    const formattedId = formatTcmId(componentId);
    const response = await this.api.getRequest<XpmItem>(`/items/${formattedId}?useDynamicVersion=true`);
    return response?.BluePrintInfo?.IsShared && response.BluePrintInfo.PrimaryBluePrintParentItem?.IdRef
      ? response.BluePrintInfo.PrimaryBluePrintParentItem.IdRef
      : componentId;
  }

  async fetchSchemaIdAndValue(componentId: string, fieldName: string, fieldIndex: number): Promise<SchemaAndValueResult | null> {
    const formattedId = formatTcmId(componentId);
    const response = await this.api.getRequest<XpmItem>(`/items/${formattedId}?useDynamicVersion=true`);
    if (!response?.Schema?.IdRef) return null;

    const schemaId = formatTcmId(response.Schema.IdRef);
    const fieldsData = (response.Content || response.Fields || response) as Record<string, unknown>;
    const rawContent = findFieldValue<string>(fieldsData, fieldName, fieldIndex) || "";
    const lockInfo = response.LockInfo || null;

    return { schemaId, rawContent, lockInfo };
  }

  async getFieldDefinition(schemaId: string, fieldName: string): Promise<FieldDefinition | null> {
    const formattedSchemaId = formatTcmId(schemaId);
    const response = await this.api.getRequest<XpmItem>(`/items/${formattedSchemaId}?useDynamicVersion=true`);
    if (!response?.Fields) return null;

    const findKey = (fields: Record<string, FieldDefinition>, name: string): FieldDefinition | undefined => {
      const directKey = Object.keys(fields).find((k) => k.toLowerCase() === name.toLowerCase());
      return directKey ? fields[directKey] : undefined;
    };

    let fieldDef: FieldDefinition | undefined = findKey(response.Fields, fieldName);
    if (!fieldDef) {
      for (const key of Object.keys(response.Fields)) {
        const embedded = response.Fields[key]?.EmbeddedFields;
        if (embedded) {
          fieldDef = findKey(embedded, fieldName);
          if (fieldDef) break;
        }
      }
    }
    return fieldDef || null;
  }

  async updateComponentPayload(tcmId: string, tagName: string, inputValue: string, indexPosition: string | null): Promise<boolean> {
    const targetPublicationId = await this.getTargetPublicationId(tcmId);
    const id = formatTcmId(targetPublicationId);
    const checkoutResponse = await this.api.postService<XpmItem>(`/items/${id}/checkOut`, {});

    if (!checkoutResponse || !checkoutResponse.Content) return false;

    const content = checkoutResponse.Content as Record<string, unknown>;

    const findMatchingKey = (obj: Record<string, unknown>, targetKey: string): string | undefined => {
      return Object.keys(obj).find((k) => k.toLowerCase() === targetKey.toLowerCase());
    };

    const directKey = findMatchingKey(content, tagName);

    if (directKey && directKey !== "$type") {
      content[directKey] = inputValue;
    } else {
      for (const item of Object.keys(content)) {
        const fieldContent = content[item];
        const numIndex = indexPosition ? parseInt(indexPosition, 10) : -1;

        if (Array.isArray(fieldContent) && numIndex !== -1 && fieldContent[numIndex] !== undefined) {
          const targetObj = fieldContent[numIndex] as Record<string, unknown>;
          if (targetObj) {
            const subKey = findMatchingKey(targetObj, tagName);
            if (subKey) {
              targetObj[subKey] = inputValue;
            }
          }
        } else if (fieldContent !== null && typeof fieldContent === "object") {
          const targetRecord = fieldContent as Record<string, unknown>;
          const subKey = findMatchingKey(targetRecord, tagName);
          if (subKey) {
            targetRecord[subKey] = inputValue;
          }
        }
      }
    }

    const updateResponse = await this.api.putService<XpmItem>(`/items/${id}`, checkoutResponse);
    if (!updateResponse?.Id) return false;

    const componentId = formatTcmId(updateResponse.Id);
    const checkInResponse = await this.api.postService<XpmItem>(`/items/${componentId}/checkIn`, { "RemovePermanentLock": true });
    return Boolean(checkInResponse);
  }
}
