"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDestination } from "@/hooks/use-destinations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DestinationForm() {
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

      // Reset form
      setName("");
      setCountry("");
      setDescription("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create destination"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Destination</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full"
            disabled={createDestination.isPending}
          >
            {createDestination.isPending ? "Adding..." : "Add Destination"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
