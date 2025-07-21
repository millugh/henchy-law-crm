"use client"

import { useState } from "react"
import { tasks as initialTasks, type Task } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const handleTaskCompletionChange = (taskId: string, completed: boolean) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, completed } : task)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Tasks</CardTitle>
        <CardDescription>Manage and track your outstanding tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Client</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-completed={task.completed}>
                <TableCell className="text-center">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) => handleTaskCompletionChange(task.id, !!checked)}
                    aria-label={task.completed ? "Task completed" : "Task incomplete"}
                  />
                </TableCell>
                <TableCell className="font-medium group-data-[completed=true]:line-through group-data-[completed=true]:text-muted-foreground">
                  {task.description}
                </TableCell>
                <TableCell className="text-muted-foreground">{task.clientName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
