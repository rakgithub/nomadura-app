"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ParticipantFormData {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface ParticipantFormProps {
  participant?: ParticipantFormData;
  onSubmit: (data: ParticipantFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ParticipantForm({
  participant,
  onSubmit,
  onCancel,
  isLoading,
}: ParticipantFormProps) {
  const [formData, setFormData] = useState<ParticipantFormData>({
    name: participant?.name || "",
    email: participant?.email || "",
    phone: participant?.phone || "",
    notes: participant?.notes || "",
  });

  const isEditing = !!participant;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? Number(value) : undefined) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? (isEditing ? "Updating..." : "Adding...")
            : (isEditing ? "Update Participant" : "Add Participant")
          }
        </Button>
      </div>
    </form>
  );
}
