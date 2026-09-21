'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { NeedResponse, DepotSummaryResponse, AidCategory, Priority, NeedStatus } from '@/lib/types';
import { AID_CATEGORIES, getItemNameAr, getUnitNameAr, PRIORITY_LABELS } from '@/lib/constants';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Warehouse, 
  AlertCircle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  FileText,
  AlertTriangle,
  ChevronLeft,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import { 
  useNeedsQuery, 
  useDepotsQuery, 
  useCreateNeedMutation, 
  useUpdateNeedMutation, 
  useDeleteNeedMutation 
} from '@/hooks/queries';

export default function AdminNeedsPage() {
  const { data: needs = [], isLoading: isLoadingNeeds, refetch: refetchNeeds, isFetching: isRefreshing } = useNeedsQuery();
  const { data: depots = [], isLoading: isLoadingDepots } = useDepotsQuery();
  const isLoading = isLoadingNeeds || isLoadingDepots;

  const createNeedMutation = useCreateNeedMutation();
  const updateNeedMutation = useUpdateNeedMutation();
  const deleteNeedMutation = useDeleteNeedMutation();

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepot, setFilterDepot] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [viewingNeed, setViewingNeed] = useState<NeedResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingNeedId, setEditingNeedId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingNeed, setDeletingNeed] = useState<NeedResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [depotId, setDepotId] = useState<string>('');
  const [category, setCategory] = useState<AidCategory>('FOOD');
  const [itemName, setItemName] = useState<string>('');
  const [requestedQuantity, setRequestedQuantity] = useState<number>(1000);
  const [currentAvailableQuantity, setCurrentAvailableQuantity] = useState<number>(0);
  const [unit, setUnit] = useState<string>('PACKS');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [status, setStatus] = useState<NeedStatus>('OPEN');
  const [notes, setNotes] = useState<string>('');

  // Close modals on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setViewingNeed(null);
        setIsDeleting(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetForm = () => {
    setItemName('');
    setRequestedQuantity(1000);
    setCurrentAvailableQuantity(0);
    setUnit('PACKS');
    setCategory('FOOD');
    setPriority('HIGH');
    setStatus('OPEN');
    setNotes('');
    setIsEditing(false);
    setEditingNeedId(null);
    if (depots.length > 0) setDepotId(String(depots[0].id));
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (need: NeedResponse) => {
    resetForm();
    setIsEditing(true);
    setEditingNeedId(need.id);
    setDepotId(String(need.depotId));
    setCategory(need.category);
    setItemName(need.itemName);
    setRequestedQuantity(need.requestedQuantity);
    setCurrentAvailableQuantity(need.currentAvailableQuantity || 0);
    setUnit(need.unit);
    setPriority(need.priority);
    setStatus(need.status || 'OPEN');
    setNotes(need.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && editingNeedId) {
        await updateNeedMutation.mutateAsync({
          id: editingNeedId,
          data: {
            requestedQuantity: Number(requestedQuantity),
            currentAvailableQuantity: Number(currentAvailableQuantity),
            unit,
            priority,
            status,
            notes: notes || undefined,
          },
        });
      } else {
        await createNeedMutation.mutateAsync({
          depotId: Number(depotId) || Number(depots[0]?.id) || 4,
          category,
          itemName,
          requestedQuantity: Number(requestedQuantity),
          currentAvailableQuantity: Number(currentAvailableQuantity),
          unit,
          priority,
          notes: notes || undefined,
        });
      }

      setIsModalOpen(false);
      resetForm();
    } catch {
      // Toast notification is handled in mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNeed) return;
    setIsSubmitting(true);
    try {
      await deleteNeedMutation.mutateAsync(deletingNeed.id);
      setIsDeleting(false);
      setDeletingNeed(null);
    } catch {
      // Toast notification is handled in mutation hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered needs
  const filteredNeeds = needs.filter((n) => {
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || n.priority === filterPriority;
    const matchesDepot = filterDepot === 'all' || String(n.depotId) === filterDepot;
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    const matchesSearch = 
      n.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getItemNameAr(n.itemName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.depotName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPriority && matchesDepot && matchesStatus && matchesSearch;
  });

  const totalDeficitsCount = needs.filter(n => n.shortage > 0).length;
  const criticalCount = needs.filter(n => n.priority === 'CRITICAL').length;
  const totalShortageQuantity = needs.reduce((sum, n) => sum + (n.shortage > 0 ? n.shortage : 0), 0);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              إدارة الاحتياجات والنواقص
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            سجل الاحتياجات والمطالب الميدانية
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تسجيل وحصر النواقص والعجز التقديري في المواد وتحديث مستويات الإلحاح في الوقت الحقيقي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchNeeds()} 
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
            <span>تسجيل احتياج جديد</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الطلبات المسجلة</span>
          <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{needs.length}</p>
          <span className="text-[11px] text-slate-400">عبر جميع المستودعات النشطة</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">طلبات ذات أولوية حرجة</span>
          <p className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400">{criticalCount}</p>
          <span className="text-[11px] text-rose-500 font-medium">تتطلب تدخلاً عاجلاً</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">المواد التي تعاني من عجز</span>
          <p className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">{totalDeficitsCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">الكمية المتوفرة أقل من المطلوب</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">حجم العجز التراكمي</span>
          <p className="text-2xl font-mono font-black text-primary">
            {totalShortageQuantity.toLocaleString('ar-DZ')}
          </p>
          <span className="text-[11px] text-slate-400">وحدة إجمالية مطلوبة للتغطية</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالصنف، المستودع، أو الملاحظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pr-10 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
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

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع الأولويات</option>
            <option value="CRITICAL">حرج جداً</option>
            <option value="HIGH">أولوية قصوى</option>
            <option value="MEDIUM">متوسط</option>
            <option value="LOW">مستقر</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع الحالات</option>
            <option value="OPEN">مفتوح للتبرع</option>
            <option value="PARTIALLY_FULFILLED">مغطى جزئياً</option>
            <option value="FULFILLED">مكتمل التغطية</option>
          </select>
        </div>
      </div>

      {/* Needs Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5 whitespace-nowrap">المادة والصنف</th>
              <th className="py-4 px-5 whitespace-nowrap">المستودع المستفيد</th>
              <th className="py-4 px-5 whitespace-nowrap">العجز والأولوية</th>
              <th className="py-4 px-5 whitespace-nowrap text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 whitespace-nowrap">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  <span>جاري تحميل سجل الاحتياجات من الخادم...</span>
                </td>
              </tr>
            ) : filteredNeeds.length > 0 ? (
              filteredNeeds.map((need) => {
                const arName = getItemNameAr(need.itemName);
                const arUnit = getUnitNameAr(need.unit);
                const isDeficit = need.shortage > 0;
                const priorityMeta = PRIORITY_LABELS[need.priority] || { label: need.priority, color: 'slate' };

                return (
                  <tr 
                    key={need.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setViewingNeed(need)}
                  >
                    {/* Item Name & Category */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block text-base leading-snug group-hover:text-primary transition-colors">
                          {arName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-slate-400">{need.itemName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary shrink-0">
                            {need.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Depot Name */}
                    <td className="py-4 px-5 text-xs whitespace-nowrap">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Warehouse className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{need.depotName || `مستودع #${need.depotId}`}</span>
                      </div>
                    </td>

                    {/* Deficit & Priority */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isDeficit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                            <span>عجز {need.shortage} {arUnit}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 whitespace-nowrap shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مكتفي</span>
                          </span>
                        )}

                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 ${
                          need.priority === 'CRITICAL' 
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : need.priority === 'HIGH'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        }`}>
                          {priorityMeta.label}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingNeed(need)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(need)}
                          className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          title="تعديل الاحتياج"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingNeed(need);
                            setIsDeleting(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف الاحتياج"
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
                  لا توجد طلبات احتياج مطابقة للفلاتر المحددة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewingNeed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
          onClick={() => setViewingNeed(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {getItemNameAr(viewingNeed.itemName)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                      {viewingNeed.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{viewingNeed.itemName}</span>
                    <span className="text-xs font-mono text-slate-400">ID: #{viewingNeed.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingNeed(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Depot & Priority Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">المستودع المحتاج:</span>
                <Link 
                  href={`/depots/${viewingNeed.depotId}`}
                  className="font-bold text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Warehouse className="w-4 h-4" />
                  <span>{viewingNeed.depotName || `مستودع #${viewingNeed.depotId}`}</span>
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">درجة الأولوية:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  viewingNeed.priority === 'CRITICAL' 
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    : viewingNeed.priority === 'HIGH'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                }`}>
                  {PRIORITY_LABELS[viewingNeed.priority]?.label || viewingNeed.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">حالة التغطية:</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {viewingNeed.status === 'FULFILLED' ? 'مكتمل التغطية' : viewingNeed.status === 'PARTIALLY_FULFILLED' ? 'مغطى جزئياً' : 'مفتوح للتبرع والدعم'}
                </span>
              </div>
            </div>

            {/* Quantities & Fulfillment Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">ميزانية المخزون والاحتياج</h4>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-0.5">المطلوب</span>
                  <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                    {viewingNeed.requestedQuantity}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{getUnitNameAr(viewingNeed.unit)}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mb-0.5">المتوفر</span>
                  <span className="text-base font-mono font-black text-emerald-700 dark:text-emerald-300">
                    {viewingNeed.currentAvailableQuantity || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{getUnitNameAr(viewingNeed.unit)}</span>
                </div>

                <div className={`p-3 rounded-2xl border ${
                  viewingNeed.shortage > 0 
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' 
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800'
                }`}>
                  <span className={`text-[11px] block mb-0.5 ${viewingNeed.shortage > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}`}>
                    العجز الفعلي
                  </span>
                  <span className={`text-base font-mono font-black ${viewingNeed.shortage > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                    {viewingNeed.shortage}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{getUnitNameAr(viewingNeed.unit)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-mono text-slate-500">
                  <span>نسبة استيفاء الاحتياج</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Math.min(100, Math.round(((viewingNeed.currentAvailableQuantity || 0) / (viewingNeed.requestedQuantity || 1)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${viewingNeed.shortage > 0 ? 'bg-rose-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, Math.round(((viewingNeed.currentAvailableQuantity || 0) / (viewingNeed.requestedQuantity || 1)) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات الميدان والمسوّغات:</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {viewingNeed.notes || 'لا توجد ملاحظات ميدانية مسجلة لهذا الاحتياج.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingNeed(null)}
              >
                إغلاق
              </Button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toDelete = viewingNeed;
                    setViewingNeed(null);
                    setDeletingNeed(toDelete);
                    setIsDeleting(true);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الاحتياج</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingNeed;
                    setViewingNeed(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل الاحتياج</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT NEED MODAL ================= */}
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
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isEditing ? `تعديل طلب الاحتياج (#${editingNeedId})` : 'تسجيل طلب احتياج جديد'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    تحديث مباشر في قاعدة بيانات الميدان
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
              
              {/* Target Depot */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  المستودع المحتاج <span className="text-rose-500">*</span>
                </label>
                <select
                  value={depotId}
                  onChange={(e) => setDepotId(e.target.value)}
                  disabled={isEditing}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                >
                  {depots.map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name} ({d.location?.wilaya})</option>
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
                  disabled={isEditing}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                >
                  {AID_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.nameAr}</option>
                  ))}
                </select>
              </div>

              {/* Item Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  اسم المادة أو الصنف (بالإنجليزية) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="مثال: Bottled Mineral Water 1.5L Packs"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>

              {/* Quantities & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الكمية المطلوبة <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">المتوفر حالياً</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAvailableQuantity}
                    onChange={(e) => setCurrentAvailableQuantity(Number(e.target.value))}
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
                    <option value="PACKS">PACKS (حزمة)</option>
                    <option value="PIECES">PIECES (قطعة)</option>
                    <option value="BOXES">BOXES (طرد)</option>
                    <option value="CANS">CANS (علبة)</option>
                    <option value="KITS">KITS (حقيبة)</option>
                    <option value="TENTS">TENTS (خيمة)</option>
                    <option value="CARTONS">CARTONS (كرتون)</option>
                    <option value="UNITS">UNITS (وحدة)</option>
                  </select>
                </div>
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">درجة الإلحاح والأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="CRITICAL">حرج جداً (CRITICAL)</option>
                    <option value="HIGH">أولوية قصوى (HIGH)</option>
                    <option value="MEDIUM">متوسط (MEDIUM)</option>
                    <option value="LOW">مستقر (LOW)</option>
                  </select>
                </div>

                {isEditing && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">حالة الطلب</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as NeedStatus)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="OPEN">مفتوح للتبرع (OPEN)</option>
                      <option value="PARTIALLY_FULFILLED">مغطى جزئياً (PARTIALLY)</option>
                      <option value="FULFILLED">مكتمل التغطية (FULFILLED)</option>
                      <option value="CLOSED">مغلق (CLOSED)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Field Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">ملاحظات التوجيه الميداني</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سبب العجز، المراكز المستهدفة، أو تعليمات خاصة للسائقين..."
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
                  {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'تحديث الاحتياج' : 'تسجيل الاحتياج'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleting && deletingNeed && (
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
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تأكيد حذف طلب الاحتياج</h3>
                <p className="text-xs text-slate-500">سيتم حذف هذا الطلب نهائياً من قاعدة البيانات</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف طلب <strong className="text-rose-600 font-bold">{getItemNameAr(deletingNeed.itemName)}</strong> المسجل لمستودع {deletingNeed.depotName || deletingNeed.depotId}؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleting(false);
                  setDeletingNeed(null);
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
                {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف الاحتياج'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
