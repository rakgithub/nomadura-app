"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { TripForm, TripFormData } from "./trip-form";
import { Trip } from "@/types/database";

interface TripModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TripFormData) => void;
  trip?: Trip;
  isLoading?: boolean;
}

export function TripModal({
  open,
  onClose,
  onSubmit,
  trip,
  isLoading,
}: TripModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        {trip ? "Edit Trip" : "Create New Trip"}
      </DialogHeader>
      <DialogContent>
        <TripForm
          trip={trip}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
