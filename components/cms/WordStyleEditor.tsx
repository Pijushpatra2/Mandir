"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
  RotateCcw, RotateCw, Eye, Edit3, Columns, Sparkles, X, Check
} from "lucide-react";

interface WordStyleEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function WordStyleEditor({
  label,
  value,
  onChange,
  placeholder = "Write or edit rich content here...",
  minHeight = "240px"
}: WordStyleEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial and external value to contentEditable div
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if innerHTML differs to preserve cursor position during typing
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      executeCommand("createLink", linkUrl);
    }
    setLinkUrl("");
    setShowLinkModal(false);
  };

  const applyHeading = (tag: string) => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  const colors = [
    { label: "Sacred Gold", color: "#B47F35" },
    { label: "Deep Plum", color: "#2B132C" },
    { label: "Secondary Bronze", color: "#8B5E34" },
    { label: "Forest Green", color: "#166534" },
    { label: "Crimson Red", color: "#991B1B" },
    { label: "Charcoal Dark", color: "#1F2937" }
  ];

  return (
    <div className="space-y-2 font-poppins">
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-[#2B132C] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B47F35]" />
            <span>{label}</span>
          </label>
        )}

        {/* View Mode Switcher */}
        <div className="inline-flex rounded-lg border border-[#B47F35]/25 bg-white p-0.5 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === "edit"
                ? "bg-[#B47F35] text-white"
                : "text-stone-600 hover:text-[#2B132C]"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === "split"
                ? "bg-[#B47F35] text-white"
                : "text-stone-600 hover:text-[#2B132C]"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === "preview"
                ? "bg-[#B47F35] text-white"
                : "text-stone-600 hover:text-[#2B132C]"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Container with Word-Style Ribbon */}
      <div
        className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-xs ${
          isFocused ? "border-[#B47F35] ring-2 ring-[#B47F35]/15" : "border-[#B47F35]/25"
        }`}
      >
        {/* WORD-STYLE TOOLBAR RIBBON */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF7F2] border-b border-[#B47F35]/20 text-[#2B132C] select-none">
          {/* History */}
          <button
            type="button"
            title="Undo"
            onClick={() => executeCommand("undo")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={() => executeCommand("redo")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Heading selectors */}
          <button
            type="button"
            title="Normal Paragraph"
            onClick={() => applyHeading("p")}
            className="px-2 py-1 text-xs font-bold rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            Normal
          </button>
          <button
            type="button"
            title="Heading 1"
            onClick={() => applyHeading("h2")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => applyHeading("h3")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => applyHeading("h4")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Text Formatting */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand("bold")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] font-bold cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand("italic")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand("underline")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => executeCommand("strikeThrough")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Colors */}
          <div className="relative">
            <button
              type="button"
              title="Text Color Palette"
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="px-2 py-1 text-xs font-bold rounded hover:bg-[#B47F35]/15 text-[#B47F35] border border-[#B47F35]/30 cursor-pointer flex items-center gap-1"
            >
              <span className="w-3 h-3 rounded-full bg-[#B47F35]" />
              <span>Color</span>
            </button>
            {showColorPalette && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#B47F35]/30 rounded-xl shadow-lg p-2 z-30 grid grid-cols-3 gap-1.5 w-44">
                {colors.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => {
                      executeCommand("foreColor", c.color);
                      setShowColorPalette(false);
                    }}
                    className="flex items-center gap-1.5 p-1 text-[11px] rounded hover:bg-stone-100 cursor-pointer text-left"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-stone-300"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            title="Align Left"
            onClick={() => executeCommand("justifyLeft")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Center"
            onClick={() => executeCommand("justifyCenter")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Align Right"
            onClick={() => executeCommand("justifyRight")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Justify"
            onClick={() => executeCommand("justifyFull")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Lists */}
          <button
            type="button"
            title="Bulleted List"
            onClick={() => executeCommand("insertUnorderedList")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Numbered List"
            onClick={() => executeCommand("insertOrderedList")}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-[#B47F35]/25 mx-1" />

          {/* Hyperlink */}
          <button
            type="button"
            title="Insert Link"
            onClick={() => setShowLinkModal(true)}
            className="p-1.5 rounded hover:bg-[#B47F35]/15 text-stone-700 hover:text-[#2B132C] cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            title="Remove Formatting"
            onClick={() => executeCommand("removeFormat")}
            className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800 rounded hover:bg-[#B47F35]/15 cursor-pointer ml-auto"
          >
            Clear Format
          </button>
        </div>

        {/* WORKSPACE CONTENT AREA (Edit / Split / Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#B47F35]/15">
          {/* EDITOR CANVAS */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "md:col-span-6" : "md:col-span-12"
              } p-4 bg-white`}
            >
              <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{ minHeight }}
                className="outline-none text-sm text-[#2B132C] leading-relaxed prose max-w-none focus:outline-none"
                data-placeholder={placeholder}
              />
            </div>
          )}

          {/* LIVE PREVIEW CANVAS */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`${
                viewMode === "split" ? "md:col-span-6" : "md:col-span-12"
              } p-5 bg-[#FAF7F2] relative overflow-y-auto max-h-[500px]`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B47F35] bg-[#B47F35]/10 px-2 py-0.5 rounded-full border border-[#B47F35]/20">
                  Live Public Website Preview
                </span>
              </div>
              <div
                className="prose prose-sm max-w-none text-secondary-bronze leading-relaxed font-poppins"
                dangerouslySetInnerHTML={{ __html: value || "<p class='italic text-stone-400'>Preview is empty</p>" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hyperlink Dialog Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#B47F35]/30 max-w-md w-full p-5 space-y-4 font-poppins">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#2B132C] uppercase tracking-wider">
                Insert Web Link
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleApplyLink} className="space-y-3">
              <input
                type="url"
                required
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#B47F35]/30 text-sm focus:outline-none focus:border-[#B47F35]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B47F35] text-white text-xs font-semibold hover:bg-[#8B5E34] transition-colors"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
