"use client"

import { notFound, useParams, useRouter } from "next/navigation"

import { letterTemplates, type LetterTemplate } from "@/lib/data"
import { LetterTemplateEditor } from "@/components/letter-template-editor"
import { useToast } from "@/hooks/use-toast"

export default function LetterTemplateEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { slug } = params

  const isNew = slug[0] === "new"
  const templateId = isNew ? null : slug[0]
  const template = templateId ? letterTemplates.find((t) => t.id === templateId) : null

  if (!isNew && !template) {
    notFound()
  }

  const handleSave = (data: Omit<LetterTemplate, "id">) => {
    // In a real app, you'd send this to your API
    if (isNew) {
      const newTemplate = { id: `LTPL-${Date.now()}`, ...data }
      letterTemplates.unshift(newTemplate) // Prepend to our mock data
      toast({
        title: "Template Created",
        description: `"${data.name}" has been successfully created.`,
      })
      router.push(`/letter-templates/${newTemplate.id}`)
    } else {
      const index = letterTemplates.findIndex((t) => t.id === templateId)
      if (index !== -1) {
        letterTemplates[index] = { ...letterTemplates[index], ...data }
      }
      toast({
        title: "Template Saved",
        description: `Changes to "${data.name}" have been saved.`,
      })
      router.refresh() // Refresh to show updated data if needed
    }
  }

  const handleDelete = () => {
    if (isNew || !templateId) return
    const index = letterTemplates.findIndex((t) => t.id === templateId)
    if (index !== -1) {
      letterTemplates.splice(index, 1)
    }
    toast({
      title: "Template Deleted",
      description: `The template has been permanently deleted.`,
      variant: "destructive",
    })
    router.push("/letter-templates")
  }

  return <LetterTemplateEditor template={template || undefined} onSave={handleSave} onDelete={handleDelete} />
}
