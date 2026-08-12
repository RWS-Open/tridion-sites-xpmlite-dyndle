import contentCss from 'tinymce/skins/content/default/content.min.css?inline';
import skinCss from 'tinymce/skins/ui/oxide/skin.min.css?inline';
import tinymce from 'tinymce/tinymce';

import 'tinymce/models/dom';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';

import 'tinymce/plugins/code';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/table';
import 'tinymce/plugins/lists';

export class EditorFactory {
  private get actionButtons(): string {
    return `
      <div class="editor-action">
        <button type="button" title="Cancel Editing" class="editor-action-btn cancelComponentEditing">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </button>
        <button type="button" title="Save" class="editor-action-btn saveComponent">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-check-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
          </svg>
        </button>
      </div>`;
  }

  renderInputField(fieldName: string, valueElement: HTMLElement, rawContent: string): void {
    valueElement.innerHTML = `<input type="text" name="${fieldName}" value="${rawContent.trim()}" id="xpm-edit" class="xpm-form-control" />` + this.actionButtons;
    valueElement.classList.add("xpm-active-field");

    requestAnimationFrame(() => {
      const input = valueElement.querySelector("#xpm-edit") as HTMLInputElement | null;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  renderDateField(fieldName: string, valueElement: HTMLElement, rawContent: string): void {
    let formattedValue = (rawContent || "").trim();
    if (formattedValue.length >= 16 && formattedValue.includes("T")) {
      formattedValue = formattedValue.substring(0, 16);
    }
    valueElement.innerHTML = `<input type="datetime-local" name="${fieldName}" value="${formattedValue}" id="xpm-edit" class="xpm-form-control" />` + this.actionButtons;
    valueElement.classList.add("xpm-active-field");

    requestAnimationFrame(() => {
      const input = valueElement.querySelector("#xpm-edit") as HTMLInputElement | null;
      if (input) {
        input.focus();
      }
    });
  }

  renderPlainTextarea(fieldName: string, valueElement: HTMLElement, rawContent: string): void {
    const targetId = `xpm-textarea-${Date.now()}`;
    valueElement.innerHTML = `<textarea name="${fieldName}" id="${targetId}" class="xpm-form-control" style="height:120px"></textarea>` + this.actionButtons;
    valueElement.classList.add("xpm-active-field");

    requestAnimationFrame(() => {
      const textarea = valueElement.querySelector(`#${targetId}`) as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = (rawContent || "").trim();
        textarea.focus();
      }
    });
  }

  renderRichText(fieldName: string, valueElement: HTMLElement, rawContent: string): void {
    const targetId = `xpm-textarea-${Date.now()}`;
    valueElement.innerHTML = `<textarea name="${fieldName}" id="${targetId}" class="xpm-form-control" style="height:200px"></textarea>` + this.actionButtons;
    valueElement.classList.add("xpm-active-field");

    const textarea = valueElement.querySelector(`#${targetId}`) as HTMLTextAreaElement | null;
    if (textarea) textarea.value = rawContent;

    if (tinymce.get(targetId)) {
      tinymce.execCommand('mceRemoveEditor', false, targetId);
    }

    tinymce.init({
      selector: `#${targetId}`,
      license_key: 'gpl',

      skin: false,
      content_css: false,

      promotion: false,
      branding: false,
      menubar: false,

      plugins: ['code', 'link', 'image', 'table', 'lists'],
      toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | numlist bullist | link image table | code',
      schema: 'html5',
      element_format: 'xhtml',
      entity_encoding: 'raw',
      extended_valid_elements: 'table[style|border|class|width],colgroup[style|class|width],col/[style|width],tbody,thead,tfoot,tr,td[style|colspan|rowspan|width|height],th[style|colspan|rowspan|width|height],p,br/',
      valid_children: '+table[colgroup|tbody|thead|tfoot|tr],+colgroup[col],+tbody[tr],+thead[tr],+tfoot[tr],+tr[td|th]',
      verify_html: false,
      convert_urls: false,
      keep_styles: true,
      remove_trailing_brs: true,
      setup: (editor) => {
        editor.on('init', () => {
          editor.setContent(rawContent);
          editor.focus();

          if (!document.getElementById('tinymce-oxide-skin')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'tinymce-oxide-skin';
            styleEl.innerHTML = skinCss;
            document.head.appendChild(styleEl);
          }
        });

        editor.on('SkinLoaded', () => {
          const doc = editor.getDoc();
          if (doc) {
            const style = doc.createElement('style');
            style.innerHTML = contentCss;
            doc.head.appendChild(style);
          }
        });
      }
    });
  }

  destroyEditor(editorId: string): void {
    if (tinymce.get(editorId)) {
      tinymce.execCommand('mceRemoveEditor', false, editorId);
    }
  }
}
