"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Code, Eye, Save, Trash2 } from "lucide-react"

import type { LetterTemplate } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const placeholders = [
  { group: "Current Info", fields: ["{{current.date}}"] },
  { group: "User", fields: ["{{user.name}}", "{{user.title}}"] },
  { group: "Client", fields: ["{{client.name}}", "{{client.address}}", "{{client.primaryContact.name}}"] },
  { group: "Matter", fields: ["{{matter.name}}", "{{matter.id}}", "{{matter.propertyAddress}}"] },
]

const sampleData: Record<string, string> = {
  "{{current.date}}": new Date().toLocaleDateString("en-US"),
  "{{user.name}}": "John Henchy",
  "{{user.title}}": "Managing Attorney",
  "{{client.name}}": "E.P. Breaux Utility Services, LLC",
  "{{client.address}}": "123 Industrial Way\nLafayette, LA 70508",
  "{{client.primaryContact.name}}": "Mr. John Breaux",
  "{{matter.name}}": "Sale of 123 Main St",
  "{{matter.id}}": "MAT-013",
  "{{matter.propertyAddress}}": "123 Main St, Baton Rouge, LA 70808",
}

interface LetterTemplateEditorProps {
  template?: LetterTemplate
  onSave: (template: Omit<LetterTemplate, "id">) => void
  onDelete?: () => void
}

export function LetterTemplateEditor({ template, onSave, onDelete }: LetterTemplateEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = React.useState({
    name: template?.name || "",
    category: template?.category || "",
    description: template?.description || "",
    tags: template?.tags || [],
    content: template?.content || "",
  })
  const [tagInput, setTagInput] = React.useState("")
  const [mode, setMode] = React.useState<"edit" | "preview">("edit")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }))
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
  }

  const insertPlaceholder = (placeholder: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const newText = text.substring(0, start) + placeholder + text.substring(end)

    setFormData((prev) => ({ ...prev, content: newText }))
    textarea.focus()
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length
    }, 0)
  }

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.content) {
      toast({
        title: "Missing Fields",
        description: "Please provide a name, category, and content for the template.",
        variant: "destructive",
      })
      return
    }
    onSave(formData)
  }

  const previewContent = React.useMemo(() => {
    let content = formData.content
    for (const [key, value] of Object.entries(sampleData)) {
      content = content.replace(new RegExp(key.replace(/[{}]/g, "\\$&"), "g"), value)
    }
    return content
  }, [formData.content])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template ? "Edit Template" : "New Template"}</h1>
          <p className="text-muted-foreground">{template ? template.name : "Create a new reusable letter."}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {template && onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Template
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard Engagement Letter"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Client Onboarding"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe this template's purpose."
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button className="ml-1.5" onClick={() => removeTag(tag)}>
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Type a tag and press Enter..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Content</CardTitle>
              <div className="flex items-center gap-1 rounded-md bg-secondary p-0.5">
                <Button
                  size="sm"
                  variant={mode === "edit" ? "secondary" : "ghost"}
                  className="h-7"
                  onClick={() => setMode("edit")}
                >
                  <Code className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant={mode === "preview" ? "secondary" : "ghost"}
                  className="h-7"
                  onClick={() => setMode("preview")}
                >
                  <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mode === "edit" ? (
                <Textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your letter content here. Use placeholders from the right panel."
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 border rounded-md min-h-[400px] whitespace-pre-wrap font-serif">
                  {previewContent}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Dynamic Placeholders</CardTitle>
            <CardDescription>Click to insert into your template.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {placeholders.map((group) => (
              <div key={group.group}>
                <h4 className="font-semibold text-sm mb-2">{group.group}</h4>
                <div className="flex flex-col items-start gap-1">
                  {group.fields.map((field) => (
                    <Button
                      key={field}
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-muted-foreground hover:text-primary"
                      onClick={() => insertPlaceholder(field)}
                    >
                      {field}
                    </Button>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
