'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  DistributionResponse, 
  FamilyResponse, 
  DepotSummaryResponse, 
  AidCategory 
} from '@/lib/types';
import { AID_CATEGORIES, getItemNameAr, getUnitNameAr } from '@/lib/constants';
import { 
  Package, 
  Plus, 
  Search, 
  Warehouse, 
  Users, 
  Trash2, 
  RefreshCw, 
  X, 
  Clock, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

import { 
  useDistributionsQuery, 
  useCreateDistributionMutation, 
  useDeleteDistributionMutation, 
  useFamiliesQuery, 
  useDepotsQuery 
} from '@/hooks/queries';

export default function AdminDistributionsPage() {
  const { data: distributions = [], isLoading: isLoadingDist, refetch: refetchDistributions, isFetching: isRefreshing } = useDistributionsQuery();
  const { data: families = [], isLoading: isLoadingFamilies } = useFamiliesQuery();
  const { data: depots = [], isLoading: isLoadingDepots } = useDepotsQuery();
  const isLoading = isLoadingDist || isLoadingFamilies || isLoadingDepots;

  const createDistributionMutation = useCreateDistributionMutation();
  const deleteDistributionMutation = useDeleteDistributionMutation();

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDepot, setFilterDepot] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal states
  const [viewingDistribution, setViewingDistribution] = useState<DistributionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingDistribution, setDeletingDistribution] = useState<DistributionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [familyId, setFamilyId] = useState<string>('');
  const [depotId, setDepotId] = useState<string>('');
  const [category, setCategory] = useState<AidCategory>('FOOD');
  const [item, setItem] = useState<string>('Dry Food Ration Pack');
  const [quantity, setQuantity] = useState<number>(2);
  const [unit, setUnit] = useState<string>('BOXES');
  const [notes, setNotes] = useState<string>('تسليم حصة إغاثية عاجلة للعائلة');

  // Sync initial select defaults if empty
  useEffect(() => {
    if (families.length > 0 && !familyId) {
      setFamilyId(String(families[0].id));
    }
    if (depots.length > 0 && !depotId) {
      setDepotId(String(depots[0].id));
    }
  }, [families, depots, familyId, depotId]);

  // Close modals on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setViewingDistribution(null);
        setIsDeleting(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetForm = () => {
    if (families.length > 0) setFamilyId(String(families[0].id));
    if (depots.length > 0) setDepotId(String(depots[0].id));
    setCategory('FOOD');
    setItem('Dry Food Ration Pack');
    setQuantity(2);
    setUnit('BOXES');
    setNotes('تسليم حصة إغاثية عاجلة للعائلة');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createDistributionMutation.mutateAsync({
        familyId: Number(familyId) || (families[0]?.id ? families[0].id : 42),
        depotId: Number(depotId) || (depots[0]?.id ? Number(depots[0].id) : 4),
        category,
        item,
        quantity: Number(quantity) || 1,
        unit,
        notes: notes || undefined,
      });

      setIsModalOpen(false);
      resetForm();
    } catch {
      // Toast notification is handled in mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDistribution) return;
    setIsSubmitting(true);
    try {
      await deleteDistributionMutation.mutateAsync(deletingDistribution.id);
      setIsDeleting(false);
      setDeletingDistribution(null);
    } catch {
      // Toast notification is handled in mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDistributions = distributions.filter((d) => {
    const matchesDepot = filterDepot === 'all' || String(d.depotId) === filterDepot;
    const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
    const matchesSearch = 
      (d.headOfFamilyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.familyAidId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.item || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      getItemNameAr(d.item).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.depotName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepot && matchesCategory && matchesSearch;
  });

  const totalDeliveredItems = distributions.reduce((sum, d) => sum + (d.quantity || 0), 0);
  const uniqueFamiliesCount = new Set(distributions.map(d => d.familyId)).size;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              سجل التوزيع الميداني
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            سجل وتوثيق تسليم المساعدات للعائلات
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            توثيق شفاف لجميع الطرود والحصص الإغاثية المسلمة لرب كل أسرة وتفادي الازدواجية في الصرف
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchDistributions()} 
            disabled={isRefreshing}
            className="border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleOpenCreate}
            className="shadow-sm shadow-primary/20 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل توزيع جديد</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي عمليات الصرف</span>
          <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{distributions.length}</p>
          <span className="text-[11px] text-slate-400">عملية تسليم ميدانية مسجلة</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">العائلات المستفيدة</span>
          <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">{uniqueFamiliesCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">عائلة استلمت حصصها الميدانية</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الوحدات الموزعة</span>
          <p className="text-2xl font-mono font-black text-primary">{totalDeliveredItems.toLocaleString('ar-DZ')}</p>
          <span className="text-[11px] text-slate-400">طرد، فراش، كرتون وحزمة</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">المستودعات الفاعلة</span>
          <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">
            {new Set(distributions.map(d => d.depotId)).size}
          </p>
          <span className="text-[11px] text-slate-400">مراكز قامت بالصرف الميداني</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالعائلة، المادة، أو المستودع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pr-10 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Depot Filter */}
          <select
            value={filterDepot}
            onChange={(e) => setFilterDepot(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع المستودعات</option>
            {depots.map(d => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع الفئات</option>
            {AID_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.nameAr.split(' ')[0]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Distributions Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5 whitespace-nowrap">العائلة المستفيدة</th>
              <th className="py-4 px-5 whitespace-nowrap">المادة الموزعة</th>
              <th className="py-4 px-5 whitespace-nowrap">الكمية والمستودع</th>
              <th className="py-4 px-5 whitespace-nowrap text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 whitespace-nowrap">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  <span>جاري تحميل سجل التوزيع من الخادم...</span>
                </td>
              </tr>
            ) : filteredDistributions.length > 0 ? (
              filteredDistributions.map((dist) => {
                const arName = getItemNameAr(dist.item);
                const arUnit = getUnitNameAr(dist.unit);

                return (
                  <tr 
                    key={dist.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setViewingDistribution(dist)}
                  >
                    {/* Family */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block text-base group-hover:text-primary transition-colors">
                          {dist.headOfFamilyName || `عائلة #${dist.familyId}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-primary">
                          {dist.familyAidId || `ID: #${dist.familyId}`}
                        </span>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {arName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-slate-400">{dist.item}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary shrink-0">
                            {dist.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Quantity & Depot */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          {dist.quantity} <span className="text-xs text-slate-400 font-normal">{arUnit}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Warehouse className="w-3 h-3 text-primary shrink-0" />
                          <span>{dist.depotName || `مستودع #${dist.depotId}`}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingDistribution(dist)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingDistribution(dist);
                            setIsDeleting(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف قيد التوزيع"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  لا توجد عمليات توزيع مطابقة لمعايير البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewingDistribution && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setViewingDistribution(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {getItemNameAr(viewingDistribution.item)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                      {viewingDistribution.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">قيد توزيع #{viewingDistribution.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingDistribution(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Family & Depot Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] text-slate-400 block">العائلة المستفيدة:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewingDistribution.headOfFamilyName || `عائلة #${viewingDistribution.familyId}`}
                </p>
                <p className="text-xs font-mono font-bold text-primary">
                  {viewingDistribution.familyAidId || `ID: #${viewingDistribution.familyId}`}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] text-slate-400 block">المستودع المصدّر:</span>
                <Link 
                  href={`/depots/${viewingDistribution.depotId}`}
                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-primary flex items-center gap-1"
                >
                  <Warehouse className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{viewingDistribution.depotName || `مستودع #${viewingDistribution.depotId}`}</span>
                </Link>
                <p className="text-xs text-slate-400 font-mono">ID: #{viewingDistribution.depotId}</p>
              </div>
            </div>

            {/* Delivered Quantities & Date */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">الكمية المسلمة ميدانياً:</span>
                <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                  {viewingDistribution.quantity} {getUnitNameAr(viewingDistribution.unit)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">تاريخ وتوقيت التسليم:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {viewingDistribution.distributedAt ? new Date(viewingDistribution.distributedAt).toLocaleString('ar-DZ') : '—'}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات تسليم الحصة:</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {viewingDistribution.notes || 'لا توجد ملاحظات إضافية مسجلة لهذه العملية.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingDistribution(null)}
              >
                إغلاق
              </Button>

              <button
                onClick={() => {
                  const toDelete = viewingDistribution;
                  setViewingDistribution(null);
                  setDeletingDistribution(toDelete);
                  setIsDeleting(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف قيد التوزيع</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= RECORD NEW DISTRIBUTION MODAL ================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    تسجيل عملية تسليم وتوزيع ميداني
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    خصم وإثبات استلام الحصة في قاعدة البيانات الميدانية
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Family Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  العائلة المستفيدة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                >
                  {families.map(f => (
                    <option key={f.id} value={String(f.id)}>
                      {f.headOfFamilyName} ({f.aidId || `#${f.id}`} — {f.numberOfMembers} أفراد — {f.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Depot Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  المستودع المصدر للحصة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={depotId}
                  onChange={(e) => setDepotId(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                >
                  {depots.map(d => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name} ({d.location?.wilaya})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  الفئة الإغاثية <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AidCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                >
                  {AID_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.nameAr}</option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  اسم المادة أو الطرد المسلم <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="مثال: Dry Food Ration Pack أو Thermal Winter Wool Blanket"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>

              {/* Quantity & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الكمية المسلمة <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الوحدة <span className="text-rose-500">*</span></label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="BOXES">BOXES (طرد)</option>
                    <option value="PIECES">PIECES (قطعة / بطانية / فراش)</option>
                    <option value="PACKS">PACKS (حزمة)</option>
                    <option value="TINS">TINS (علبة حليب)</option>
                    <option value="KITS">KITS (حقيبة)</option>
                    <option value="TENTS">TENTS (خيمة)</option>
                    <option value="UNITS">UNITS (وحدة)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ملاحظات التسليم والاستلام</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تم التسليم شخصياً لرب الأسرة في مركز الإيواء..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="px-6 font-bold"
                >
                  {isSubmitting ? 'جاري التسجيل...' : 'تسجيل التوزيع فوراً'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleting && deletingDistribution && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setIsDeleting(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تأكيد حذف قيد التوزيع</h3>
                <p className="text-xs text-slate-500">سيتم حذف هذا السجل نهائياً من قاعدة البيانات</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف عملية توزيع <strong className="text-rose-600 font-bold">{getItemNameAr(deletingDistribution.item)}</strong> ({deletingDistribution.quantity} {getUnitNameAr(deletingDistribution.unit)}) المسجلة للعائلة ({deletingDistribution.headOfFamilyName || deletingDistribution.familyId})؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleting(false);
                  setDeletingDistribution(null);
                }}
              >
                تراجع
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف القيد'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
