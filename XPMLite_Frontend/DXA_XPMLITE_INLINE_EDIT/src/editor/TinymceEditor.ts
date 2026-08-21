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
class TinymceEditor {
    static initTinyMceEditor(targetId: string, content: string) {
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
                    editor.setContent(content);
                   // editor.focus();

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
    static destroyEditor(editorId: string): void {
        if (tinymce.get(editorId)) {
            tinymce.execCommand('mceRemoveEditor', false, editorId);
        }
    }

    public static triggerSave(): void {
    if (typeof tinymce !== "undefined" && tinymce.triggerSave) {
      tinymce.triggerSave();
    }
  }
}

export {TinymceEditor}