import React from 'react';
import { User, FileText, Calendar, Type, Hash, CheckCircle2, AlertCircle, ListPlus } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

export default function EditorForm({ form, handleChange, bagianList, foundPejabat }) {
  return (
    <div className="w-[550px] bg-white border-r border-slate-200 overflow-y-auto z-10 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="p-8 space-y-8">
        
        {/* Status Nomor */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 mb-1 flex items-center gap-1">
              <Hash size={10} /> Nomor Surat (Otomatis)
            </label>
            <div className="text-2xl font-mono font-bold tracking-wide mt-2 break-all leading-tight">
              {form.bagian_id ? form.nomor_surat : <span className="opacity-50 italic text-xl">Menunggu Pimpinan...</span>}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              {form.bagian_id ? (
                <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                  <CheckCircle2 size={12} /> Tergenerate
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-300 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                  <AlertCircle size={12} /> Pilih Jabatan
                </span>
              )}
              <span>Sesuai format database</span>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Pimpinan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Penanda Tangan</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
              <select 
                name="bagian_id" 
                value={form.bagian_id} 
                onChange={handleChange} 
                className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border rounded-xl text-sm outline-none transition-all appearance-none cursor-pointer font-medium
                  ${!form.bagian_id ? 'border-orange-300 focus:ring-orange-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}
                `}
              >
                <option value="">-- Pilih Pimpinan Penanda Tangan --</option>
                {bagianList.map(b => (
                  <option key={b.bagian_id} value={b.bagian_id}>{b.nama_bagian}</option>
                ))}
              </select>
            </div>
            {form.bagian_id && (
              <div className={`text-xs mt-2 px-4 py-3 rounded-xl border flex items-center gap-3 ${foundPejabat ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                {foundPejabat ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {foundPejabat.nama_pejabat.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-[10px] uppercase opacity-70">Pejabat Aktif</p>
                        <p className="font-semibold">{foundPejabat.nama_pejabat}</p>
                    </div>
                  </>
                ) : "⚠ Data pejabat tidak ditemukan aktif."}
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-slate-100 my-6"></div>

          {/* Tanggal & Lampiran */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tanggal</label>
              <div className="relative group">
                <Calendar className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="date" name="tanggal_surat" value={form.tanggal_surat} onChange={handleChange} 
                  className="w-full pl-10 p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Lampiran</label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="text" name="lampiran" value={form.lampiran} onChange={handleChange} 
                  className="w-full pl-10 p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700" />
              </div>
            </div>
          </div>

          {/* Perihal */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Perihal</label>
            <div className="relative group">
              <Type className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input type="text" name="perihal" placeholder="Contoh: Undangan Rapat..." value={form.perihal} onChange={handleChange} 
                className="w-full pl-10 p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700" />
            </div>
          </div>

          {/* Kepada */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Kepada Yth.</label>
            <div className="relative group">
              <User className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input type="text" name="kepada" placeholder="Nama Penerima / Instansi" value={form.kepada} onChange={handleChange} 
                className="w-full pl-10 p-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700" />
            </div>
          </div>

          {/* Isi Surat - DIGANTI DENGAN RICH TEXT EDITOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Isi Surat</label>
            <RichTextEditor 
                content={form.isi_surat} 
                onChange={(htmlContent) => {
                    // Manual trigger event agar compatible dengan handleChange di parent
                    handleChange({ target: { name: 'isi_surat', value: htmlContent } });
                }}
            />
          </div>

          {/* Tembusan */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                <ListPlus size={14}/> Tembusan (Opsional)
            </label>
            <textarea 
                name="tembusan" 
                rows="4" 
                placeholder="Contoh:&#10;1. Ketua Yayasan&#10;2. Arsip" 
                value={form.tembusan} 
                onChange={handleChange} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all leading-relaxed resize-none font-medium text-slate-700 placeholder:text-slate-400"
            ></textarea>
             <p className="text-[10px] text-slate-400 ml-1">Tekan Enter untuk membuat baris baru.</p>
          </div>

        </div>
        
        <div className="pt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Pastikan data sudah benar sebelum disimpan. <br/>
            File PDF akan otomatis ter-download setelah proses simpan.
          </p>
        </div>
      </div>
    </div>
  );
}