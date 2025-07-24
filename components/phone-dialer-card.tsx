import { GripVertical, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recentCalls } from "@/lib/data"
import { CXDialer } from "./3cx-dialer"

function CallIcon({ type }: { type: string }) {
  switch (type) {
    case "incoming":
      return <PhoneIncoming className="h-4 w-4 text-green-500" />
    case "outgoing":
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />
    case "missed":
      return <PhoneMissed className="h-4 w-4 text-red-500" />
    default:
      return <Phone className="h-4 w-4 text-muted-foreground" />
  }
}

export function PhoneDialerCard({ dndListeners, isOverlay = false }: {  dndListeners?: Record<string, unknown>; isOverlay?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center p-3">
        {!isOverlay && (
          <button {...dndListeners} className="cursor-grab p-1 -ml-1 mr-1">
            <GripVertical className="h-5 w-5 text-muted-foreground/60" />
          </button>
        )}
        <CardTitle className="text-sm font-medium flex-1">Recent Calls</CardTitle>
        <Link href="/calls" className="text-sm text-muted-foreground hover:text-primary">
          View All
        </Link>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="space-y-4">
          {recentCalls.map((call, index) => (
            <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <CallIcon type={call.type} />
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{call.name}</p>
                <p className="text-sm text-muted-foreground">{call.number}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{call.time}</span>
                <CXDialer numberToCall={call.number}>
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </CXDialer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
