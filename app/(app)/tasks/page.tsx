"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useTasks } from "@/hooks/use-tasks"

export default function TasksPage() {
  const { tasks, loading, error, updateTask } = useTasks()

  const handleTaskCompletionChange = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { 
        status: completed ? 'completed' : 'pending',
        completed_at: completed ? new Date().toISOString() : undefined
      })
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Loading tasks...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Tasks</CardTitle>
          <CardDescription>Error loading tasks: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
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
              <TableRow key={task.id} data-completed={task.status === 'completed'}>
                <TableCell className="text-center">
                  <Checkbox
                    checked={task.status === 'completed'}
                    onCheckedChange={(checked) => handleTaskCompletionChange(task.id, !!checked)}
                    aria-label={task.status === 'completed' ? "Task completed" : "Task incomplete"}
                  />
                </TableCell>
                <TableCell className="font-medium group-data-[completed=true]:line-through group-data-[completed=true]:text-muted-foreground">
                  {task.title}
                  {task.description && (
                    <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{task.clients?.name || "No client"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
