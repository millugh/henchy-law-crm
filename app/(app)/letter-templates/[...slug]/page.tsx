"use client"

import { notFound, useParams, useRouter } from "next/navigation"

import { letterTemplates, type LetterTemplate } from "@/lib/data"
import { LetterTemplateEditor } from "@/components/letter-template-editor"
import { useToast } from "@/components/ui/use-toast"
import { useLetterTemplates } from "@/hooks/use-templates"

export default function LetterTemplateEditPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { createTemplate, updateTemplate, deleteTemplate } = useLetterTemplates()
  const { slug } = params

  const isNew = slug[0] === "new"
  const templateId = isNew ? null : slug[0]
  const template = templateId ? letterTemplates.find((t) => t.id === templateId) : null

  if (!isNew && !template) {
    notFound()
  }

  const handleSave = async (data: Omit<LetterTemplate, "id">) => {
    try {
      if (isNew) {
        const newTemplate = await createTemplate(data)
        router.push(`/letter-templates/${newTemplate.id}`)
      } else if (templateId) {
        await updateTemplate(templateId, data)
      }
    } catch (error) {
    }
  }

  const handleDelete = async () => {
    if (isNew || !templateId) return
    try {
      await deleteTemplate(templateId)
      router.push("/letter-templates")
    } catch (error) {
    }
  }

  return <LetterTemplateEditor template={template || undefined} onSave={handleSave} onDelete={handleDelete} />
}
