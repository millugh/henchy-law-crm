"use client"

import { Phone } from "lucide-react"
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

export function CXDialer({ numberToCall, children }: { numberToCall: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleCall = () => {
    console.log(`Calling ${numberToCall} via 3CX...`)
    // In a real app, you would integrate with the 3CX API here.
    // For now, we'll just close the dialog.
    setIsOpen(false)
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
              <DialogDescription>Ready to call using your 3CX client.</DialogDescription>
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
          <Button onClick={handleCall} className="bg-[#008525] hover:bg-[#006a1e]">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
