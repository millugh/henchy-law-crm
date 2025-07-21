import type { ActivityEvent } from "@/lib/data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineContent,
  TimelineTime,
} from "@/components/ui/timeline"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Phone, Mail, Users, FileText, CheckSquare, Edit } from "lucide-react"

const eventIcons = {
  note: MessageSquare,
  call: Phone,
  email: Mail,
  meeting: Users,
  document: FileText,
  task: CheckSquare,
  update: Edit,
}

const getUserInitials = (name: string) => {
  const names = name.split(" ")
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`
  }
  return name.substring(0, 2)
}

export function ActivityTimeline({
  activity,
  title = "Activity Timeline",
  description,
}: {
  activity: ActivityEvent[]
  title?: string
  description?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Timeline>
          {activity.map((event, index) => {
            const Icon = eventIcons[event.type]
            return (
              <TimelineItem key={event.id}>
                <TimelineConnector />
                <TimelineHeader>
                  <TimelineTime>
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </TimelineTime>
                  <TimelineIcon>
                    <Icon className="h-4 w-4" />
                  </TimelineIcon>
                  <TimelineTitle>{event.description}</TimelineTitle>
                </TimelineHeader>
                <TimelineContent>
                  {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/placeholder.svg?height=24&width=24&query=${event.user}`} />
                      <AvatarFallback>{getUserInitials(event.user)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{event.user}</span>
                  </div>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </CardContent>
    </Card>
  )
}
