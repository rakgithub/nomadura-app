"use client";

import { useState } from "react";
import { DestinationList } from "@/components/destinations/destination-list";
import { DestinationModal } from "@/components/destinations/destination-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function DestinationsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Destinations</h1>
            <p className="text-muted-foreground">
              Manage your trip destinations
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Destination
          </Button>
        </div>

        <DestinationList />
      </div>

      <DestinationModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
