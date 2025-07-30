"use client"

import React from 'react'
import { CXDialer } from './3cx-dialer'
import { Button } from '@/components/ui/button'
import { Phone } from 'lucide-react'

interface PhoneNumberLinkProps {
  phoneNumber: string
  className?: string
  variant?: 'default' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
}

export function PhoneNumberLink({ 
  phoneNumber, 
  className = "",
  variant = "link",
  size = "sm"
}: PhoneNumberLinkProps) {
  if (!phoneNumber) return null

  return (
    <CXDialer numberToCall={phoneNumber}>
      <Button 
        variant={variant} 
        size={size}
        className={`p-0 h-auto font-normal text-blue-600 hover:text-blue-800 ${className}`}
      >
        <Phone className="h-3 w-3 mr-1" />
        {phoneNumber}
      </Button>
    </CXDialer>
  )
}
