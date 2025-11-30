"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/use-trips";
import { useParticipants, useCreateParticipant, useUpdateParticipant } from "@/hooks/use-participants";
import { useTripPayments, useCreatePayment } from "@/hooks/use-payments";
import { useExpenses, useCreateExpense, useDeleteExpense, expenseCategoryLabels, expenseCategoryColors } from "@/hooks/use-expenses";
import { useAdvancePayments, useCreateAdvancePayment } from "@/hooks/use-advance-payments";
import { useTripCompletion } from "@/hooks/use-trip-completion";
import { Participant, ExpenseCategory } from "@/types/database";
import { TripForm } from "@/components/trips/trip-form";
import { ParticipantForm, ParticipantFormData } from "@/components/trips/participant-form";
import { ParticipantCard } from "@/components/trips/participant-card";
import { TotalPaymentsCard } from "@/components/trips/total-payments-card";
import { PendingPaymentsCard } from "@/components/trips/pending-payments-card";
import { TripReserveLockedCard } from "@/components/trips/trip-reserve-locked-card";
import { CompleteTripModal } from "@/components/trips/complete-trip-modal";
import { CompletedTripSummary } from "@/components/trips/completed-trip-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Edit, Trash2, Users, Receipt, CreditCard, Plus, Calendar, AlertCircle, CheckCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TripStatus } from "@/types/database";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentParticipantId, setPaymentParticipantId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  // All payments are advance payments by default (per newprd.md)
  const isAdvancePayment = true;
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | "">("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseNotes, setExpenseNotes] = useState("");
  const [showExpenseWarning, setShowExpenseWarning] = useState(false);
  const [expenseWarningData, setExpenseWarningData] = useState<{
    tripName: string;
    tripReserveBalance: number;
    expenseAmount: number;
    shortfall: number;
  } | null>(null);

  const { data: trip, isLoading, error, refetch } = useTrip(id);
  const { data: participants = [] } = useParticipants(id);
  const { data: tripPayments = [] } = useTripPayments(id);
  const { data: expenses = [] } = useExpenses(id);
  const { data: advancePayments = [] } = useAdvancePayments(id);
  const { data: completionLog } = useTripCompletion(id);
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const createPayment = useCreatePayment();
  const createAdvancePayment = useCreateAdvancePayment();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const handleAddParticipant = async (data: ParticipantFormData) => {
    try {
      await createParticipant.mutateAsync({
        trip_id: id,
        ...data,
      });
      setShowAddParticipant(false);
    } catch (error) {
      console.error("Failed to add participant:", error);
    }
  };

  const handleUpdateParticipant = async (data: ParticipantFormData) => {
    if (!editingParticipant) return;
    try {
      await updateParticipant.mutateAsync({
        tripId: id,
        participantId: editingParticipant.id,
        data,
      });
      setEditingParticipant(null);
    } catch (error) {
      console.error("Failed to update participant:", error);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentParticipantId || !paymentAmount) return;
    try {
      const amount = Number(paymentAmount);

      if (isAdvancePayment) {
        // Create advance payment with automatic split
        await createAdvancePayment.mutateAsync({
          trip_id: id,
          participant_id: paymentParticipantId,
          amount: amount,
          payment_date: paymentDate,
          notes: paymentNotes || null,
        });
      } else {
        // Create regular payment
        await createPayment.mutateAsync({
          tripId: id,
          participantId: paymentParticipantId,
          data: {
            amount: amount,
            payment_date: paymentDate,
            notes: paymentNotes || undefined,
          },
        });
      }

      setShowRecordPayment(false);
      setPaymentParticipantId("");
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to record payment:", error);
    }
  };

  const handleAddExpense = async (ignoreWarning = false) => {
    if (!expenseCategory || !expenseDescription || !expenseAmount) return;
    try {
      await createExpense.mutateAsync({
        tripId: id,
        data: {
          category: expenseCategory as ExpenseCategory,
          description: expenseDescription,
          amount: Number(expenseAmount),
          expense_date: expenseDate,
          notes: expenseNotes || undefined,
          ignoreWarning,
        },
      });
      setShowAddExpense(false);
      setExpenseCategory("");
      setExpenseDescription("");
      setExpenseAmount("");
      setExpenseNotes("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setShowExpenseWarning(false);
      setExpenseWarningData(null);
    } catch (error: any) {
      // Check if this is a warning response
      if (error.response?.data?.warning) {
        const data = error.response.data;
        setExpenseWarningData({
          tripName: data.tripName,
          tripReserveBalance: data.tripReserveBalance,
          expenseAmount: data.expenseAmount,
          shortfall: data.shortfall,
        });
        setShowExpenseWarning(true);
        return;
      }
      console.error("Failed to add expense:", error);
    }
  };

  const handleProceedWithExpense = async () => {
    setShowExpenseWarning(false);
    await handleAddExpense(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await deleteExpense.mutateAsync({
        tripId: id,
        expenseId,
      });
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const handleUpdate = async (data: {
    name: string;
    destination?: string;
    destination_id?: string;
    start_date: string;
    end_date: string;
    status?: TripStatus;
    min_participants?: number;
    price_per_participant?: number;
    notes?: string;
  }) => {
    try {
      await updateTrip.mutateAsync({ id, ...data });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update trip:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrip.mutateAsync(id);
      router.push("/trips");
    } catch (error) {
      console.error("Failed to delete trip:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Validation for completing trip
  const isMinimumParticipantsMet = !trip?.min_participants || participants.length >= trip.min_participants;
  const areAllPaymentsReceived = participants.every((participant) => {
    if (!trip?.price_per_participant) return true; // If no price set, consider it valid
    const amountDue = trip.price_per_participant - participant.amount_paid;
    return amountDue <= 0; // All participants must have paid in full
  });
  const canCompleteTrip = isMinimumParticipantsMet && areAllPaymentsReceived && trip?.total_advance_received && trip.total_advance_received > 0;

  if (isLoading) {
    return <Loading className="min-h-[400px]" size="lg" />;
  }

  if (error || !trip) {
    return (
      <ErrorDisplay
        message="Failed to load trip"
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/trips")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{trip.name}</h1>
            <StatusBadge status={trip.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {/* Show Complete button only for active trips */}
          {(trip.status === "upcoming" || trip.status === "in_progress") && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={() => setShowCompleteModal(true)}
                        className="bg-amber-600 hover:bg-amber-700"
                        disabled={!canCompleteTrip}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canCompleteTrip && (
                    <TooltipContent className="max-w-xs">
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold">Cannot complete trip yet:</p>
                        {!isMinimumParticipantsMet && (
                          <p className="text-red-600">• Minimum participants not met ({participants.length}/{trip.min_participants})</p>
                        )}
                        {!areAllPaymentsReceived && (
                          <p className="text-red-600">• Not all participants have paid in full</p>
                        )}
                        {(!trip.total_advance_received || trip.total_advance_received === 0) && (
                          <p className="text-red-600">• No advance payments received</p>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Requirements to complete trip:</p>
                      <div className="space-y-1">
                        <p className={isMinimumParticipantsMet ? "text-green-600" : "text-muted-foreground"}>
                          {isMinimumParticipantsMet ? "✓" : "○"} Minimum participants met ({participants.length}/{trip.min_participants || "N/A"})
                        </p>
                        <p className={areAllPaymentsReceived ? "text-green-600" : "text-muted-foreground"}>
                          {areAllPaymentsReceived ? "✓" : "○"} All participants paid in full
                        </p>
                        <p className={(trip.total_advance_received && trip.total_advance_received > 0) ? "text-green-600" : "text-muted-foreground"}>
                          {(trip.total_advance_received && trip.total_advance_received > 0) ? "✓" : "○"} Advance payments received
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          {trip.status !== "completed" && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <TripForm
              trip={trip}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={updateTrip.isPending}
            />
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Trip"
        description="Are you sure you want to delete this trip? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteTrip.isPending}
      />

      {/* Tabs */}
      {!isEditing && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Show Completed Summary for completed trips */}
              {trip.status === 'completed' ? (
                <CompletedTripSummary
                  finalProfit={completionLog?.final_profit ?? trip.released_profit ?? 0}
                  reserveReleased={completionLog?.reserve_released ?? 0}
                  tripSpendReleased={completionLog?.trip_spend_released ?? 0}
                  businessAccountReleased={completionLog?.business_account_released ?? 0}
                  completedAt={completionLog?.completed_at ?? trip.updated_at}
                />
              ) : (
                /* Trip Money Flow - For Active Trips */
                (() => {
                  // Calculate payment status based on participant payments
                  const pricePerParticipant = trip.price_per_participant ?? 0;
                  const totalExpectedFromParticipants = participants.length * pricePerParticipant;
                  const totalPaidByParticipants = participants.reduce((sum, p) => sum + (p.amount_paid ?? 0), 0);
                  const pendingFromParticipants = Math.max(0, totalExpectedFromParticipants - totalPaidByParticipants);

                  return (trip.total_advance_received ?? 0) > 0 || participants.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">Trip Money Flow</h3>
                      <div className="grid gap-3 grid-cols-3">
                        {/* Card 1: Total Payments */}
                        <TotalPaymentsCard
                          amount={trip.total_advance_received ?? 0}
                          paymentCount={advancePayments.length}
                        />

                        {/* Card 2: Pending Payments */}
                        <PendingPaymentsCard
                          amount={pendingFromParticipants}
                          totalCost={totalExpectedFromParticipants}
                          totalReceived={totalPaidByParticipants}
                        />

                        {/* Card 3: Trip Reserve */}
                        <TripReserveLockedCard
                          amount={trip.trip_reserve_balance ?? 0}
                          reservePercentage={trip.reserve_percentage ?? 0.30}
                        />
                      </div>
                    </div>
                  ) : null;
                })()
              )}

              {/* Participant Status */}
              {trip.min_participants && (
                <Card className={
                  participants.length < trip.min_participants
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-green-200 bg-green-50/50'
                }>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participant Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {participants.length} / {trip.min_participants}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {participants.length < trip.min_participants
                            ? `Need ${trip.min_participants - participants.length} more participant${trip.min_participants - participants.length !== 1 ? 's' : ''}`
                            : 'Minimum requirement met!'
                          }
                        </p>
                      </div>
                      {participants.length < trip.min_participants ? (
                        <div className="h-16 w-16 rounded-full border-4 border-amber-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-amber-600">
                            {Math.round((participants.length / trip.min_participants) * 100)}%
                          </span>
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trip Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trip.destination && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">Destination</span>
                      <span className="text-sm font-medium">{trip.destination}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Dates</span>
                    <span className="text-sm font-medium text-right">
                      {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {trip.price_per_participant && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-sm font-medium text-muted-foreground">Price per Participant</span>
                      <span className="text-sm font-medium">{formatCurrency(trip.price_per_participant)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2">
                    <span className="text-sm font-medium text-muted-foreground">Current Participants</span>
                    <span className="text-sm font-medium">{participants.length}</span>
                  </div>

                  {trip.notes && (
                    <div className="border-t pt-3 mt-3">
                      <span className="text-sm font-medium text-muted-foreground block mb-2">Notes</span>
                      <p className="text-sm whitespace-pre-wrap">{trip.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Participants ({participants.length})</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddParticipant(true)}
                  disabled={trip.status === "completed"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Participant
                </Button>
              </CardHeader>
              <CardContent>
                {showAddParticipant && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Add Participant</h4>
                    <ParticipantForm
                      onSubmit={handleAddParticipant}
                      onCancel={() => setShowAddParticipant(false)}
                      isLoading={createParticipant.isPending}
                    />
                  </div>
                )}

                {participants.length > 0 ? (
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div key={participant.id}>
                        {editingParticipant?.id === participant.id ? (
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-4">Edit Participant</h4>
                            <ParticipantForm
                              participant={{
                                name: participant.name,
                                email: participant.email || undefined,
                                phone: participant.phone || undefined,
                                notes: participant.notes || undefined,
                              }}
                              onSubmit={handleUpdateParticipant}
                              onCancel={() => setEditingParticipant(null)}
                              isLoading={updateParticipant.isPending}
                            />
                          </div>
                        ) : (
                          <ParticipantCard
                            participant={participant}
                            tripId={id}
                            pricePerParticipant={trip.price_per_participant}
                            formatCurrency={formatCurrency}
                            onEdit={() => setEditingParticipant(participant)}
                            isReadOnly={trip.status === "completed"}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  !showAddParticipant && (
                    <EmptyState
                      icon={Users}
                      title="No participants yet"
                      description="Add participants to track who's joining this trip"
                      action={
                        <Button onClick={() => setShowAddParticipant(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Participant
                        </Button>
                      }
                    />
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  All Payments ({tripPayments.length + advancePayments.length})
                  {(tripPayments.length > 0 || advancePayments.length > 0) && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      Total: {formatCurrency(
                        tripPayments.reduce((sum, p) => sum + Number(p.amount), 0) +
                        advancePayments.reduce((sum, a) => sum + Number(a.amount), 0)
                      )}
                    </span>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRecordPayment(true)}
                  disabled={participants.length === 0 || trip.status === "completed"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                {showRecordPayment && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Record Payment</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="participant">Participant *</Label>
                        <select
                          id="participant"
                          value={paymentParticipantId}
                          onChange={(e) => setPaymentParticipantId(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select participant</option>
                          {participants.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          placeholder="Optional notes"
                        />
                      </div>

                      {/* Advance Split Preview - Five-Bucket Model */}
                      {paymentAmount && Number(paymentAmount) > 0 && (() => {
                        // Calculate split per FIVE-BUCKET MODEL (newprd.md)
                        const amount = Number(paymentAmount);
                        const reservePercentage = trip.reserve_percentage ?? 0.60;
                        const tripReserveAmount = amount * reservePercentage;
                        const spendableAmount = amount - tripReserveAmount;
                        const operatingAmount = spendableAmount * 0.5;
                        const businessAmount = spendableAmount * 0.5;

                        const reservePercent = Math.round(reservePercentage * 100);
                        const operatingPercent = Math.round((operatingAmount / amount) * 100);
                        const businessPercent = Math.round((businessAmount / amount) * 100);

                        return (
                          <div className="p-4 bg-muted rounded-md space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-sm">Automatic Split Breakdown</h4>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">
                                  Trip Reserve ({reservePercent}%)
                                </span>
                                <span className="font-medium text-blue-600">
                                  {formatCurrency(tripReserveAmount)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-4">
                                Protected for trip expenses only
                              </p>

                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-muted-foreground">
                                  Operating Account ({operatingPercent}%)
                                </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(operatingAmount)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-4">
                                For trip operations (hotels, transport, etc.)
                              </p>

                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-muted-foreground">
                                  Business Account ({businessPercent}%)
                                </span>
                                <span className="font-medium text-purple-600">
                                  {formatCurrency(businessAmount)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-4">
                                For business expenses (ads, tools, etc.)
                              </p>
                            </div>

                            <div className="pt-3 border-t">
                              <div className="flex justify-between font-medium">
                                <span>Total</span>
                                <span>{formatCurrency(amount)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowRecordPayment(false);
                            setPaymentParticipantId("");
                            setPaymentAmount("");
                            setPaymentNotes("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRecordPayment}
                          disabled={!paymentParticipantId || !paymentAmount || createPayment.isPending || createAdvancePayment.isPending}
                        >
                          {(createPayment.isPending || createAdvancePayment.isPending) ? "Recording..." : "Record Payment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {(tripPayments.length > 0 || advancePayments.length > 0) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Participant</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-sm">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Combine and sort all payments by date - all are advance payments */}
                        {[
                          ...tripPayments.map(p => ({ ...p, payment_date: p.payment_date })),
                          ...advancePayments.map(a => ({
                            ...a,
                            participant_name: participants.find(p => p.id === a.participant_id)?.name || 'Unknown',
                            payment_date: a.payment_date
                          }))
                        ]
                          .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                          .map((payment, index) => (
                            <tr key={`payment-${payment.id}-${index}`} className="border-b hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm">
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium">
                                {payment.participant_name}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-green-600">
                                +{formatCurrency(Number(payment.amount))}
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">
                                {payment.notes || '-'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  !showRecordPayment && (
                    <EmptyState
                      icon={CreditCard}
                      title="No payments recorded"
                      description={
                        participants.length === 0
                          ? "Add participants first to record payments"
                          : "Record payments from participants"
                      }
                      action={
                        <Button
                          onClick={() => setShowRecordPayment(true)}
                          disabled={participants.length === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Record Payment
                        </Button>
                      }
                    />
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Expenses ({expenses.length})
                  {expenses.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      Total: {formatCurrency(expenses.reduce((sum, e) => sum + Number(e.amount), 0))}
                    </span>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddExpense(true)}
                  disabled={trip.status === "completed"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </CardHeader>
              <CardContent>
                {showAddExpense && (
                  <div className="mb-6 p-4 border rounded-lg">
                    <h4 className="font-medium mb-4">Add Expense</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <select
                          id="category"
                          value={expenseCategory}
                          onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select category</option>
                          {Object.entries(expenseCategoryLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Input
                          id="description"
                          value={expenseDescription}
                          onChange={(e) => setExpenseDescription(e.target.value)}
                          placeholder="e.g., Bus tickets to destination"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expenseAmount">Amount *</Label>
                          <Input
                            id="expenseAmount"
                            type="number"
                            step="0.01"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expenseDate">Date</Label>
                          <Input
                            id="expenseDate"
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expenseNotes">Notes</Label>
                        <Input
                          id="expenseNotes"
                          value={expenseNotes}
                          onChange={(e) => setExpenseNotes(e.target.value)}
                          placeholder="Optional notes"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddExpense(false);
                            setExpenseCategory("");
                            setExpenseDescription("");
                            setExpenseAmount("");
                            setExpenseNotes("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAddExpense()}
                          disabled={!expenseCategory || !expenseDescription || !expenseAmount || createExpense.isPending}
                        >
                          {createExpense.isPending ? "Adding..." : "Add Expense"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{expense.description}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expenseCategoryColors[expense.category]}`}>
                              {expenseCategoryLabels[expense.category]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(expense.expense_date).toLocaleDateString()}
                            </span>
                            {expense.notes && (
                              <span>• {expense.notes}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-destructive">
                              -{formatCurrency(expense.amount)}
                            </div>
                          </div>
                          {trip.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={deleteExpense.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !showAddExpense && (
                    <EmptyState
                      icon={Receipt}
                      title="No expenses recorded"
                      description="Add expenses like food, transport, guide fees"
                      action={
                        <Button onClick={() => setShowAddExpense(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      }
                    />
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Trip Expense Warning Dialog */}
      {expenseWarningData && (
        <ConfirmDialog
          open={showExpenseWarning}
          onClose={() => setShowExpenseWarning(false)}
          onConfirm={handleProceedWithExpense}
          title="⚠️ Trip Reserve Insufficient"
          description={
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    This expense exceeds the trip reserve!
                  </p>
                  <p className="text-sm text-amber-800">
                    The trip "{expenseWarningData.tripName}" does not have enough reserved funds for this expense.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Available Trip Reserve:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(expenseWarningData.tripReserveBalance)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Expense Amount:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(expenseWarningData.expenseAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-red-50 px-3 rounded">
                  <span className="font-medium text-red-800">Shortfall:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(expenseWarningData.shortfall)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This trip is over budget. Proceeding will create a deficit that may need to be covered from other sources.
              </p>
            </div>
          }
          confirmText="Proceed Anyway"
          cancelText="Cancel"
          variant="destructive"
          isLoading={createExpense.isPending}
        />
      )}

      {/* Complete Trip Modal */}
      <CompleteTripModal
        open={showCompleteModal}
        onOpenChange={setShowCompleteModal}
        trip={{
          id: trip.id,
          name: trip.name,
          total_advance_received: trip.total_advance_received || 0,
          trip_reserve_balance: trip.trip_reserve_balance || 0,
          operating_account: trip.operating_account || 0,
          business_account: trip.business_account || 0,
        }}
        totalExpenses={expenses.reduce((sum, e) => sum + Number(e.amount), 0)}
        hasNoExpenses={expenses.length === 0}
        isOverspent={(trip.operating_account || 0) < 0}
      />
    </div>
  );
}
