import React, { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';

// --- IMPORTS EXTENSIONS ---
import { Underline } from '@tiptap/extension-underline';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align'; 

// --- IMPORTS ICON ---
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Image as ImageIcon, Table as TableIcon, AlignLeft, AlignCenter, 
  AlignRight, Layout, Indent, 
  Eraser, Trash2,
  Minimize2, Maximize2, Monitor, Plus, Columns, Rows, XCircle 
} from 'lucide-react';

// Menu Button Compact (p-1)
const MenuButton = ({ onClick, isActive, children, title, isDanger }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()} // Mencegah focus hilang dari editor
    onClick={onClick}
    className={`p-1 rounded transition flex items-center justify-center
      ${isActive 
        ? 'bg-indigo-100 text-indigo-600' 
        : isDanger 
          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    title={title}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange }) {
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      Paragraph.extend({
        addAttributes() {
          return {
            class: {
              default: null,
              parseHTML: element => element.getAttribute('class'),
              renderHTML: attributes => ({ class: attributes.class }),
            },
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => ({ style: attributes.style }),
            }
          }
        },
        addKeyboardShortcuts() {
          return {
            'Tab': () => {
              if (this.editor.isActive('table') || this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) return false; 
              return this.editor.commands.updateAttributes('paragraph', { class: 'indent-first' });
            },
            'Shift-Tab': () => {
              if (this.editor.isActive('table') || this.editor.isActive('bulletList') || this.editor.isActive('orderedList')) return false;
              return this.editor.commands.updateAttributes('paragraph', { class: null });
            }
          }
        }
      }),
      // --- KONFIGURASI TABLE ---
      Table.configure({ 
        resizable: true, 
        HTMLAttributes: { class: 'border-collapse w-full my-2' } 
      }),
      TableRow,
      TableHeader,
      TableCell.configure({ 
        HTMLAttributes: { class: 'border border-black p-1 align-top relative min-w-[30px]' } 
      }),
      Image.extend({
        addAttributes() {
          return {
            src: {},
            alt: { default: null },
            title: { default: null },
            width: {
              default: '100%',
              renderHTML: attributes => ({ width: attributes.width }),
              parseHTML: element => element.getAttribute('width'),
            },
            style: {
              default: null,
              renderHTML: attributes => ({ style: attributes.style }),
              parseHTML: element => element.getAttribute('style'),
            }
          }
        }
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }), 
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'max-w-none focus:outline-none min-h-[300px] p-3 text-xs leading-relaxed outline-none text-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // --- FUNCTIONS ---

  const toggleIndent = () => {
    const isIndented = editor.isActive('paragraph', { class: 'indent-first' });
    if (isIndented) editor.chain().focus().updateAttributes('paragraph', { class: null }).run();
    else editor.chain().focus().updateAttributes('paragraph', { class: 'indent-first' }).run();
  };

  const insertDefaultTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run();
  };

  const insertBiodataLayout = () => {
    const rowStyle = "display: flex; margin: 0; line-height: 1.2; align-items: flex-start;";
    const labelStyle = "min-width: 140px; width: 140px; font-weight: bold; display: inline-block;"; // Dipersempit sedikit
    const colonStyle = "min-width: 15px; width: 15px; display: inline-block;";
    const valueStyle = "flex: 1;";

    editor.chain().focus().insertContent(`
      <p style="${rowStyle}"><span style="${labelStyle}">Nama</span><span style="${colonStyle}">:</span><span style="${valueStyle}">...</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">NPM / NIK</span><span style="${colonStyle}">:</span><span style="${valueStyle}">...</span></p>
      <p style="${rowStyle}"><span style="${labelStyle}">Jabatan</span><span style="${colonStyle}">:</span><span style="${valueStyle}">...</span></p>
      <p></p>
    `).run();
  };

  const addImage = () => fileInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        editor.chain().focus().setImage({ src: e.target.result, width: '50%' }).run();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };

  const setImageAlignment = (align) => {
    let style = '';
    if (align === 'left') style = 'float: left; margin: 0 1em 0.5em 0; display: inline-block;';
    else if (align === 'right') style = 'float: right; margin: 0 0 0.5em 1em; display: inline-block;';
    else if (align === 'center') style = 'display: block; margin-left: auto; margin-right: auto; float: none;';
    editor.chain().focus().updateAttributes('image', { style }).run();
  };

  const setInfoImage = (width) => {
    editor.chain().focus().updateAttributes('image', { width }).run();
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-indigo-300 transition-colors">
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* --- CSS INJECTION (Updated for Compact View) --- */}
      <style>{`
        .ProseMirror p { margin-bottom: 0.5em; line-height: 1.5; }
        .ProseMirror p[style*="display: flex"] { margin-bottom: 0 !important; }
        .ProseMirror .indent-first { text-indent: 40px; }
        
        /* CSS TABLE COMPACT */
        .ProseMirror table { 
            border-collapse: collapse; 
            margin: 0.5em 0; 
            width: 100%; 
            table-layout: auto; 
        }
        .ProseMirror th, .ProseMirror td { 
            border: 1px solid #94a3b8; 
            padding: 4px 6px; /* Padding sel diperkecil */
            vertical-align: top; 
            min-width: 2em;
        }
        
        .ProseMirror img { border-radius: 4px; transition: all 0.2s; }
        .ProseMirror img.ProseMirror-selectednode { outline: 2px solid #6366f1; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
      `}</style>

      {/* --- TOOLBAR UTAMA (Compact Icon size={14}) --- */}
      <div className="bg-slate-50 border-b border-slate-200 p-1 flex flex-wrap gap-0.5 items-center sticky top-0 z-20">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={14} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={14} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={14} /></MenuButton>
        
        <div className="w-[1px] bg-slate-300 mx-1 h-5 self-center"></div>

        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Rata Kiri"><AlignLeft size={14} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Rata Tengah"><AlignCenter size={14} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Rata Kanan"><AlignRight size={14} /></MenuButton>
        <MenuButton onClick={toggleIndent} isActive={editor.isActive('paragraph', { class: 'indent-first' })} title="Indentasi"><Indent size={14} /></MenuButton>

        <div className="w-[1px] bg-slate-300 mx-1 h-5 self-center"></div>

        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={14} /></MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Number List"><ListOrdered size={14} /></MenuButton>

        <div className="w-[1px] bg-slate-300 mx-1 h-5 self-center"></div>

        <MenuButton onClick={insertBiodataLayout} isActive={false} title="Layout Biodata (Tanpa Table)"><Layout size={14} /></MenuButton>
        <MenuButton onClick={insertDefaultTable} isActive={false} title="Insert Table 3x3"><TableIcon size={14} /></MenuButton>
        <MenuButton onClick={addImage} isActive={false} title="Upload Gambar"><ImageIcon size={14} /></MenuButton>
      </div>

      {/* --- TOOLBAR KONTEKSTUAL TABLE (Compact) --- */}
      {editor.isActive('table') && (
        <div className="bg-blue-50 border-b border-blue-100 p-1 flex flex-wrap gap-2 justify-center items-center text-[10px] animate-in slide-in-from-top-2">
            <span className="font-bold text-blue-600 px-1 uppercase tracking-wide flex items-center gap-1">
              <TableIcon size={10}/> Edit Tabel:
            </span>
            
            <div className="flex gap-0.5 bg-white rounded border border-blue-200 p-0.5 shadow-sm">
                <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().addColumnAfter().run()} 
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-0.5"
                    title="Tambah Kolom Kanan"
                >
                    <Columns size={12} /><Plus size={8}/>
                </button>
                <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().addRowAfter().run()} 
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-0.5"
                    title="Tambah Baris Bawah"
                >
                    <Rows size={12} /><Plus size={8}/>
                </button>
            </div>

            <div className="flex gap-0.5 bg-white rounded border border-red-200 p-0.5 shadow-sm">
                <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().deleteColumn().run()} 
                    className="p-1 text-red-500 hover:bg-red-50 rounded flex items-center gap-0.5"
                    title="Hapus Kolom Saat Ini"
                >
                    <Columns size={12} /><XCircle size={8}/>
                </button>
                <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().deleteRow().run()} 
                    className="p-1 text-red-500 hover:bg-red-50 rounded flex items-center gap-0.5"
                    title="Hapus Baris Saat Ini"
                >
                    <Rows size={12} /><XCircle size={8}/>
                </button>
            </div>
            
            <button 
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().deleteTable().run()} 
                className="px-2 py-0.5 bg-red-100 text-red-600 hover:bg-red-200 rounded flex items-center gap-1 font-semibold text-[9px]"
                title="Hapus Seluruh Tabel"
            >
               <Trash2 size={10} /> Hapus Tabel
            </button>
        </div>
      )}

      {/* --- TOOLBAR KONTEKSTUAL GAMBAR (Compact) --- */}
      {editor.isActive('image') && (
        <div className="bg-indigo-50 border-b border-indigo-100 p-1 flex flex-wrap gap-2 justify-center items-center text-[10px] animate-in slide-in-from-top-2">
            <span className="font-bold text-indigo-600 px-1 uppercase tracking-wide">Kontrol Gambar:</span>
            <div className="flex gap-0.5 bg-white rounded border border-indigo-200 p-0.5">
                <MenuButton onClick={() => setImageAlignment('left')} title="Kiri"><AlignLeft size={12} /></MenuButton>
                <MenuButton onClick={() => setImageAlignment('center')} title="Tengah"><AlignCenter size={12} /></MenuButton>
                <MenuButton onClick={() => setImageAlignment('right')} title="Kanan"><AlignRight size={12} /></MenuButton>
            </div>
            <div className="flex gap-0.5 bg-white rounded border border-indigo-200 p-0.5 items-center">
                <MenuButton onClick={() => setInfoImage('50%')} title="50%"><Monitor size={12} /></MenuButton>
                <MenuButton onClick={() => setInfoImage('100%')} title="100%"><Maximize2 size={12} /></MenuButton>
            </div>
        </div>
      )}

      <div className="bg-white cursor-text min-h-[300px]" onClick={() => editor.chain().focus().run()}>
         <EditorContent editor={editor} />
      </div>
    </div>
  );
}