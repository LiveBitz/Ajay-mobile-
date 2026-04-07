"use client"

import React, { useState } from "react";
import { 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Loader2,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddressFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ initialData, onSubmit, onCancel }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    street: initialData?.street || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zipCode: initialData?.zipCode || "",
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              {initialData ? "Edit Address" : "Add New Address"}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Fill in your delivery address details</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="rounded-lg hover:bg-zinc-100 h-8 w-8"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Phone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                Full Name
              </Label>
              <Input
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 rounded-lg border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-400" />
                Phone Number
              </Label>
              <Input
                required
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11 rounded-lg border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm"
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              Street Address
            </Label>
            <textarea
              required
              rows={3}
              placeholder="123 Main Street, Apt 4B"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full p-3 rounded-lg border border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm resize-none"
            />
          </div>

          {/* City, State, Zip Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                City
              </Label>
              <Input
                required
                placeholder="New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="h-11 rounded-lg border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">State</Label>
              <Input
                required
                placeholder="NY"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="h-11 rounded-lg border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm"
              />
            </div>

            {/* Zip Code */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">ZIP Code</Label>
              <Input
                required
                placeholder="10001"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="h-11 rounded-lg border-zinc-200 focus:border-brand/50 focus:ring-brand/10 text-sm"
              />
            </div>
          </div>

          {/* Set as Default Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <Checkbox 
              id="isDefault" 
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: !!checked })}
              className="rounded border-zinc-300"
            />
            <Label htmlFor="isDefault" className="text-sm text-zinc-700 cursor-pointer select-none">
              Set as default delivery address
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none gap-2 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold text-sm h-11 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                initialData ? "Update Address" : "Add Address"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 md:flex-none rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-50 font-medium text-sm h-11"
            >
              Cancel 
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
