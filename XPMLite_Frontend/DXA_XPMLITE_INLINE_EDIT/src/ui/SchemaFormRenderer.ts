import { TinymceEditor } from "../editor/TinymceEditor";
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
                <button class="xpm-save-binary-btn" type="button"><svg version="1.1" fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" width="16" height="16"><path d="M14.125 13.5C14.125 13.8438 13.8438 14.125 13.5 14.125C13.1562 14.125 12.875 13.8438 12.875 13.5C12.875 13.1562 13.1562 12.875 13.5 12.875C13.8438 12.875 14.125 13.1562 14.125 13.5ZM11.5 12.875C11.1562 12.875 10.875 13.1562 10.875 13.5C10.875 13.8438 11.1562 14.125 11.5 14.125C11.8438 14.125 12.125 13.8438 12.125 13.5C12.125 13.1562 11.8438 12.875 11.5 12.875ZM16 11.375V14.625C16 15.3844 15.3844 16 14.625 16H1.375C0.615625 16 0 15.3844 0 14.625V11.375C0 10.6156 0.615625 10 1.375 10H5.25V6.89687H3.60313C2.49063 6.89687 1.93438 5.55 2.71875 4.7625L7.11562 0.365625C7.60313 -0.121875 8.39375 -0.121875 8.88437 0.365625L13.2812 4.7625C14.0688 5.55 13.5094 6.89687 12.3969 6.89687H10.75V10H14.625C15.3844 10 16 10.6156 16 11.375ZM6.25 5.89688V11.75C6.25 11.8875 6.3625 12 6.5 12H9.5C9.6375 12 9.75 11.8875 9.75 11.75V5.89688H12.3969C12.6188 5.89688 12.7313 5.62812 12.575 5.46875L8.17813 1.07187C8.08125 0.975 7.92188 0.975 7.825 1.07187L3.42813 5.46875C3.27188 5.625 3.38125 5.89688 3.60625 5.89688H6.25ZM15 11.375C15 11.1687 14.8313 11 14.625 11H10.75V11.75C10.75 12.4406 10.1906 13 9.5 13H6.5C5.80937 13 5.25 12.4406 5.25 11.75V11H1.375C1.16875 11 1 11.1687 1 11.375V14.625C1 14.8313 1.16875 15 1.375 15H14.625C14.8313 15 15 14.8313 15 14.625V11.375Z"></path></svg></button>
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
        } else if (type === "XhtmlFieldDefinition") {
          const uniqueEditorId = `xhtml_${fieldName}_${Math.random().toString(36).substring(2, 9)}`;
          return `
          <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
            <label>${label}${asterisk}</label>
            <textarea data-role="value" id="${uniqueEditorId}" rows="${fieldDef.Height || 5}" ${isRequired ? 'data-required="true"' : ""}></textarea>
          </div>`;
        } else if (fieldDef.Height && fieldDef.Height > 1) {

          return `
          <div class="xpm-field" data-field-name="${fieldName}" data-field-type="${type}">
            <label>${label}${asterisk}</label>
            <textarea data-role="value" rows="${fieldDef.Height}" ${isRequired ? 'data-required="true"' : ""}></textarea>
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

  public static initEditors(container: HTMLElement): void {
    const textareas = container.querySelectorAll<HTMLTextAreaElement>(
      '.xpm-field[data-field-type="XhtmlFieldDefinition"] textarea[id], textarea[id^="xhtml_"]'
    );

    textareas.forEach((textarea) => {
      if (textarea.id) {
        TinymceEditor.initTinyMceEditor(textarea.id, textarea.value || "");
      }
    });
  }

  public static destroyXhtmlEditors(container: HTMLElement): void {
    const xhtmlTextareas = container.querySelectorAll<HTMLTextAreaElement>(
      '.xpm-field[data-field-type="XhtmlFieldDefinition"] textarea[id], textarea[id^="xhtml_"]'
    );

    xhtmlTextareas.forEach((textarea) => {
      TinymceEditor.destroyEditor(textarea.id);
    });
  }
}