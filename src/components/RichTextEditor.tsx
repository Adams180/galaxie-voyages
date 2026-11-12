"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";

type Labels = Record<string, string>;

// A genuine visual (WYSIWYG) rich-text editor. What you see is what is stored
// (as HTML), and the server sanitizes that HTML on save AND on render. Image
// insertion goes through the managed upload endpoint, never arbitrary URLs.
export default function RichTextEditor({
  name,
  initialHTML,
  labels,
  uploadEnabled,
}: {
  name: string;
  initialHTML: string;
  labels: Labels;
  uploadEnabled: boolean;
}) {
  const [html, setHtml] = useState(initialHTML || "");
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // avoid SSR hydration mismatch in Next
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: initialHTML || "",
    editorProps: {
      attributes: {
        class: "article-prose min-h-[16rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) {
    return (
      <div className="min-h-[18rem] animate-pulse rounded-lg border border-line bg-page" />
    );
  }

  const btn = (active: boolean) =>
    `rounded-md px-2.5 py-1 text-sm font-semibold transition ${
      active
        ? "bg-gold-400 text-navy-900"
        : "border border-line text-muted hover:text-fg"
    }`;

  const addLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(labels.linkPrompt ?? "URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/newsroom/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-page">
      {/* Hidden field carrying the sanitized-on-server HTML */}
      <input type="hidden" name={name} value={html} />

      <div className="flex flex-wrap items-center gap-1 border-b border-line p-2">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} aria-label="Bold">
          <b>B</b>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} aria-label="Italic">
          <i>I</i>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
          H3
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
          • {labels.list ?? "List"}
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
          1.
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
          ❝
        </button>
        <button type="button" onClick={addLink} className={btn(editor.isActive("link"))}>
          🔗
        </button>
        <label className={`${btn(false)} cursor-pointer`}>
          {uploading ? (labels.uploading ?? "…") : "🖼"}
          <input
            type="file"
            accept="image/*"
            disabled={!uploadEnabled || uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) insertImage(f);
            }}
            className="hidden"
          />
        </label>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} aria-label="Undo">
          ↶
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} aria-label="Redo">
          ↷
        </button>
      </div>

      <div className="px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
