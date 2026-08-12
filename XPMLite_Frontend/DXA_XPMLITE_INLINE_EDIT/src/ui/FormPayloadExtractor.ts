import type { FieldDefinition, FieldsValueDictionary } from "../types/xpm";
import { safeJsonParse } from "../utils/utils";

export class FormPayloadExtractor {
  public static extract(containerEl: Element, schemaObj: Record<string, FieldDefinition>): FieldsValueDictionary {
    const result: FieldsValueDictionary = { "$type": "FieldsValueDictionary" };

    for (const [key, fieldDef] of Object.entries(schemaObj)) {
      if (key.startsWith("$") || !fieldDef || typeof fieldDef !== "object") continue;

      const type = fieldDef.$type;
      const maxOccurs = typeof fieldDef.MaxOccurs === "number" ? fieldDef.MaxOccurs : 1;
      const isMultiple = maxOccurs === -1 || maxOccurs > 1;

      if (type === "EmbeddedSchemaFieldDefinition") {
        const groupEl = this.getGroupElement(containerEl, key);

        if (!groupEl) {
          result[key] = isMultiple ? [] : null;
          continue;
        }

        const itemEls = groupEl.querySelectorAll(":scope > .xpm-embedded-items-container > .xpm-embedded-item");
        const items: FieldsValueDictionary[] = [];

        itemEls.forEach((itemEl) => {
          const extractSubitem = this.extract(itemEl, fieldDef.EmbeddedFields || {});

          if (!this.isEmptyValueDictionary(extractSubitem)) {
            items.push(extractSubitem);
          }
        });
        if (isMultiple) {
          result[key] = items;
        } else {
          result[key] = items.length > 0 ? items[0] : null;
        }

      } else if (type === "KeywordFieldDefinition") {
        const fieldEl = this.getFieldElement(containerEl, key);

        if (fieldEl) {
          const radioChecked = fieldEl.querySelector<HTMLInputElement>('input[type="radio"]:checked');

          if (radioChecked) {
            const val = radioChecked.value;
            const labelText = radioChecked.parentElement?.textContent?.trim() || "";
            let title = "";

            if (val === "true" || labelText.toLowerCase().includes("true")) {
              title = "True";
            } else if (val === "false" || labelText.toLowerCase().includes("false")) {
              title = "False";
            } else if (labelText && !labelText.startsWith("tcm:")) {
              title = labelText;
            }

            result[key] = {
              "$type": "Link",
              "IdRef": val,
              "Title": title
            };
          } else {
            const selectEl = fieldEl.querySelector<HTMLSelectElement>("select.xpm-keyword-select");
            const inputEl = fieldEl.querySelector<HTMLInputElement>('[data-role="value"]:not([type="radio"])');
            const selectedVal = selectEl ? selectEl.value.trim() : (inputEl ? inputEl.value.trim() : "");
            const selectedText = selectEl && selectEl.selectedIndex >= 0 ? selectEl.options[selectEl.selectedIndex].text : "";

            if (selectedVal) {
              let title = "";
              if (selectedText && !selectedText.startsWith("-- Select") && !selectedText.startsWith("tcm:")) {
                title = selectedText;
              } else if (selectedVal === "true") {
                title = "True";
              } else if (selectedVal === "false") {
                title = "False";
              }

              result[key] = {
                "$type": "Link",
                "IdRef": selectedVal,
                "Title": title
              };
            } else {
              result[key] = null;
            }
          }
        } else {
          result[key] = null;
        }

      } else if (type === "MultimediaLinkFieldDefinition") {
        if (isMultiple) {
          const groupEl = this.getGroupElement(containerEl, key);
          const fieldEls = groupEl ? groupEl.querySelectorAll(".xpm-field") : [];
          const links: unknown[] = [];

          fieldEls.forEach((fieldEl) => {
            const hiddenInput = fieldEl.querySelector('[data-role="binary-link"]') as HTMLInputElement | null;
            if (hiddenInput && hiddenInput.value) {
              const parsed = safeJsonParse(hiddenInput.value, null);
              if (parsed) links.push(parsed);
            }
          });

          result[key] = links;
        } else {
          const fieldEl = this.getFieldElement(containerEl, key);
          if (fieldEl) {
            const hiddenInput = fieldEl.querySelector('[data-role="binary-link"]') as HTMLInputElement | null;
            if (hiddenInput && hiddenInput.value) {
              result[key] = safeJsonParse(hiddenInput.value, null);
            } else {
              result[key] = null;
            }
          } else {
            result[key] = null;
          }
        }

      } else {
        if (isMultiple) {
          const groupEl = this.getGroupElement(containerEl, key);
          const fieldEls = groupEl ? groupEl.querySelectorAll(".xpm-field") : [];
          const values: string[] = [];

          fieldEls.forEach((fieldEl) => {
            const inputEl = fieldEl.querySelector('[data-role="value"]') as HTMLInputElement | HTMLTextAreaElement | null;
            const val = inputEl ? inputEl.value.trim() : "";
            if (val !== "") values.push(val);
          });

          result[key] = values;
        } else {
          const fieldEl = this.getFieldElement(containerEl, key);
          if (fieldEl) {
            const inputEl = fieldEl.querySelector('[data-role="value"]') as HTMLInputElement | HTMLTextAreaElement | null;
            let val = inputEl ? inputEl.value.trim() : "";
            if (type === "DateFieldDefinition" && val && val.length === 16) {
              val = `${val}:00`;
            }
            result[key] = val !== "" ? val : null;
          } else {
            result[key] = null;
          }
        }
      }
    }

    return result;
  }

