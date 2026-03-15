import React from 'react';

// Import Form Surat Keluar
import SuratKeluarForm from '../templates/SuratKeluar/SuratKeluarForm';
import SuratPernyataanForm from '../templates/SuratPernyataan/SuratPernyataanForm';

export default function FormManager({ jenisSurat, ...props }) {
  
  // Normalisasi agar tidak sensitif huruf besar/kecil
  const normalizedJenis = jenisSurat ? jenisSurat.toLowerCase() : '';

  // Debugging: Cek di Console browser apa yang terbaca
  console.log("FormManager Check:", normalizedJenis);

  if (normalizedJenis.includes('surat keluar') || normalizedJenis.includes('undangan')) {
      return <SuratKeluarForm {...props} />;
  }

  if (normalizedJenis.includes('pernyataan') || normalizedJenis.includes('tugas') || normalizedJenis.includes('keterangan')) {
      return <SuratPernyataanForm {...props} />;
  }

  // Default fallback jika jenis surat tidak dikenali
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-400">
        <p className="font-bold">Form tidak ditemukan</p>
        <p className="text-xs mt-2">Jenis Surat: "{jenisSurat}"</p>
    </div>
  );
}