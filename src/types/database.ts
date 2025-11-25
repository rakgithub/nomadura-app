export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TripStatus =
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "activities"
  | "guide"
  | "equipment"
  | "permits"
  | "insurance"
  | "other";

export type BusinessExpenseCategory =
  | "rent"
  | "software"
  | "marketing"
  | "insurance"
  | "other";

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string;
          trip_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          amount_paid: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          amount_paid?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          amount_paid?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          participant_id: string;
          amount: number;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_id: string;
          amount: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string;
          amount?: number;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          trip_id: string;
          category: ExpenseCategory;
          description: string;
          amount: number;
          expense_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          category: ExpenseCategory;
          description: string;
          amount: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          category?: ExpenseCategory;
          description?: string;
          amount?: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      destinations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          destination: string | null;
          destination_id: string | null;
          start_date: string;
          end_date: string;
          status: TripStatus;
          min_participants: number | null;
          price_per_participant: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          destination?: string | null;
          destination_id?: string | null;
          start_date: string;
          end_date: string;
          status?: TripStatus;
          min_participants?: number | null;
          price_per_participant?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          destination?: string | null;
          destination_id?: string | null;
          start_date?: string;
          end_date?: string;
          status?: TripStatus;
          min_participants?: number | null;
          price_per_participant?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_expenses: {
        Row: {
          id: string;
          user_id: string;
          category: BusinessExpenseCategory;
          description: string;
          amount: number;
          expense_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: BusinessExpenseCategory;
          description: string;
          amount: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: BusinessExpenseCategory;
          description?: string;
          amount?: number;
          expense_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          withdrawal_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          withdrawal_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          withdrawal_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      trip_status: TripStatus;
      business_expense_category: BusinessExpenseCategory;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience types
export type Trip = Tables<"trips">;
export type InsertTrip = InsertTables<"trips">;
export type UpdateTrip = UpdateTables<"trips">;

export type Participant = Tables<"participants">;
export type InsertParticipant = InsertTables<"participants">;
export type UpdateParticipant = UpdateTables<"participants">;

export type Payment = Tables<"payments">;
export type InsertPayment = InsertTables<"payments">;
export type UpdatePayment = UpdateTables<"payments">;

export type Expense = Tables<"expenses">;
export type InsertExpense = InsertTables<"expenses">;
export type UpdateExpense = UpdateTables<"expenses">;

export type BusinessExpense = Tables<"business_expenses">;
export type InsertBusinessExpense = InsertTables<"business_expenses">;
export type UpdateBusinessExpense = UpdateTables<"business_expenses">;

export type Withdrawal = Tables<"withdrawals">;
export type InsertWithdrawal = InsertTables<"withdrawals">;
export type UpdateWithdrawal = UpdateTables<"withdrawals">;

export type Destination = Tables<"destinations">;
export type InsertDestination = InsertTables<"destinations">;
export type UpdateDestination = UpdateTables<"destinations">;
