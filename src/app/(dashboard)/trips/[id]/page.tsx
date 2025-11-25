"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrip, useUpdateTrip, useDeleteTrip } from "@/hooks/use-trips";
import { useParticipants, useCreateParticipant, useUpdateParticipant } from "@/hooks/use-participants";
import { useTripPayments, useCreatePayment } from "@/hooks/use-payments";
import { useExpenses, useCreateExpense, expenseCategoryLabels, expenseCategoryColors } from "@/hooks/use-expenses";
import { Participant, ExpenseCategory } from "@/types/database";
import { TripForm } from "@/components/trips/trip-form";
import { ParticipantForm, ParticipantFormData } from "@/components/trips/participant-form";
import { ParticipantCard } from "@/components/trips/participant-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Edit, Trash2, Users, Receipt, CreditCard, Plus, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TripStatus } from "@/types/database";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [paymentParticipantId, setPaymentParticipantId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory | "">("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseNotes, setExpenseNotes] = useState("");

  const { data: trip, isLoading, error, refetch } = useTrip(id);
  const { data: participants = [] } = useParticipants(id);
  const { data: tripPayments = [] } = useTripPayments(id);
  const { data: expenses = [] } = useExpenses(id);
  const updateTrip = useUpdateTrip();
  const deleteTrip = useDeleteTrip();
  const createParticipant = useCreateParticipant();
  const updateParticipant = useUpdateParticipant();
  const createPayment = useCreatePayment();
  const createExpense = useCreateExpense();

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
      await createPayment.mutateAsync({
        tripId: id,
        participantId: paymentParticipantId,
        data: {
          amount: Number(paymentAmount),
          payment_date: paymentDate,
          notes: paymentNotes || undefined,
        },
      });
      setShowRecordPayment(false);
      setPaymentParticipantId("");
      setPaymentAmount("");
      setPaymentNotes("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to record payment:", error);
    }
  };

  const handleAddExpense = async () => {
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
        },
      });
      setShowAddExpense(false);
      setExpenseCategory("");
      setExpenseDescription("");
      setExpenseAmount("");
      setExpenseNotes("");
      setExpenseDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Failed to add expense:", error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

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
              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(tripPayments.reduce((sum, p) => sum + Number(p.amount), 0))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tripPayments.length} payment{tripPayments.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Expenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(expenses.reduce((sum, e) => sum + Number(e.amount), 0))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Net Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${
                      tripPayments.reduce((sum, p) => sum + Number(p.amount), 0) - expenses.reduce((sum, e) => sum + Number(e.amount), 0) >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(
                        tripPayments.reduce((sum, p) => sum + Number(p.amount), 0) -
                        expenses.reduce((sum, e) => sum + Number(e.amount), 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payments - Expenses
                    </p>
                  </CardContent>
                </Card>
              </div>

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
                            <path strokeLinecap="round" strokeLinejoin="width" strokeWidth={3} d="M5 13l4 4L19 7" />
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
                <Button size="sm" onClick={() => setShowAddParticipant(true)}>
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
                  Payments ({tripPayments.length})
                  {tripPayments.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      Total: {formatCurrency(tripPayments.reduce((sum, p) => sum + Number(p.amount), 0))}
                    </span>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowRecordPayment(true)}
                  disabled={participants.length === 0}
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
                          disabled={!paymentParticipantId || !paymentAmount || createPayment.isPending}
                        >
                          {createPayment.isPending ? "Recording..." : "Record Payment"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {tripPayments.length > 0 ? (
                  <div className="space-y-3">
                    {tripPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{payment.participant_name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.payment_date).toLocaleDateString()}
                            {payment.notes && (
                              <span>• {payment.notes}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            +{formatCurrency(payment.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
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
                <Button size="sm" onClick={() => setShowAddExpense(true)}>
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
                          onClick={handleAddExpense}
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
                        <div>
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
                        <div className="text-right">
                          <div className="font-medium text-destructive">
                            -{formatCurrency(expense.amount)}
                          </div>
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
    </div>
  );
}
