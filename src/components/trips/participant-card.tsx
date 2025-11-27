"use client";

import { Button } from "@/components/ui/button";
import { Participant } from "@/types/database";
import { Mail, Phone, Pencil, CheckCircle2, AlertCircle } from "lucide-react";

interface ParticipantCardProps {
  participant: Participant;
  tripId: string;
  pricePerParticipant?: number | null;
  formatCurrency: (amount: number) => string;
  onEdit: () => void;
  isReadOnly?: boolean;
}

export function ParticipantCard({
  participant,
  pricePerParticipant,
  formatCurrency,
  onEdit,
  isReadOnly = false,
}: ParticipantCardProps) {
  const amountDue = pricePerParticipant
    ? pricePerParticipant - participant.amount_paid
    : 0;

  const paymentProgress = pricePerParticipant
    ? (participant.amount_paid / pricePerParticipant) * 100
    : 0;

  const isPaidInFull = pricePerParticipant && amountDue <= 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{participant.name}</h3>
            {isPaidInFull && (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            {!isPaidInFull && amountDue > 0 && (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
            {participant.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {participant.email}
              </span>
            )}
            {participant.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {participant.phone}
              </span>
            )}
          </div>

          {/* Payment Info */}
          {pricePerParticipant ? (
            <div className="space-y-2">
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Progress</span>
                  <span>{Math.min(Math.round(paymentProgress), 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isPaidInFull ? "bg-green-600" : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 bg-muted/50 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Total</div>
                  <div className="font-semibold text-sm">
                    {formatCurrency(pricePerParticipant)}
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Paid</div>
                  <div className="font-semibold text-sm text-green-600">
                    {formatCurrency(participant.amount_paid)}
                  </div>
                </div>
                <div className={`text-center p-2 rounded-md ${
                  isPaidInFull ? "bg-green-50" : "bg-amber-50"
                }`}>
                  <div className={`text-xs mb-1 ${
                    isPaidInFull ? "text-green-700" : "text-amber-700"
                  }`}>
                    {isPaidInFull ? "Status" : "Due"}
                  </div>
                  <div className={`font-semibold text-sm ${
                    isPaidInFull ? "text-green-600" : "text-amber-600"
                  }`}>
                    {isPaidInFull ? "Complete" : formatCurrency(amountDue)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Total Paid</div>
              <div className="font-semibold text-green-600">
                {formatCurrency(participant.amount_paid)}
              </div>
            </div>
          )}
        </div>

        {!isReadOnly && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-shrink-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {participant.notes && (
        <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
          <span className="font-medium">Notes: </span>
          {participant.notes}
        </div>
      )}
    </div>
  );
}
