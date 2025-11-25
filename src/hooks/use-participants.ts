"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Participant, InsertParticipant, UpdateParticipant } from "@/types/database";

async function fetchParticipants(tripId: string): Promise<Participant[]> {
  const res = await fetch(`/api/trips/${tripId}/participants`);
  if (!res.ok) throw new Error("Failed to fetch participants");
  return res.json();
}

async function createParticipant(
  data: Omit<InsertParticipant, "id">
): Promise<Participant> {
  const res = await fetch(`/api/trips/${data.trip_id}/participants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add participant");
  return res.json();
}

async function updateParticipant({
  tripId,
  participantId,
  data,
}: {
  tripId: string;
  participantId: string;
  data: UpdateParticipant;
}): Promise<Participant> {
  const res = await fetch(
    `/api/trips/${tripId}/participants/${participantId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update participant");
  return res.json();
}

async function deleteParticipant({
  tripId,
  participantId,
}: {
  tripId: string;
  participantId: string;
}): Promise<void> {
  const res = await fetch(
    `/api/trips/${tripId}/participants/${participantId}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to remove participant");
}

export function useParticipants(tripId: string) {
  return useQuery({
    queryKey: ["participants", tripId],
    queryFn: () => fetchParticipants(tripId),
    enabled: !!tripId,
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParticipant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", data.trip_id],
      });
    },
  });
}

export function useUpdateParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateParticipant,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", data.trip_id],
      });
    },
  });
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteParticipant,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["participants", variables.tripId],
      });
    },
  });
}
