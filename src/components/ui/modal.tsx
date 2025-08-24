'use client'

import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface IModalDialogProps {
  title?: string
  description?: string
  isOpen: boolean
  onDialogClose: () => void
  children?: ReactNode
}

const ModalDialog = ({
  title,
  description,
  onDialogClose,
  isOpen,
  children,
}: IModalDialogProps) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onDialogClose()
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className={'sm:w-full sm:max-w-4xl'}>
        <DialogHeader>
          {title ? <DialogTitle>{title}</DialogTitle> : <DialogTitle />}
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <></>
          )}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalDialog
