"use client"

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Plus, 
  Loader2, 
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/components/profile/AddressCard";
import { AddressForm } from "@/components/profile/AddressForm";
import { 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from "@/lib/actions/address-actions";
import { useToast } from "@/hooks/use-toast";

export function AddressesManager() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not retrieve your addresses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await addAddress(data);
      setShowForm(false);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Address added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add address.",
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingAddress) return;
    try {
      await updateAddress(editingAddress.id, data);
      setEditingAddress(null);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Address updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update address.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Address deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete address.",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
      toast({
        title: "Success",
        description: "Default address updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update default address.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 md:px-8 py-6 md:py-8 border-b border-zinc-200 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <MapPin className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Delivery Addresses</h2>
            <p className="text-xs text-zinc-500 mt-1">{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
          </div>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 md:px-8 py-8">
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </div>
          )}

          {/* Addresses List */}
          {!loading && addresses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                {!showForm && !editingAddress && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gap-2 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold text-sm h-10 px-4"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </Button>
                )}
              </div>
              <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={(addr) => setEditingAddress(addr)}
                    onDelete={handleDelete}
                    onSetDefault={handleSetDefault}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && addresses.length === 0 && !showForm && !editingAddress && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-lg bg-zinc-100 flex items-center justify-center mx-auto">
                <MapPin className="w-7 h-7 text-zinc-300" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-zinc-900">No addresses yet</p>
                <p className="text-xs text-zinc-500">Add your first delivery address to get started</p>
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="gap-2 rounded-lg bg-brand hover:bg-brand/90 text-white font-semibold text-sm h-10 px-4"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(showForm || editingAddress) && (
            <div className="border-t border-zinc-200 pt-8">
              <AddressForm
                initialData={editingAddress}
                onSubmit={editingAddress ? handleUpdate : handleCreate}
                onCancel={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
