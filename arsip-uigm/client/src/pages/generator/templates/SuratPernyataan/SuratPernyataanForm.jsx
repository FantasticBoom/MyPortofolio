import React from 'react';
import { User, Calendar, Hash, CheckCircle2, AlertCircle, Type, ListPlus } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

export default function SuratPernyataanForm({ form, handleChange, bagianList, foundPejabat }) {
  
  // Class untuk Label Kecil
  const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block";
  
  // Class untuk Input Compact
  const inputContainerClass = "relative group";
  const iconClass = "absolute left-2.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors";
  const inputClass = "w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300";

  return (
    // UBAH LEBAR DI SINI: w-[400px]
    <div className="w-[400px] bg-white border-r border-slate-200 overflow-y-auto z-10 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="p-5 space-y-5"> {/* Padding Dikurangi */}
        
        {/* --- STATUS NOMOR COMPACT --- */}
        <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
          <div className="relative z-10">
            <label className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 mb-0.5 flex items-center gap-1">
              <Hash size={9} /> Nomor Surat
            </label>
            <div className="text-lg font-mono font-bold tracking-wide break-all leading-tight">
              {form.bagian_id ? form.nomor_surat : <span className="opacity-50 italic text-sm">Menunggu Pimpinan...</span>}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              {form.bagian_id ? (
                <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
                  <CheckCircle2 size={10} /> Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-orange-300 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20">
                  <AlertCircle size={10} /> Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- FORM FIELDS --- */}
        <div className="space-y-4">
          
          {/* PIMPINAN (TTD) */}
          <div>
            <label className={labelClass}>Penanda Tangan</label>
            <div className={inputContainerClass}>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <User className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
              </div>
              <select 
                name="bagian_id" 
                value={form.bagian_id} 
                onChange={handleChange} 
                className={`w-full pl-8 pr-3 py-2 bg-slate-50 border rounded-lg text-xs outline-none transition-all appearance-none cursor-pointer font-medium truncate
                  ${!form.bagian_id ? 'border-orange-300 focus:ring-orange-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'}
                `}
              >
                <option value="">-- Pilih Pimpinan --</option>
                {bagianList.map(b => (
                  <option key={b.bagian_id} value={b.bagian_id}>{b.nama_bagian}</option>
                ))}
              </select>
            </div>
            {form.bagian_id && foundPejabat && (
              <div className="text-[10px] mt-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-[9px] shrink-0">
                    {foundPejabat.nama_pejabat.charAt(0)}
                </div>
                <div className="truncate font-semibold">{foundPejabat.nama_pejabat}</div>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-slate-100 my-4"></div>

          {/* TANGGAL SURAT */}
          <div>
            <label className={labelClass}>Tanggal Surat</label>
            <div className={inputContainerClass}>
              <Calendar className={iconClass} size={14} />
              <input type="date" name="tanggal_surat" value={form.tanggal_surat} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {/* JUDUL SURAT */}
          <div>
            <label className={labelClass}>Judul Surat</label>
            <div className={inputContainerClass}>
                <Type className={iconClass} size={14} />
                <input 
                    type="text" 
                    name="perihal" 
                    placeholder="SURAT PERNYATAAN" 
                    value={form.perihal} 
                    onChange={handleChange} 
                    className={`${inputClass} uppercase font-bold text-slate-800`} 
                />
            </div>
            <p className="text-[9px] text-slate-400 ml-1 mt-0.5">*Tampil di tengah atas (HEADER)</p>
          </div>

          {/* ISI SURAT (Rich Text) */}
          <div>
            <label className={labelClass}>Isi Surat</label>
            
            <RichTextEditor 
                content={form.isi_surat} 
                onChange={(htmlContent) => {
                    handleChange({ target: { name: 'isi_surat', value: htmlContent } });
                }}
            />
          </div>

          {/* TEMBUSAN */}
          <div className="pt-3 border-t border-slate-100">
            <label className={`${labelClass} flex items-center gap-1`}>
                <ListPlus size={12}/> Tembusan (Opsional)
            </label>
            <textarea 
                name="tembusan" 
                rows="3" 
                placeholder="Daftar tembusan..." 
                value={form.tembusan} 
                onChange={handleChange} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:border-indigo-500 outline-none resize-none font-medium placeholder:text-slate-400"
            ></textarea>
          </div>

        </div>
      </div>
    </div>
  );
}