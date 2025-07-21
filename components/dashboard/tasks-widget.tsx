"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useTasks } from "@/hooks/use-tasks"
import { CheckSquare } from "lucide-react"

export function TasksWidget() {
  const { tasks, loading, error, updateTask } = useTasks()

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, {
        status: completed ? 'completed' : 'pending',
        completed_at: completed ? new Date().toISOString() : undefined
      })
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">Error loading tasks: {error}</div>
        </CardContent>
      </Card>
    )
  }

  const pendingTasks = tasks.filter(task => task.status !== 'completed').slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {pendingTasks.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending tasks</div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={(checked) => handleTaskToggle(task.id, checked as boolean)}
                />
                <span className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