  private static isEmptyValueDictionary(extractSubitem: FieldsValueDictionary): boolean {
    if (!extractSubitem || typeof extractSubitem !== "object") return true;

    for (const [key, value] of Object.entries(extractSubitem)) {
      if (key === "$type") continue;

      if (value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
        if (typeof value === "object" && !Array.isArray(value)) {
          if (!this.isEmptyValueDictionary(value as FieldsValueDictionary)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
    return true;
  }

  private static getFieldElement(containerEl: Element, key: string): Element | null {
    const direct = containerEl.querySelector(`
      :scope > .xpm-field[data-field-name="${key}"], 
      :scope > .xpm-collapsible-body > .xpm-field[data-field-name="${key}"], 
      :scope > .xpm-embedded-item > .xpm-field[data-field-name="${key}"]
    `);
    if (direct) return direct;

    const fields = containerEl.querySelectorAll(`
      :scope > .xpm-field[data-field-name], 
      :scope > .xpm-collapsible-body > .xpm-field[data-field-name], 
      :scope > .xpm-embedded-item > .xpm-field[data-field-name]
    `);
    for (const el of Array.from(fields)) {
      const name = el.getAttribute("data-field-name");
      if (name && name.toLowerCase() === key.toLowerCase()) {
        return el;
      }
    }
    return null;
  }

  private static getGroupElement(containerEl: Element, key: string): Element | null {
    const direct = containerEl.querySelector(`
      :scope > .xpm-embedded-group[data-field-name="${key}"], 
      :scope > .xpm-collapsible-body > .xpm-embedded-group[data-field-name="${key}"], 
      :scope > .xpm-embedded-item > .xpm-embedded-group[data-field-name="${key}"]
    `);
    if (direct) return direct;

    const groups = containerEl.querySelectorAll(`
      :scope > .xpm-embedded-group[data-field-name], 
      :scope > .xpm-collapsible-body > .xpm-embedded-group[data-field-name], 
      :scope > .xpm-embedded-item > .xpm-embedded-group[data-field-name]
    `);
    for (const el of Array.from(groups)) {
      const name = el.getAttribute("data-field-name");
      if (name && name.toLowerCase() === key.toLowerCase()) {
        return el;
      }
    }
    return null;
  }
}