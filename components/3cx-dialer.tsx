"use client"

import { Phone, Loader2 } from "lucide-react"
import Image from "next/image"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type CallStatus = 'idle' | 'ringing' | 'connected' | 'failed'

export function CXDialer({ numberToCall, children }: { numberToCall: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [callStatus, setCallStatus] = React.useState<CallStatus>('idle')
  const { toast } = useToast()

  const handleCall = async () => {
    setCallStatus('ringing')
    
    try {
      const response = await fetch('/api/3cx/originate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calleeNumber: numberToCall,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate call')
      }

      setCallStatus('connected')
      toast({
        title: "Call initiated",
        description: `Calling ${numberToCall}...`,
      })

      setTimeout(() => {
        setCallStatus('idle')
        setIsOpen(false)
      }, 2000)

    } catch (error) {
      setCallStatus('failed')
      toast({
        title: "Call failed",
        description: error instanceof Error ? error.message : 'Failed to initiate call',
        variant: "destructive",
      })

      setTimeout(() => {
        setCallStatus('idle')
      }, 2000)
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case 'ringing':
        return 'Ringing...'
      case 'connected':
        return 'Connected'
      case 'failed':
        return 'Call Failed'
      default:
        return 'Ready to call using your 3CX client.'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Image src="/3cx-logo.png" alt="3CX Logo" width={40} height={40} />
            <div>
              <DialogTitle>3CX Dialer</DialogTitle>
              <DialogDescription>{getStatusText()}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input id="number" value={numberToCall} readOnly className="col-span-4" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCall} 
            disabled={callStatus !== 'idle'}
            className="bg-[#008525] hover:bg-[#006a1e] disabled:opacity-50"
          >
            {callStatus === 'ringing' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Phone className="mr-2 h-4 w-4" />
            )}
            {callStatus === 'ringing' ? 'Calling...' : 'Call'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
