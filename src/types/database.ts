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
  | "software_tools"
  | "fb_ads"
  | "marketing"
  | "utility_bills"
  | "travel";

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
          estimated_cost: number;
          reserve_percentage: number;
          notes: string | null;
          total_advance_received: number;
          trip_reserve_balance: number;
          operating_account: number;
          business_account: number;
          released_profit: number;
          // Old fields kept for backward compatibility
          early_unlock_total: number;
          locked_advance_total: number;
          earned_revenue: number;
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
          estimated_cost?: number;
          reserve_percentage?: number;
          notes?: string | null;
          total_advance_received?: number;
          trip_reserve_balance?: number;
          operating_account?: number;
          business_account?: number;
          released_profit?: number;
          // Old fields kept for backward compatibility
          early_unlock_total?: number;
          locked_advance_total?: number;
          earned_revenue?: number;
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
          estimated_cost?: number;
          reserve_percentage?: number;
          notes?: string | null;
          total_advance_received?: number;
          trip_reserve_balance?: number;
          operating_account?: number;
          business_account?: number;
          released_profit?: number;
          early_unlock_total?: number;
          locked_advance_total?: number;
          earned_revenue?: number;
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
      transfers: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          transfer_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          transfer_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          transfer_date?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      global_transfers: {
        Row: {
          id: string;
          user_id: string;
          from_bucket: "profit_withdrawable" | "business_account" | "trip_balances" | "trip_reserves";
          to_bucket: "trip_balances" | "business_account";
          amount: number;
          notes: string | null;
          transfer_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_bucket: "profit_withdrawable" | "business_account" | "trip_balances" | "trip_reserves";
          to_bucket: "trip_balances" | "business_account";
          amount: number;
          notes?: string | null;
          transfer_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_bucket?: "profit_withdrawable" | "business_account" | "trip_balances" | "trip_reserves";
          to_bucket?: "trip_balances" | "business_account";
          amount?: number;
          notes?: string | null;
          transfer_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          user_id: string;
          trip_reserve_percentage: number;
          early_unlock_percentage: number;
          locked_percentage: number;
          minimum_operating_cash_threshold: number;
          minimum_trip_reserve_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_reserve_percentage?: number;
          early_unlock_percentage?: number;
          locked_percentage?: number;
          minimum_operating_cash_threshold?: number;
          minimum_trip_reserve_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trip_reserve_percentage?: number;
          early_unlock_percentage?: number;
          locked_percentage?: number;
          minimum_operating_cash_threshold?: number;
          minimum_trip_reserve_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      advance_payments: {
        Row: {
          id: string;
          trip_id: string;
          participant_id: string | null;
          amount: number;
          payment_date: string;
          trip_reserve_amount: number;
          operating_amount: number;
          business_amount: number;
          // Old fields kept for backward compatibility
          early_unlock_amount: number;
          locked_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          participant_id?: string | null;
          amount: number;
          payment_date?: string;
          trip_reserve_amount?: number;
          operating_amount?: number;
          business_amount?: number;
          // Old fields kept for backward compatibility
          early_unlock_amount?: number;
          locked_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          participant_id?: string | null;
          amount?: number;
          payment_date?: string;
          trip_reserve_amount?: number;
          early_unlock_amount?: number;
          locked_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_completion_logs: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          final_profit: number;
          reserve_released: number;
          trip_spend_released: number;
          business_account_released: number;
          total_advance_received: number;
          total_expenses: number;
          breakdown: Record<string, any> | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          final_profit: number;
          reserve_released: number;
          trip_spend_released: number;
          business_account_released?: number;
          total_advance_received: number;
          total_expenses: number;
          breakdown?: Record<string, any> | null;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          final_profit?: number;
          reserve_released?: number;
          trip_spend_released?: number;
          business_account_released?: number;
          total_advance_received?: number;
          total_expenses?: number;
          breakdown?: Record<string, any> | null;
          completed_at?: string;
          created_at?: string;
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

export type Transfer = Tables<"transfers">;
export type InsertTransfer = InsertTables<"transfers">;
export type UpdateTransfer = UpdateTables<"transfers">;

export type Settings = Tables<"settings">;
export type InsertSettings = InsertTables<"settings">;
export type UpdateSettings = UpdateTables<"settings">;

export type AdvancePayment = Tables<"advance_payments">;
export type InsertAdvancePayment = InsertTables<"advance_payments">;
export type UpdateAdvancePayment = UpdateTables<"advance_payments">;

export type TripCompletionLog = Tables<"trip_completion_logs">;
export type InsertTripCompletionLog = InsertTables<"trip_completion_logs">;
export type UpdateTripCompletionLog = UpdateTables<"trip_completion_logs">;
