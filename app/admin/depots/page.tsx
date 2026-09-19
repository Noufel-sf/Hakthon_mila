'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { DepotResponse, DepotSummaryResponse, DepotStatus, LocationDTO, ContactInfoDTO } from '@/lib/types';
import { DEPOT_STATUS_LABELS, ALGERIAN_DISASTER_WILAYAS } from '@/lib/constants';
import { 
  Warehouse, 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  Mail,
  ExternalLink, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Navigation,
  ShieldCheck,
  ChevronLeft,
  Eye,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export default function AdminDepotsPage() {
  const [depots, setDepots] = useState<DepotSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterWilaya, setFilterWilaya] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingDepotId, setEditingDepotId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deletingDepot, setDeletingDepot] = useState<DepotSummaryResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // View Details Modal state
  const [viewingDepot, setViewingDepot] = useState<DepotResponse | DepotSummaryResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  // Form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [wilaya, setWilaya] = useState<string>('Jijel');
  const [commune, setCommune] = useState<string>('Jijel');
  const [address, setAddress] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string>('');
  const [totalCapacity, setTotalCapacity] = useState<number>(5000);
  const [capacityUnit, setCapacityUnit] = useState<string>('PALLETS');
  const [status, setStatus] = useState<DepotStatus>('ACTIVE');
  const [managerName, setManagerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const fetchDepots = async () => {
    try {
      setIsRefreshing(true);
      const list = await api.depots.list();
      setDepots(list || []);
    } catch (err: any) {
      console.warn('[Admin Depots] Error fetching depots:', err);
      toast.error('تعذر جلب المستودعات من الخادم');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  const handleOpenViewDetails = async (depot: DepotSummaryResponse) => {
    setViewingDepot(depot);
    setIsLoadingDetails(true);
    try {
      const full = await api.depots.getById(depot.id);
      if (full) setViewingDepot(full);
    } catch {
      // Keep summary
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setWilaya('Jijel');
    setCommune('Jijel');
    setAddress('');
    setGoogleMapsUrl('');
    setTotalCapacity(5000);
    setCapacityUnit('PALLETS');
    setStatus('ACTIVE');
    setManagerName('');
    setPhone('');
    setEmail('');
    setIsEditing(false);
    setEditingDepotId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (depot: DepotSummaryResponse | DepotResponse) => {
    resetForm();
    setIsEditing(true);
    setEditingDepotId(depot.id);
    setIsModalOpen(true);
    if (viewingDepot) setViewingDepot(null);

    try {
      const detailed = await api.depots.getById(depot.id);
      setName(detailed.name || depot.name);
      setDescription(detailed.description || '');
      setWilaya(detailed.location?.wilaya || depot.location?.wilaya || 'Jijel');
      setCommune(detailed.location?.commune || depot.location?.commune || 'Jijel');
      setAddress(detailed.location?.address || depot.location?.address || '');
      setGoogleMapsUrl(detailed.location?.googleMapsUrl || depot.location?.googleMapsUrl || '');
      setTotalCapacity(detailed.totalCapacity || 5000);
      setCapacityUnit(detailed.capacityUnit || 'PALLETS');
      setStatus(detailed.status || depot.status || 'ACTIVE');
      setManagerName(detailed.contactInfo?.managerName || '');
      setPhone(detailed.contactInfo?.phone || '');
      setEmail(detailed.contactInfo?.email || '');
    } catch {
      setName(depot.name);
      setWilaya(depot.location?.wilaya || 'Jijel');
      setCommune(depot.location?.commune || 'Jijel');
      setAddress(depot.location?.address || '');
      setGoogleMapsUrl(depot.location?.googleMapsUrl || '');
      setStatus(depot.status || 'ACTIVE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name,
      description: description || undefined,
      location: {
        wilaya,
        commune,
        address,
        googleMapsUrl: googleMapsUrl || undefined,
      },
      totalCapacity: Number(totalCapacity) || 5000,
      capacityUnit,
      status,
      contactInfo: {
        managerName: managerName || undefined,
        phone: phone || undefined,
        email: email || undefined,
      },
    };

    try {
      if (isEditing && editingDepotId) {
        await api.depots.update(editingDepotId, payload);
        toast.success(`تم تحديث بيانات المستودع (${name}) بنجاح!`);
      } else {
        await api.depots.create(payload);
        toast.success(`تم إنشاء المستودع الجديد (${name}) بنجاح في قاعدة البيانات!`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchDepots();
    } catch (err: any) {
      console.warn('[Admin Depots] Submit error:', err);
      toast.error('حدث خطأ أثناء حفظ بيانات المستودع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDepot) return;
    setIsSubmitting(true);
    try {
      await api.depots.delete(deletingDepot.id);
      toast.success(`تم حذف المستودع (${deletingDepot.name}) بنجاح`);
      setIsDeleting(false);
      setDeletingDepot(null);
      if (viewingDepot?.id === deletingDepot.id) setViewingDepot(null);
      fetchDepots();
    } catch (err: any) {
      console.warn('[Admin Depots] Delete error:', err);
      toast.error('تعذر حذف المستودع من الخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter depots
  const filteredDepots = depots.filter((d) => {
    const matchesWilaya = filterWilaya === 'all' || d.location?.wilaya === filterWilaya;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchesSearch = 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location?.wilaya || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location?.commune || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesWilaya && matchesStatus && matchesSearch;
  });

  const uniqueWilayas = Array.from(new Set(depots.map(d => d.location?.wilaya).filter(Boolean)));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              إدارة المستودعات
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              خادم حي
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            دليل وإدارة مستودعات الإغاثة
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            عرض مبسّط للمستودعات مع إمكانية استعراض كامل التفاصيل والتعديل والحذف المباشر
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchDepots} 
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
            <span>إضافة مستودع جديد</span>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="بحث بالمستودع، الولاية، أو البلدية..."
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
            <option value="all">جميع الولايات ({depots.length})</option>
            {uniqueWilayas.map(w => (
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
            <option value="ACTIVE">نشط ومتاح</option>
            <option value="AT_CAPACITY">مكتمل الطاقة</option>
            <option value="INACTIVE">غير نشط</option>
          </select>
        </div>
      </div>

      {/* Streamlined Depots Table: Clean & Minimal */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-4 px-5 whitespace-nowrap">المستودع والموقع</th>
              <th className="py-4 px-5 whitespace-nowrap">نسبة الإشغال</th>
              <th className="py-4 px-5 whitespace-nowrap">الحالة</th>
              <th className="py-4 px-5 whitespace-nowrap text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400 whitespace-nowrap">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                  <span>جاري تحميل المستودعات من الخادم...</span>
                </td>
              </tr>
            ) : filteredDepots.length > 0 ? (
              filteredDepots.map((depot) => {
                const occupancy = Math.round(depot.occupancyPercentage || 0);
                const statusMeta = DEPOT_STATUS_LABELS[depot.status] || { label: depot.status, color: 'slate' };

                return (
                  <tr 
                    key={depot.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => handleOpenViewDetails(depot)}
                  >
                    {/* Depot Name & Wilaya badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Warehouse className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">
                              {depot.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                              #{depot.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span>ولاية {depot.location?.wilaya} — بلدية {depot.location?.commune}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Occupancy */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-1 w-28">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {occupancy}% ممتلئ
                        </span>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              occupancy > 80 ? 'bg-rose-500' : occupancy > 50 ? 'bg-primary' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${occupancy}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                        depot.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : depot.status === 'AT_CAPACITY'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Actions in row: View Details, Edit, Delete */}
                    <td className="py-4 px-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenViewDetails(depot)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="عرض كافة التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(depot)}
                          className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                          title="تعديل المستودع"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingDepot(depot);
                            setIsDeleting(true);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف المستودع"
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
                  لا توجد مستودعات مطابقة لمعايير البحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW DETAILS MODAL ================= */}
      {viewingDepot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Warehouse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {viewingDepot.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                      ولاية {viewingDepot.location?.wilaya}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: #{viewingDepot.id}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingDepot(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content info */}
            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              
              {/* Location & Address */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  الموقع ونقطة التفريغ
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {viewingDepot.location?.address || 'غير محدد بدقة'}
                </p>
                <p className="text-slate-500">
                  البلدية: {viewingDepot.location?.commune} • ولاية {viewingDepot.location?.wilaya}
                </p>
                {viewingDepot.location?.googleMapsUrl && (
                  <a
                    href={viewingDepot.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:underline pt-1"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>فتح الموقع في Google Maps</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              {/* Capacity & Usage */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">نسبة الإشغال:</span>
                  <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                    {Math.round(viewingDepot.occupancyPercentage || 0)}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">الحالة الميدانية:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {DEPOT_STATUS_LABELS[viewingDepot.status]?.label || viewingDepot.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              {('contactInfo' in viewingDepot) && viewingDepot.contactInfo && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    المسؤول الميداني والتواصل
                  </span>
                  {viewingDepot.contactInfo.managerName && (
                    <p className="font-bold text-slate-900 dark:text-white">{viewingDepot.contactInfo.managerName}</p>
                  )}
                  {viewingDepot.contactInfo.phone && (
                    <p className="font-mono text-slate-600 dark:text-slate-300" dir="ltr">{viewingDepot.contactInfo.phone}</p>
                  )}
                  {viewingDepot.contactInfo.email && (
                    <p className="font-mono text-slate-500" dir="ltr">{viewingDepot.contactInfo.email}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {('description' in viewingDepot) && viewingDepot.description && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">الوصف والتجهيز:</span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{viewingDepot.description}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <Link href={`/depots/${viewingDepot.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>عرض صفحة المستودع</span>
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenEdit(viewingDepot)}
                  className="text-xs font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل المستودع</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingDepot(viewingDepot as DepotSummaryResponse);
                    setIsDeleting(true);
                  }}
                  className="text-xs text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= CREATE / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Warehouse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isEditing ? `تعديل بيانات المستودع (#${editingDepotId})` : 'إضافة مستودع إغاثة جديد'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    حفظ مباشر في قاعدة البيانات المركزية
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
              
              {/* Depot Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  اسم المستودع أو المركز الميداني <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مستودع ميلة المركزي للإغاثة"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">وصف المستودع وطبيعة التجهيز</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مركز تنسيق رئيسي مجهز للتخزين الجاف والمكيف..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    الولاية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    {ALGERIAN_DISASTER_WILAYAS.map((w) => (
                      <option key={w} value={w}>ولاية {w}</option>
                    ))}
                    <option value="Algiers">ولاية الجزائر</option>
                    <option value="Constantine">ولاية قسنطينة</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    البلدية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder="مثال: تاكسنة، الميلية، القرارم..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  العنوان التفصيلي ونقطة التفريغ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المنطقة الصناعية، هانغار رقم 2..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Google Maps URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">رابط Google Maps المباشر</label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=36.8,5.7"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors font-mono"
                />
              </div>

              {/* Capacity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">السعة التخزينية (بالمنصات PALLETS)</label>
                  <input
                    type="number"
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(Number(e.target.value))}
                    min="100"
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">حالة المستودع الميدانية</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DepotStatus)}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="ACTIVE">نشط ومتاح للتفريغ</option>
                    <option value="AT_CAPACITY">مكتمل الطاقة الاستيعابية</option>
                    <option value="INACTIVE">غير نشط مؤقتاً</option>
                    <option value="TEMPORARILY_CLOSED">مغلق مؤقتاً</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  معلومات الاتصال بالمسؤول الميداني
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-500">اسم المسؤول:</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      placeholder="أحمد بن علي"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500">رقم الهاتف:</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+213 555 12 34 56"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500">البريد الإلكتروني:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="depot@aid.dz"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
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
                  {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'حفظ التعديلات' : 'إنشاء المستودع'}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {isDeleting && deletingDepot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">تأكيد حذف المستودع</h3>
                <p className="text-xs text-slate-500">هذا الإجراء سيحذف المستودع نهائياً من الخادم الحي</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف <strong className="text-rose-600 font-bold">{deletingDepot.name}</strong> (ولاية {deletingDepot.location?.wilaya})؟ لن تتمكن من استرجاع هذا السجل.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleting(false);
                  setDeletingDepot(null);
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
                {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف المستودع'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
