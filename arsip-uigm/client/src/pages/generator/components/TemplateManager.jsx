import React, { forwardRef } from 'react';

// IMPORT TEMPLATE SURAT KELUAR (Layout Kiri)
import SuratKeluarPreview from '../templates/SuratKeluar/SuratKeluarPreview';
import SuratKeluarCetakan from '../templates/SuratKeluar/SuratKeluarCetakan';

// IMPORT TEMPLATE SURAT TENGAH (Pernyataan, Tugas, Keterangan)
import SuratPernyataanPreview from '../templates/SuratPernyataan/SuratPernyataanPreview';
import SuratPernyataanCetakan from '../templates/SuratPernyataan/SuratPernyataanCetakan';

const TemplateManager = forwardRef(({ jenisSurat, mode, data, foundPejabat, ...props }, ref) => {
  
  // Normalisasi string agar tidak case-sensitive
  const normalizedJenis = jenisSurat ? jenisSurat.toLowerCase() : '';

  // 1. KELOMPOK SURAT KELUAR (Layout Kiri)
  // Menangani: Surat Keluar, Surat Undangan, dll.
  // HAPUS 'keterangan' dari sini
  if (normalizedJenis.includes('surat keluar') || normalizedJenis.includes('undangan')) {
      if (mode === 'preview') {
          return <SuratKeluarPreview form={data} foundPejabat={foundPejabat} {...props} />;
      }
      if (mode === 'cetak') {
          return <SuratKeluarCetakan ref={ref} form={data} foundPejabat={foundPejabat} {...props} />;
      }
  }

  if (normalizedJenis.includes('pernyataan') || normalizedJenis.includes('tugas') || normalizedJenis.includes('keterangan')) {
      if (mode === 'preview') {
          return <SuratPernyataanPreview form={data} foundPejabat={foundPejabat} {...props} />;
      }
      if (mode === 'cetak') {
          return <SuratPernyataanCetakan ref={ref} form={data} foundPejabat={foundPejabat} {...props} />;
      }
  }

  // 3. DEFAULT (Jika template belum dibuat)
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 text-slate-400">
        <p className="text-lg font-semibold">Template belum tersedia</p>
        <p className="text-sm">Jenis Surat: {jenisSurat}</p>
        <p className="text-xs mt-2">Silakan hubungi developer untuk menambahkan template ini.</p>
    </div>
  );
});

TemplateManager.displayName = "TemplateManager";
export default TemplateManager;