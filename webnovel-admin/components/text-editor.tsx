"use client"

import TextEditorToolbar from "@/components/text-editor-toolbar"
import Heading from "@tiptap/extension-heading"
import TextAlign from "@tiptap/extension-text-align"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"

interface TipTapEditorProps {
  initialContent?: string
  onUpdate: (content: string) => void
  disabled?: boolean
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onUpdate,
  disabled,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Heading.configure({
        HTMLAttributes: {
          class: "text-xl font-bold",
          levels: [2],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rounded-md border min-h-[150px] md:min-h-[250px] max-h-[250px] md:max-h-[350px] broder-input bg-background ring-offset-2 diabled:cursor-not-allowed disabled:opacity-50 p-1 overflow-y-scroll overflow-x-hidden",
      },
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML()
      onUpdate(htmlContent)
    },
  })

  useEffect(() => {
    return () => {
      editor?.destroy()
    }
  }, [editor])

  return (
    <div className="flex flex-col justify-stretch min-h-[100px] md:min-h-[150px]">
      <TextEditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
