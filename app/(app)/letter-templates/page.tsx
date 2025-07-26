"use client"

import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { letterTemplates } from "@/lib/data"
import { useLetterTemplates } from "@/hooks/use-templates"

export default function LetterTemplatesPage() {
  const { templates, loading } = useLetterTemplates()
  const [searchTerm, setSearchTerm] = React.useState("urgent")

  const filteredTemplates = templates.filter((template) => {
    const term = searchTerm.toLowerCase()
    return (
      template.name.toLowerCase().includes(term) ||
      template.category.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.tags.some((tag) => tag.toLowerCase().includes(term))
    )
  })

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Letter Templates</CardTitle>
          <CardDescription>Create, manage, and use reusable letter templates with dynamic fields.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, tag, etc..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/letter-templates/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/letter-templates/${template.id}`} className="hover:underline">
                      {template.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                <p>No templates found for "{searchTerm}".</p>
                <Button variant="link" onClick={() => setSearchTerm("")}>
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
