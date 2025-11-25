"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayments, useCreatePayment } from "@/hooks/use-payments";
import { Participant } from "@/types/database";
import { Mail, Phone, Pencil, ChevronDown, ChevronUp, Plus, Calendar } from "lucide-react";

interface ParticipantCardProps {
  participant: Participant;
  tripId: string;
  pricePerParticipant?: number | null;
  formatCurrency: (amount: number) => string;
  onEdit: () => void;
}

export function ParticipantCard({
  participant,
  tripId,
  pricePerParticipant,
  formatCurrency,
  onEdit,
}: ParticipantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentNotes, setPaymentNotes] = useState("");

  const { data: payments = [], isLoading: paymentsLoading } = usePayments(
    tripId,
    isExpanded ? participant.id : ""
  );
  const createPayment = useCreatePayment();

  const handleAddPayment = async () => {
    if (!paymentAmount) return;
    try {
      await createPayment.mutateAsync({
        tripId,
        participantId: participant.id,
        data: {
          amount: Number(paymentAmount),
          payment_date: paymentDate,
          notes: paymentNotes || undefined,
        },
      });
      setShowAddPayment(false);
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to add payment:", error);
    }
  };

  const amountDue = pricePerParticipant
    ? pricePerParticipant - participant.amount_paid
    : 0;

  return (
    <div className="border rounded-lg">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div className="font-medium">{participant.name}</div>
          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
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
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-medium">
              {formatCurrency(participant.amount_paid)}
              <span className="text-xs text-muted-foreground ml-1">paid</span>
            </div>
            {pricePerParticipant && (
              <div
                className={`text-sm ${
                  amountDue > 0 ? "text-destructive" : "text-green-600"
                }`}
              >
                {amountDue > 0
                  ? `${formatCurrency(amountDue)} due`
                  : "Paid in full"}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Payment History</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddPayment(!showAddPayment)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Record Payment
            </Button>
          </div>

          {showAddPayment && (
            <div className="mb-4 p-3 bg-background border rounded-lg">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-xs">
                    Amount *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="date" className="text-xs">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1 mb-3">
                <Label htmlFor="notes" className="text-xs">
                  Notes
                </Label>
                <Input
                  id="notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddPayment(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || createPayment.isPending}
                >
                  {createPayment.isPending ? "Adding..." : "Add Payment"}
                </Button>
              </div>
            </div>
          )}

          {paymentsLoading ? (
            <div className="text-sm text-muted-foreground">
              Loading payments...
            </div>
          ) : payments.length > 0 ? (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between text-sm p-2 bg-background rounded"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </span>
                    {payment.notes && (
                      <span className="text-muted-foreground">
                        - {payment.notes}
                      </span>
                    )}
                  </div>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No payments recorded yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
