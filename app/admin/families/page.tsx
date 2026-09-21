'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FamilyResponse, FamilyStatus } from '@/lib/types';
import { ALGERIAN_DISASTER_WILAYAS } from '@/lib/constants';
import { 
  Users, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Home, 
  HeartHandshake, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminFamiliesPage() {
  const [families, setFamilies] = useState<FamilyResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWilaya, setFilterWilaya] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [viewingFamily, setViewingFamily] = useState<FamilyResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingFamilyId, setEditingFamilyId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingFamily, setDeletingFamily] = useState<FamilyResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form fields
  const [customId, setCustomId] = useState<number | ''>('');
  const [headOfFamilyName, setHeadOfFamilyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [numberOfMembers, setNumberOfMembers] = useState<number>(4);
  const [wilaya, setWilaya] = useState<string>('Jijel');
  const [commune, setCommune] = useState<string>('Taher');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<FamilyStatus>('AFFECTED_DISPLACED');
  const [notes, setNotes] = useState<string>('');

  const fetchFamilies = async () => {
    try {
      setIsRefreshing(true);
      const list = await api.families.list();
      setFamilies(list || []);
    } catch (err: any) {
      console.warn('[Admin Families] Error fetching families:', err);
      toast.error('تعذر جلب سجل العائلات من الخادم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const resetForm = () => {
    const nextSuggestedId = families.length > 0 
      ? Math.max(...families.map(f => f.id || 0)) + 1 
      : 101;
    setCustomId(nextSuggestedId);
    setHeadOfFamilyName('');
    setPhone('');
    setNumberOfMembers(4);
    setWilaya('Jijel');
    setCommune('Taher');
    setLocation('');
    setStatus('AFFECTED_DISPLACED');
    setNotes('');
    setIsEditing(false);
    setEditingFamilyId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (family: FamilyResponse) => {
    setIsEditing(true);
    setEditingFamilyId(family.id);
    setCustomId(family.id);
    setHeadOfFamilyName(family.headOfFamilyName);
    setPhone(family.phone || '');
    setNumberOfMembers(family.numberOfMembers || 4);
    setWilaya(family.wilaya || 'Jijel');
    setCommune(family.commune || 'Taher');
    setLocation(family.location || '');
    setStatus(family.status || 'AFFECTED_DISPLACED');
    setNotes(String(family.notes || ''));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const familyIdToUse = Number(customId) || (
      families.length > 0 ? Math.max(...families.map(f => f.id || 0)) + 1 : 101
    );

    const payload = {
      id: familyIdToUse,
      headOfFamilyName,
      phone: phone || undefined,
      numberOfMembers: Number(numberOfMembers) || 1,
      wilaya,
      commune,
      location: location || 'مركز إيواء مؤقت',
      status,
      notes: notes || undefined,
    };

    try {
      if (isEditing && editingFamilyId) {
        await api.families.update(editingFamilyId, payload);
        toast.success(`تم تحديث بيانات العائلة (${headOfFamilyName}) بنجاح!`);
      } else {
        await api.families.create(payload);
        toast.success(`تم تسجيل العائلة المتضررة (${headOfFamilyName}) بنجاح في قاعدة البيانات!`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchFamilies();
    } catch (err: any) {
      console.warn('[Admin Families] Submit error:', err);
      toast.error('حدث خطأ أثناء حفظ بيانات العائلة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFamily) return;
    setIsSubmitting(true);
    try {
      await api.families.delete(deletingFamily.id);
      toast.success(`تم حذف سجل العائلة (${deletingFamily.headOfFamilyName}) بنجاح`);
      setIsDeleting(false);
      setDeletingFamily(null);
      fetchFamilies();
    } catch (err: any) {
      console.warn('[Admin Families] Delete error:', err);
      toast.error('تعذر حذف سجل العائلة من الخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFamilies = families.filter((f) => {
    const matchesWilaya = filterWilaya === 'all' || f.wilaya === filterWilaya;
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchesSearch = 
      f.headOfFamilyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.aidId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.commune || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWilaya && matchesStatus && matchesSearch;
  });

  const totalMembers = families.reduce((sum, f) => sum + (f.numberOfMembers || 0), 0);
  const displacedCount = families.filter(f => f.status === 'AFFECTED_DISPLACED').length;
  const shelteredCount = families.filter(f => f.status === 'SHELTERED').length;

  const getStatusBadge = (s: FamilyStatus) => {
    switch (s) {
      case 'AFFECTED_DISPLACED':
        return { label: 'متضرر / نازح', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900' };
      case 'SHELTERED':
        return { label: 'في مركز إيواء', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900' };
      case 'SUPPORTED':
        return { label: 'استلم الدعم الأولي', color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' };
      default:
        return { label: s, color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              إدارة العائلات المتضررة
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            سجل العائلات المتضررة والمستفيدة
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تسجيل العائلات النازحة في مراكز الإيواء وتحديث احتياجاتهم ومتابعة حصص التوزيع
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchFamilies} 
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
            <span>تسجيل عائلة جديدة</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي العائلات المسجلة</span>
          <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{families.length}</p>
          <span className="text-[11px] text-slate-400">ملفات إغاثة معتمدة</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">إجمالي الأفراد المستفيدين</span>
          <p className="text-2xl font-mono font-black text-primary">{totalMembers}</p>
          <span className="text-[11px] text-slate-400">فرداً في مراكز ومخيمات الإيواء</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">عائلات نازحة بحاجة لإيواء</span>
          <p className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400">{displacedCount}</p>
          <span className="text-[11px] text-rose-500 font-medium">أولوية في الخيام والأفرشة</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">عائلات في مراكز مهيأة</span>
          <p className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">{shelteredCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">مدارس ومراكز شبابية</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث باسم رب الأسرة، كود الإغاثة، أو الموقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pr-10 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Wilaya Filter */}
          <select
            value={filterWilaya}
            onChange={(e) => setFilterWilaya(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع الولايات</option>
            {Array.from(new Set(families.map(f => f.wilaya).filter(Boolean))).map(w => (
              <option key={w} value={w}>ولاية {w}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary transition-colors"
          >
            <option value="all">جميع الحالات</option>
            <option value="AFFECTED_DISPLACED">متضرر / نازح</option>
            <option value="SHELTERED">في مركز إيواء</option>
            <option value="SUPPORTED">استلم الدعم الأولي</option>
          </select>
        </div>
      </div>

      {/* Families Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5 whitespace-nowrap">رب الأسرة والكود</th>
              <th className="py-4 px-5 whitespace-nowrap">الموقع والولاية</th>
              <th className="py-4 px-5 whitespace-nowrap">الحالة الإنسانية</th>
              <th className="py-4 px-5 whitespace-nowrap text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 whitespace-nowrap">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  <span>جاري تحميل سجل العائلات من الخادم...</span>
                </td>
              </tr>
            ) : filteredFamilies.length > 0 ? (
              filteredFamilies.map((fam) => {
                const statusMeta = getStatusBadge(fam.status);

                return (
                  <tr 
                    key={fam.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setViewingFamily(fam)}
                  >
                    {/* Head of Family */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white block text-base group-hover:text-primary transition-colors">
                          {fam.headOfFamilyName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-primary">
                            {fam.aidId || `AID-DZ-2026-00${fam.id}`}
                          </span>
                          <span className="text-[11px] px-2 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                            {fam.numberOfMembers} أفراد
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Shelter / Location */}
                    <td className="py-4 px-5 text-xs whitespace-nowrap">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>ولاية {fam.wilaya} — بلدية {fam.commune}</span>
                        </p>
                        <p className="text-slate-400 truncate max-w-xs">{fam.location}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingFamily(fam)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(fam)}
                          className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          title="تعديل بيانات العائلة"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingFamily(fam);
                            setIsDeleting(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف السجل"
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
                  لا توجد عائلات مسجلة مطابقة لمعايير البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewingFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {viewingFamily.headOfFamilyName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-primary">
                      {viewingFamily.aidId || `AID-DZ-2026-00${viewingFamily.id}`}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: #{viewingFamily.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingFamily(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Member Count Banner */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-400 block mb-1">الحالة الإنسانية:</span>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(viewingFamily.status).color}`}>
                  {getStatusBadge(viewingFamily.status).label}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] text-slate-400 block mb-1">عدد أفراد العائلة:</span>
                <span className="text-base font-mono font-black text-slate-900 dark:text-white">
                  {viewingFamily.numberOfMembers} <span className="text-xs font-normal text-slate-400">أفراد</span>
                </span>
              </div>
            </div>

            {/* Contact & Location Info */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">الولاية والبلدية:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ولاية {viewingFamily.wilaya} — بلدية {viewingFamily.commune}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">الموقع ومركز الإيواء:</span>
                <span className="font-bold text-slate-900 dark:text-white text-left">
                  {viewingFamily.location || '—'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">رقم هاتف التواصل:</span>
                {viewingFamily.phone ? (
                  <a 
                    href={`tel:${viewingFamily.phone}`} 
                    className="font-mono font-bold text-primary hover:underline flex items-center gap-1"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{viewingFamily.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="font-medium text-slate-500 dark:text-slate-400">حصص الإغاثة المستلمة:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {viewingFamily.totalDistributionsReceived || 0} حصص مسجلة
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ملاحظات الحالة والاحتياجات الخاصة:</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {viewingFamily.notes ? String(viewingFamily.notes) : 'لا توجد ملاحظات إضافية مسجلة.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingFamily(null)}
              >
                إغلاق
              </Button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const toDelete = viewingFamily;
                    setViewingFamily(null);
                    setDeletingFamily(toDelete);
                    setIsDeleting(true);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف السجل</span>
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingFamily;
                    setViewingFamily(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل بيانات العائلة</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT FAMILY MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isEditing ? `تعديل بيانات العائلة (#${editingFamilyId})` : 'تسجيل عائلة متضررة جديدة'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    توثيق مباشر في قاعدة بيانات الإغاثة الرسمية
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
              
              {/* Family ID (Required by Backend) */}
              {!isEditing && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    رقم المعرف العائلي (Family ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={customId}
                    onChange={(e) => setCustomId(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400">تم اقتراح المعرف تلقائياً لتفادي تكرار الأرقام في الخادم</span>
                </div>
              )}

              {/* Head of Family Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  اسم رب الأسرة كاملاً <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={headOfFamilyName}
                  onChange={(e) => setHeadOfFamilyName(e.target.value)}
                  placeholder="مثال: كريم منصوري"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Phone & Number of Members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">رقم الهاتف للتواصل</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+213 661 23 45 67"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">عدد أفراد العائلة <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numberOfMembers}
                    onChange={(e) => setNumberOfMembers(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">الولاية <span className="text-rose-500">*</span></label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {ALGERIAN_DISASTER_WILAYAS.map((w) => (
                      <option key={w} value={w}>ولاية {w}</option>
                    ))}
                    <option value="Algiers">ولاية الجزائر</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">البلدية <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="مثال: الطاهير، تاكسنة، ميلة..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Shelter Location */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  مركز الإيواء أو العنوان الميداني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: مدرسة ابن خلدون الابتدائية، القاعة رقم 3"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Family Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">حالة العائلة الميدانية</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FamilyStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="AFFECTED_DISPLACED">متضرر / نازح (AFFECTED_DISPLACED)</option>
                  <option value="SHELTERED">في مركز إيواء رسمي (SHELTERED)</option>
                  <option value="SUPPORTED">استلم الدعم الأولي (SUPPORTED)</option>
                  <option value="RETURNED">عائد لمقر سكناه (RETURNED)</option>
                </select>
              </div>

              {/* Social / Health Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">الملاحظات الاجتماعية والاحتياجات الخاصة</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="وجود أطفال رضع بحاجة لحليب، مسنين، حالات مرضية خاصة..."
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
                  {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'تحديث السجل' : 'تسجيل العائلة'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleting && deletingFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تأكيد حذف ملف العائلة</h3>
                <p className="text-xs text-slate-500">سيتم حذف ملف العائلة نهائياً من قاعدة البيانات</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف ملف العائلة <strong className="text-rose-600 font-bold">{deletingFamily.headOfFamilyName}</strong> ({deletingFamily.aidId || deletingFamily.id})؟
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleting(false);
                  setDeletingFamily(null);
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
                {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف الملف'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
