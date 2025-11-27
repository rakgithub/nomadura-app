"use client";

import { ReactNode } from "react";
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "./dialog";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>{title}</DialogHeader>
      <DialogContent>
        {typeof description === "string" ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : (
          description
        )}
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
