"use client"

import React from "react";
import { MapPin, Phone, User, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AddressCardProps {
  address: any;
  onEdit: (address: any) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <div
      className="p-5 md:p-6 rounded-2xl border transition-all"
      style={address.isDefault
        ? { borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.04)" }
        : { borderColor: "#e4e4e7", backgroundColor: "#ffffff" }
      }
    >
      {/* Content */}
      <div className="space-y-4">
        {/* Name and Phone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" />
            <p className="font-bold text-sm text-zinc-900">
              {address.name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            {address.phone}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
            <div className="text-sm text-zinc-700 leading-relaxed">
              <p className="font-medium">{address.street}</p>
              <p className="text-xs text-zinc-500">{address.city}, {address.state} — {address.zipCode}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            className="gap-2 rounded-lg h-8 px-3 text-zinc-600 hover:text-red-600 hover:bg-red-50"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Edit</span>
          </Button>
          
          {!address.isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSetDefault(address.id)}
              className="gap-2 rounded-lg h-8 px-3 text-emerald-600 hover:bg-emerald-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Default</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            className="gap-2 rounded-lg h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
