import type { FieldDefinition } from "../types/xpm";

export class SchemaFormRenderer {
  public static generateFormFromSchema(schemaObj: Record<string, FieldDefinition>): string {
    let html = "";
    for (const [key, fieldDef] of Object.entries(schemaObj)) {
      if (key.startsWith("$") || !fieldDef || typeof fieldDef !== "object") continue;

      const type = fieldDef.$type;
      const fieldName = key;
      const label = fieldDef.Description || fieldDef.Name || key;
      const isRequired = typeof fieldDef.MinOccurs === "number" ? fieldDef.MinOccurs > 0 : false;
      const maxOccurs = typeof fieldDef.MaxOccurs === "number" ? fieldDef.MaxOccurs : 1;
      const isMultiple = maxOccurs === -1 || maxOccurs > 1;
      const asterisk = isRequired ? ' <span style="color:red;">*</span>' : "";

      const renderInnerControl = (): string => {
        if (type === "EmbeddedSchemaFieldDefinition") {
          return this.generateFormFromSchema(fieldDef.EmbeddedFields || {});
        } else if (type === "MultimediaLinkFieldDefinition") {
          return `
            <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
              <label>${label}${asterisk}</label>
              <div class="xpm-binary-upload">
                <input type="file" accept=".jpg,.jpeg,.png" data-role="binary-file" ${isRequired ? 'data-required="true"' : ""} />
                <input type="hidden" data-role="binary-link" />
                <button class="xpm-save-binary-btn" type="button"><svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 11" width="16" height="16"><path d="M14.665 4.444h-1.332V3.111c0-.736-.597-1.333-1.333-1.333H7.556L5.778 0H1.333C.597 0 0 .597 0 1.333v8c0 .737.597 1.334 1.333 1.334H12.03c.78 0 1.504-.41 1.906-1.08l1.874-3.123a1.334 1.334 0 0 0-1.144-2.02zM1.333.89H5.41l1.777 1.778H12c.245 0 .444.199.444.444v1.333h-7.69c-.779 0-1.503.41-1.905 1.08L.89 8.79V1.333c0-.245.199-.444.444-.444zm13.714 5.117L13.173 9.13a1.333 1.333 0 0 1-1.144.648H1.245L3.523 5.98a1.333 1.333 0 0 1 1.144-.648h9.999c.345 0 .559.377.381.673z"></path></svg></button>
              </div>
            </div>`;
        } else if (type === "KeywordFieldDefinition") {
          const listType = fieldDef.List?.Type || "Select";

          const categoryObj = (fieldDef as any).Category || (fieldDef as any).Keyword || {};
          const categoryTitle = categoryObj.Title || "";
          const categoryIdRef = categoryObj.IdRef || categoryObj.Id || "";

          const radioGroupName = `radio_${fieldName}_${Math.random().toString(36).substring(2, 7)}`;

          if (listType === "Radio" || categoryTitle === "Boolean") {
            return `
              <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}" data-category-id="${categoryIdRef}">
                <label>${label}${asterisk}</label>
                <div class="xpm-radio-group">
                  <label style="display: inline-flex; align-items: center; margin-right: 15px; cursor: pointer;">
                    <input type="radio" name="${radioGroupName}" value="true" data-role="value" ${isRequired ? 'data-required="true"' : ""} style="margin-right: 5px;" /> True
                  </label>
                  <label style="display: inline-flex; align-items: center; cursor: pointer;">
                    <input type="radio" name="${radioGroupName}" value="false" data-role="value" style="margin-right: 5px;" /> No / False
                  </label>
                </div>
              </div>`;
          }

          return `
            <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}" data-category-id="${categoryIdRef}">
              <label>${label}${asterisk}</label>
              <select data-role="value" class="xpm-keyword-select" ${isRequired ? 'data-required="true"' : ""}>
                <option value="">-- Select ${label} --</option>
              </select>
            </div>`;
        } else if (type === "DateFieldDefinition") {
          return `
            <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
              <label>${label}${asterisk}</label>
              <input type="datetime-local" data-role="value" ${isRequired ? 'data-required="true"' : ""} />
            </div>`;
        } else if (type === "XhtmlFieldDefinition" || (fieldDef.Height && fieldDef.Height > 1)) {
          return `
            <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
              <label>${label}${asterisk}</label>
              <textarea data-role="value" rows="${fieldDef.Height || 3}" ${isRequired ? 'data-required="true"' : ""}></textarea>
            </div>`;
        } else {
          return `
            <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
              <label>${label}${asterisk}</label>
              <input type="text" data-role="value" ${isRequired ? 'data-required="true"' : ""} />
            </div>`;
        }
      };

      if (type === "EmbeddedSchemaFieldDefinition") {
        const subSchema = fieldDef.EmbeddedFields || {};
        html += `
          <div class="xpm-embedded-group" data-field-name="${fieldName}" data-field-type="${type}" data-max-occurs="${maxOccurs}">
            <h4>${label}</h4>
            <div class="xpm-embedded-items-container" data-embedded-schema='${JSON.stringify(subSchema).replace(/'/g, "&apos;")}'>
              <div class="xpm-embedded-item">
                <button type="button" class="xpm-btn xpm-btn-danger xpm-remove-embedded-btn" style="display:none;">Remove</button>
                ${renderInnerControl()}
              </div>
            </div>
            ${isMultiple ? `<button type="button" class="xpm-btn xpm-btn-secondary xpm-add-embedded-btn">+ ${label}</button>` : ""}
          </div>`;
      } else if (isMultiple) {
        html += `
          <div class="xpm-embedded-group" data-field-name="${fieldName}" data-field-type="${type}" data-max-occurs="${maxOccurs}">
            <h4>${label}</h4>
            <div class="xpm-embedded-items-container" data-field-schema='${JSON.stringify(fieldDef).replace(/'/g, "&apos;")}'>
              <div class="xpm-embedded-item">
                <button type="button" class="xpm-btn xpm-btn-danger xpm-remove-embedded-btn" style="display:none;">Remove</button>
                ${renderInnerControl()}
              </div>
            </div>
            <button type="button" class="xpm-btn xpm-btn-secondary xpm-add-item-btn">+ ${label}</button>
          </div>`;
      } else {
        html += renderInnerControl();
      }
    }
    return html;
  }

  public static createModalForm(compId: string, fieldsHtml: string): HTMLFormElement {
    const form = document.createElement("form");
    form.innerHTML = `
      <input type="hidden" name="componentId" value="${compId}" />
      <div class="xpm-field">
        <label for="xpm-component-name">Name <span style="color: red;">*</span></label>
        <input type="text" id="xpm-component-name" name="componentTitle" placeholder="Enter Name" data-required="true" />
      </div>
      ${fieldsHtml}
      <div class="xpm-actions">
        <button type="button" class="xpm-btn xpm-btn-secondary" id="xpm-cancel-btn">Cancel</button>
        <button type="submit" class="xpm-btn xpm-btn-primary">Save and Publish</button>
      </div>`;
    return form;
  }
}