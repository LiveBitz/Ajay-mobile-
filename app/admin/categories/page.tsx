"use client";

import React, { useEffect, useState } from "react";
import { 
  Layers, 
  Image as ImageIcon, 
  Save, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  X,
  Star,
  Edit2,
  Search
} from "lucide-react";
import { getCategories, updateCategoryImage, createCategory, deleteCategory } from "@/lib/actions/category-actions";
import { toggleCategoryFeatured, updateCategoryFeaturedOrder } from "@/lib/actions/featured-category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Add category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleUpdateImage = async (id: string, newUrl: string) => {
    setUpdatingId(id);
    const result = await updateCategoryImage(id, newUrl);
    
    if (result.success) {
      toast({
        title: "Image Updated",
        description: "Category image has been updated successfully.",
      });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, image: newUrl } : c));
    } else {
      toast({
        title: "Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setUpdatingId(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const result = await createCategory(newCategoryName, newCategoryImage);
    
    if (result.success) {
      toast({
        title: "Category Created",
        description: `${newCategoryName} has been added successfully.`,
      });
      setCategories([...categories, result.category]);
      setNewCategoryName("");
      setNewCategoryImage("");
      setShowAddForm(false);
    } else {
      toast({
        title: "Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setIsCreating(false);
  };

  const handleDeleteCategory = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteCategory(id);
    
    if (result.success) {
      toast({
        title: "Category Deleted",
        description: `${categoryName} has been removed successfully.`,
      });
      setCategories(categories.filter(c => c.id !== id));
    } else {
      toast({
        title: "Error",
        description: result.error as string,
        variant: "destructive",
      });
    }
    setDeletingId(null);
  };

  const handleToggleFeatured = async (id: string) => {
    const result = await toggleCategoryFeatured(id);
    
    if (result.success) {
      toast({
        title: "Success",
        description: result.message,
      });
      setCategories(prev =>
        prev.map(c =>
          c.id === id ? { ...c, isFeatured: result.isFeatured } : c
        )
      );
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-zinc-500 font-bold text-sm">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-brand" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
              Categories Management
            </h1>
          </div>
          <p className="text-zinc-500 text-sm">
            Manage {categories.length} categories
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchCategories}
            className="h-10 rounded-lg gap-2"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-10 rounded-lg bg-brand hover:bg-brand/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Create New Category</h2>
            <button 
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-zinc-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">
                Category Name *
              </label>
              <Input 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Electronics, Fashion"
                className="h-10 rounded-lg border-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">
                Category Image (URL)
              </label>
              <Input 
                value={newCategoryImage}
                onChange={(e) => setNewCategoryImage(e.target.value)}
                placeholder="https://..."
                className="h-10 rounded-lg border-zinc-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button 
              onClick={handleAddCategory}
              disabled={isCreating || !newCategoryName.trim()}
              className="h-10 rounded-lg bg-brand hover:bg-brand/90 gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create
                </>
              )}
            </Button>
            <Button 
              onClick={() => setShowAddForm(false)}
              variant="outline"
              className="h-10 rounded-lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-0 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="font-semibold text-zinc-900 mb-4">
              {categories.length === 0 ? "No categories yet" : "No categories match your search"}
            </p>
            {categories.length === 0 && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="h-10 rounded-lg bg-brand hover:bg-brand/90 gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Category
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="py-3 px-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    Image
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    Featured
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    Created
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-bold text-zinc-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden">
                        {cat.image ? (
                          <img 
                            src={cat.image} 
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src = ""
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-zinc-900">{cat.name}</p>
                        <p className="text-xs text-zinc-500">{cat.slug}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeatured(cat.id)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold",
                          cat.isFeatured
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        )}
                      >
                        <Star className="w-3 h-3" />
                        {cat.isFeatured ? "Featured" : "Not Featured"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-zinc-600">
                      {new Date(cat.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditCategoryButton
                          category={cat}
                          onUpdate={handleUpdateImage}
                          isUpdating={updatingId === cat.id}
                        />
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="p-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function EditCategoryButton({ category, onUpdate, isUpdating }: { category: any, onUpdate: (id: string, url: string) => void, isUpdating: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [tempUrl, setTempUrl] = useState(category.image || "");

  return (
    <>
      <button
        onClick={() => {
          setTempUrl(category.image || "");
          setShowModal(true);
        }}
        className="p-2 hover:bg-blue-50 text-blue-600 hover:text-blue-700 rounded-lg transition-all"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-zinc-900">Edit {category.name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-zinc-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Image URL</label>
              <Input 
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://..."
                className="h-10 rounded-lg border-zinc-200"
              />
            </div>

            {tempUrl && (
              <div className="w-full h-32 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center">
                <img
                  src={tempUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).style.display = "none"
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button
                onClick={() => {
                  onUpdate(category.id, tempUrl);
                  setShowModal(false);
                }}
                disabled={isUpdating || tempUrl === category.image}
                className="h-10 rounded-lg bg-brand hover:bg-brand/90 gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="h-10 rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
