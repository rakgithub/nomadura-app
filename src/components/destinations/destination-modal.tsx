"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDestination } from "@/hooks/use-destinations";

interface DestinationModalProps {
  open: boolean;
  onClose: () => void;
}

export function DestinationModal({ open, onClose }: DestinationModalProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createDestination = useCreateDestination();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Destination name is required");
      return;
    }

    try {
      await createDestination.mutateAsync({
        name: name.trim(),
        country: country.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Reset form and close
      setName("");
      setCountry("");
      setDescription("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create destination"
      );
    }
  };

  const handleClose = () => {
    if (!createDestination.isPending) {
      setError("");
      setName("");
      setCountry("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader onClose={handleClose}>Add Destination</DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Destination Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Manali, Goa, Ladakh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createDestination.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="e.g., India"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={createDestination.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Optional notes about this destination"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createDestination.isPending}
              />
            </div>
          </div>
        </DialogContent>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createDestination.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createDestination.isPending}>
            {createDestination.isPending ? "Adding..." : "Add Destination"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
