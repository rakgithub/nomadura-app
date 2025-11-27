"use client";

import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error";
import { AlertCircle, Save, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();

  const [tripReserve, setTripReserve] = useState(60);
  const [earlyUnlock, setEarlyUnlock] = useState(20);
  const [locked, setLocked] = useState(20);
  const [minOperatingCash, setMinOperatingCash] = useState(0);
  const [minTripReserve, setMinTripReserve] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (settings) {
      setTripReserve(settings.trip_reserve_percentage);
      setEarlyUnlock(settings.early_unlock_percentage);
      setLocked(settings.locked_percentage);
      setMinOperatingCash(settings.minimum_operating_cash_threshold);
      setMinTripReserve(settings.minimum_trip_reserve_threshold);
    }
  }, [settings]);

  const total = tripReserve + earlyUnlock + locked;
  const isValid = total === 100;

  const handleSave = async () => {
    if (!isValid) {
      setValidationError(`Percentages must sum to 100%. Current sum: ${total}%`);
      return;
    }

    setValidationError("");

    try {
      await updateSettings.mutateAsync({
        trip_reserve_percentage: tripReserve,
        early_unlock_percentage: earlyUnlock,
        locked_percentage: locked,
        minimum_operating_cash_threshold: minOperatingCash,
        minimum_trip_reserve_threshold: minTripReserve,
      });
    } catch (err: any) {
      setValidationError(err.message || "Failed to save settings");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <ErrorDisplay message="Failed to load settings" retry={refetch} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure advance money split and financial thresholds
          </p>
        </div>

        {/* Advance Split Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>Advance Money Split</CardTitle>
            </div>
            <CardDescription>
              Configure how customer advances are automatically split into reserves, early unlock, and locked portions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Reserve */}
            <div className="space-y-2">
              <Label htmlFor="trip-reserve">
                Trip Reserve Percentage
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="trip-reserve"
                  type="number"
                  min="0"
                  max="100"
                  value={tripReserve}
                  onChange={(e) => setTripReserve(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <span className="text-2xl font-bold">{tripReserve}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Protected funds reserved exclusively for trip expenses
              </p>
            </div>

            {/* Early Unlock */}
            <div className="space-y-2">
              <Label htmlFor="early-unlock">
                Available Now
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="early-unlock"
                  type="number"
                  min="0"
                  max="100"
                  value={earlyUnlock}
                  onChange={(e) => setEarlyUnlock(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <span className="text-2xl font-bold">{earlyUnlock}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Portion moved to Operating Account immediately for business expenses
              </p>
              {earlyUnlock > 40 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    High unlock percentage ({earlyUnlock}%) may leave too little for trip expenses
                  </p>
                </div>
              )}
            </div>

            {/* Locked */}
            <div className="space-y-2">
              <Label htmlFor="locked">
                Locked Percentage
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="locked"
                  type="number"
                  min="0"
                  max="100"
                  value={locked}
                  onChange={(e) => setLocked(parseInt(e.target.value) || 0)}
                  className="w-32"
                />
                <span className="text-2xl font-bold">{locked}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Remains locked until trip completion, then converts to earned revenue
              </p>
            </div>

            {/* Total Validation */}
            <div className={`p-4 rounded-md border ${
              isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className={`text-2xl font-bold ${
                  isValid ? "text-green-600" : "text-red-600"
                }`}>
                  {total}%
                </span>
              </div>
              {!isValid && (
                <p className="text-xs text-red-600 mt-2">
                  Percentages must sum to exactly 100%
                </p>
              )}
            </div>

            {/* Example Breakdown */}
            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-3">Example: ₹15,000 advance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Trip Reserve ({tripReserve}%)</span>
                  <span className="font-medium">{formatCurrency((15000 * tripReserve) / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Early Unlock ({earlyUnlock}%)</span>
                  <span className="font-medium">{formatCurrency((15000 * earlyUnlock) / 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locked ({locked}%)</span>
                  <span className="font-medium">{formatCurrency((15000 * locked) / 100)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threshold Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Threshold Alerts</CardTitle>
            <CardDescription>
              Get warnings when balances fall below these thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="min-operating">
                Minimum Operating Cash Threshold
              </Label>
              <Input
                id="min-operating"
                type="number"
                min="0"
                step="1000"
                value={minOperatingCash}
                onChange={(e) => setMinOperatingCash(parseFloat(e.target.value) || 0)}
                className="w-64"
              />
              <p className="text-xs text-muted-foreground">
                Warn when Operating Account falls below {formatCurrency(minOperatingCash)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-trip-reserve">
                Minimum Trip Reserve Threshold
              </Label>
              <Input
                id="min-trip-reserve"
                type="number"
                min="0"
                step="1000"
                value={minTripReserve}
                onChange={(e) => setMinTripReserve(parseFloat(e.target.value) || 0)}
                className="w-64"
              />
              <p className="text-xs text-muted-foreground">
                Warn when any trip reserve falls below {formatCurrency(minTripReserve)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {validationError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{validationError}</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!isValid || updateSettings.isPending}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {updateSettings.isSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Settings saved successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}
