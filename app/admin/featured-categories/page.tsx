"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Sparkles, 
  Settings2, 
  Trash2, 
  Loader2, 
  RefreshCw, 
  Plus, 
  ArrowUp,
  ArrowDown,
  Hash,
  Image as ImageIcon,
  AlertCircle,
  X,
  Layers,
  Check,
  Save,
  Search,
  ChevronRight,
  Eye,
  Box
} from "lucide-react";
import { 
  getFeaturedGroups, 
  createFeaturedGroup, 
  updateFeaturedGroup, 
  deleteFeaturedGroup 
} from "@/lib/actions/featured-category-actions";
import { getCategories } from "@/lib/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function FeaturedGroupsAdminPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Create Form State
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [groupsRes, catsRes] = await Promise.all([
      getFeaturedGroups(),
      getCategories()
    ]);
    
    if (groupsRes.success) setGroups(groupsRes.groups || []);
    setAllCategories(catsRes || []);
    setLoading(false);
  };

  const handleCreateGroup = async () => {
    if (!newName.trim()) {
      toast({ title: "Error", description: "Showcase name is required", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    const result = await createFeaturedGroup({
      name: newName,
      image: newImage,
      categoryIds: selectedCategoryIds
    });

    if (result.success) {
      toast({ title: "Success", description: "Master showcase group established." });
      setNewName("");
      setNewImage("");
      setSelectedCategoryIds([]);
      setActiveTab('manage');
      fetchData();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Retire "${name}" showcase section? This won't delete the categories themselves.`)) return;

    setDeletingId(id);
    const result = await deleteFeaturedGroup(id);
    
    if (result.success) {
      toast({ title: "Retired", description: "Showcase group removed successfully." });
      setGroups(groups.filter(g => g.id !== id));
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setDeletingId(null);
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    setUpdatingId(id);
    const result = await updateFeaturedGroup(id, { order: newOrder });
    if (result.success) {
      setGroups(prev => 
        prev.map(g => g.id === id ? { ...g, order: newOrder } : g)
            .sort((a, b) => a.order - b.order)
      );
    }
    setUpdatingId(null);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
           <Loader2 className="w-12 h-12 text-brand animate-spin" />
           <div className="absolute inset-0 bg-brand/10 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-zinc-900 font-black text-xs uppercase tracking-[0.3em]">Architecting Logic</p>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Fetching your masterpiece groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header with Visual Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-brand rounded-full" />
             <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter">
                Section <span className="text-brand">Showcases</span>
             </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-zinc-900">{groups.length}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-1">Active Groups</span>
            </div>
            <div className="w-px h-4 bg-zinc-100" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-zinc-900">
                {groups.reduce((acc, g) => acc + (g.categories?.length || 0), 0)}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-1">Total Collections Featured</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-100/50 p-2 rounded-[24px] border border-zinc-100 backdrop-blur-sm self-start">
            <button 
              onClick={() => setActiveTab('manage')}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'manage' ? "bg-white text-zinc-900 shadow-xl shadow-zinc-200" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Management Console
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={cn(
                "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all inline-flex items-center gap-2",
                activeTab === 'add' ? "bg-brand text-white shadow-xl shadow-brand/20" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              New Showcase
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'add' ? (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[48px] border border-zinc-100 p-10 shadow-2xl shadow-zinc-200/50 space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Identity</h2>
                  <Input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Premium Phones"
                    className="h-16 rounded-3xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all text-xl font-black px-8"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Hero Asset (URL)</h2>
                  <div className="relative">
                    <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
                    <Input 
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="h-16 rounded-3xl border-zinc-100 bg-zinc-50/50 focus:bg-white transition-all pl-16 pr-8 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <h2 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">Visual Picker</h2>
                  <span className="text-[10px] font-black text-brand bg-brand/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {selectedCategoryIds.length} Selected
                  </span>
                </div>
                <CategoryGridPicker 
                  availableCategories={allCategories} 
                  selectedIds={selectedCategoryIds}
                  onToggle={(id) => setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-zinc-50">
              <Button 
                onClick={handleCreateGroup}
                disabled={isCreating || !newName.trim()}
                className="h-16 px-16 rounded-3xl bg-zinc-900 border-0 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-zinc-300 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isCreating ? "Refining Data..." : "Deploy Showcase"}
              </Button>
              <button 
                onClick={() => setActiveTab('manage')}
                className="text-xs font-black text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-colors"
              >
                Abandon Creation
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="manage-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {groups.length === 0 ? (
               <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center border border-zinc-100 shadow-inner">
                    <Box className="w-10 h-10 text-zinc-200" />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight font-heading">Empty Stage</h3>
                    <p className="text-sm text-zinc-400 font-medium">No master showcased groups have been deployed. Switch to the 'New Showcase' tab to begin.</p>
                  </div>
               </div>
            ) : (
              groups.map((group, index) => (
                <ShowcaseCard 
                  key={group.id} 
                  group={group} 
                  index={index}
                  total={groups.length}
                  allCategories={allCategories}
                  onUpdate={fetchData}
                  onDelete={() => handleDeleteGroup(group.id, group.name)}
                  onUpdateOrder={(newOrder: number) => handleUpdateOrder(group.id, newOrder)}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CategoryGridPickerProps {
  availableCategories: any[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function CategoryGridPicker({ availableCategories, selectedIds, onToggle }: CategoryGridPickerProps) {
  const [search, setSearch] = useState("");
  
  const filtered = useMemo(() => {
    return availableCategories
      .filter(c => !c.parentId) // Only top-level categories
      .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableCategories, search]);

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within:text-brand transition-colors" />
        <input 
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 w-full pl-12 pr-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand/20 transition-all outline-none text-xs font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto p-1 custom-scrollbar">
        {filtered.map(cat => {
          const isSelected = selectedIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onToggle(cat.id)}
              className={cn(
                "group relative p-3 rounded-[20px] border-2 transition-all text-left flex items-center gap-3",
                isSelected 
                  ? "bg-zinc-900 border-zinc-900 shadow-xl shadow-zinc-200" 
                  : "bg-white border-zinc-50 hover:border-zinc-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border transition-all",
                isSelected ? "border-white/20 bg-white/10" : "border-zinc-100 bg-zinc-50"
              )}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <Layers className={cn("w-4 h-4", isSelected ? "text-white/40" : "text-zinc-300")} />
                )}
              </div>
              <div className="min-w-0">
                 <p className={cn("text-xs font-black tracking-tight truncate", isSelected ? "text-white" : "text-zinc-700")}>{cat.name}</p>
                 <p className={cn("text-[9px] font-bold uppercase tracking-widest truncate", isSelected ? "text-zinc-400" : "text-zinc-400")}>{cat.slug}</p>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-200">
                  <Check className="w-2.5 h-2.5 text-zinc-900" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ShowcaseCardProps {
  group: any;
  index: number;
  total: number;
  allCategories: any[];
  onUpdate: () => void;
  onDelete: () => void;
  onUpdateOrder: (newOrder: number) => void;
}

function ShowcaseCard({ group, index, total, allCategories, onUpdate, onDelete, onUpdateOrder }: ShowcaseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [image, setImage] = useState(group.image || "");
  const [categoryIds, setCategoryIds] = useState<string[]>(group.categories?.map((c: any) => c.id) || []);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    const result = await updateFeaturedGroup(group.id, {
      name,
      image,
      categoryIds
    });
    
    if (result.success) {
      toast({ title: "Updated", description: "Showcase configuration preserved." });
      onUpdate();
      setIsEditing(false);
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <motion.div 
      layout
      className="bg-white rounded-[40px] border border-zinc-100 shadow-xl shadow-zinc-200/20 overflow-hidden flex flex-col h-full group/card transition-all hover:shadow-2xl hover:shadow-zinc-200/50"
    >
      {/* Banner Area */}
      <div className="relative h-56 bg-zinc-100 overflow-hidden">
        {group.image ? (
          <img src={group.image} alt={group.name} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Sparkles className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
               Section #{index + 1}
             </span>
             <span className="text-[9px] font-black uppercase tracking-[0.3em] bg-brand text-white px-2 py-0.5 rounded-full">
               Active
             </span>
          </div>
          <h3 className="text-2xl font-black font-heading tracking-tight">{group.name}</h3>
        </div>
        
        {/* Order Controls overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
           <button 
             disabled={index === 0}
             onClick={() => onUpdateOrder(group.order - 1)}
             className="w-10 h-10 bg-white/90 backdrop-blur-lg rounded-xl flex items-center justify-center text-zinc-900 border border-white hover:bg-white transition-all disabled:opacity-30"
           >
             <ArrowUp className="w-4 h-4" />
           </button>
           <button 
             disabled={index === total - 1}
             onClick={() => onUpdateOrder(group.order + 1)}
             className="w-10 h-10 bg-white/90 backdrop-blur-lg rounded-xl flex items-center justify-center text-zinc-900 border border-white hover:bg-white transition-all disabled:opacity-30"
           >
             <ArrowDown className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Categories Content */}
      <div className="p-8 flex-1 flex flex-col space-y-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Linked Collections</h4>
            <span className="text-[10px] font-black text-zinc-600 font-heading">{group.categories?.length || 0} ITEMS</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.categories && group.categories.length > 0 ? (
              group.categories.map((cat: any) => (
                <div key={cat.id} className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-600 uppercase tracking-wider transition-colors hover:bg-zinc-100">
                  {cat.name}
                </div>
              ))
            ) : (
              <p className="text-[10px] text-zinc-300 font-bold italic py-2">No collections assigned yet.</p>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 pt-6 border-t border-zinc-50">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex-1 h-12 rounded-2xl border-zinc-100 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"
          >
            <Settings2 className="w-3.5 h-3.5 mr-2" />
            Config
          </Button>
          <Button
            variant="ghost"
            onClick={onDelete}
            className="w-12 h-12 rounded-2xl p-0 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Edit Modal / Slide-out */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[48px] max-w-4xl w-full p-12 space-y-12 border border-zinc-100 shadow-[0_0_100px_rgba(0,0,0,0.1)]"
            >
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">RECONFIGURE <span className="text-brand">SHOWCASE</span></h3>
                   <p className="text-zinc-400 font-bold text-xs uppercase tracking-widest mt-1">Refine your homepage aesthetics</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center hover:bg-zinc-100 transition-colors">
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Section Label</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="h-16 rounded-3xl bg-zinc-50 border-0 font-black text-xl px-8 focus:bg-white" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Hero Asset URL</label>
                      <Input value={image} onChange={(e) => setImage(e.target.value)} className="h-16 rounded-3xl bg-zinc-50 border-0 font-bold text-sm px-8 focus:bg-white" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Included Collections</label>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-brand/5">
                         <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
                         <span className="text-[9px] font-black text-brand uppercase tracking-tighter">{categoryIds.length} ACTIVE</span>
                      </div>
                    </div>
                    <CategoryGridPicker 
                      availableCategories={allCategories} 
                      selectedIds={categoryIds}
                      onToggle={(id) => setCategoryIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    />
                 </div>
              </div>

              <div className="flex items-center gap-4 pt-10 border-t border-zinc-50">
                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="h-16 px-16 rounded-3xl bg-zinc-900 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex-1 active:scale-95 transition-all flex items-center gap-3"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Architecting Content..." : "Commit Preferences"}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="h-16 px-10 rounded-3xl font-black text-xs uppercase tracking-widest border-zinc-100">
                  Discard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
