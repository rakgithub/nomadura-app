"use client";

import { useState } from "react";
import { Trip, TripStatus } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDestinations } from "@/hooks/use-destinations";
import { Plus } from "lucide-react";
import Link from "next/link";

export interface TripFormData {
  name: string;
  destination?: string;
  destination_id?: string;
  start_date: string;
  end_date: string;
  status?: TripStatus;
  min_participants?: number;
  price_per_participant?: number;
  notes?: string;
}

interface TripFormProps {
  trip?: Trip;
  onSubmit: (data: TripFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions: { value: TripStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TripForm({ trip, onSubmit, onCancel, isLoading }: TripFormProps) {
  const { data: destinations, isLoading: loadingDestinations } = useDestinations();

  const [formData, setFormData] = useState<TripFormData>({
    name: trip?.name || "",
    destination: trip?.destination || "",
    destination_id: trip?.destination_id || "",
    start_date: trip?.start_date || "",
    end_date: trip?.end_date || "",
    status: trip?.status,
    min_participants: trip?.min_participants || undefined,
    price_per_participant: trip?.price_per_participant || undefined,
    notes: trip?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Trip Name *</Label>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="destination_id">Destination</Label>
          <Link href="/destinations" target="_blank" rel="noopener noreferrer">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add New
            </Button>
          </Link>
        </div>
        <select
          id="destination_id"
          name="destination_id"
          value={formData.destination_id || ""}
          onChange={handleChange}
          disabled={loadingDestinations}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">-- Select Destination --</option>
          {destinations?.map((dest) => (
            <option key={dest.id} value={dest.id}>
              {dest.name}
              {dest.country && ` (${dest.country})`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
          {errors.start_date && (
            <p className="text-sm text-destructive">{errors.start_date}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
          {errors.end_date && (
            <p className="text-sm text-destructive">{errors.end_date}</p>
          )}
        </div>
      </div>

      {/* Only show status when editing */}
      {trip && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_participants">Min Participants</Label>
          <Input
            id="min_participants"
            name="min_participants"
            type="number"
            value={formData.min_participants || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_per_participant">Price per Participant</Label>
          <Input
            id="price_per_participant"
            name="price_per_participant"
            type="number"
            step="0.01"
            value={formData.price_per_participant || ""}
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
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : trip ? "Update Trip" : "Create Trip"}
        </Button>
      </div>
    </form>
  );
}
