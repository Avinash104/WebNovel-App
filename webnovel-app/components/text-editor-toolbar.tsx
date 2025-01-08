"use client"

import { Toggle } from "@/components/ui/toggle"
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip"
import { type Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react"
import React from "react"
import { Tooltip } from "./ui/tooltip"

interface TextEditorToolbarProps {
  editor: Editor | null
}

const TextEditorToolbar: React.FC<TextEditorToolbarProps> = ({ editor }) => {
  if (!editor) return null

  return (
    <div className="border border-input bg-transparent rounded-md flex flex-wrap gap-2 p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Heading
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Bold
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Italic
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Strike
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Ordered List
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Bullet List
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Text Align Left
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Text Align Center
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Text Align Right
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Quote
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            onPressedChange={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Undo
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            onPressedChange={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white p-2 rounded text-sm">
          Redo
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default TextEditorToolbar
