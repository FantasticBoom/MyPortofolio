import React, { forwardRef } from 'react';
import logoUIGM from '../../../../assets/logo.png'; 

const SuratPernyataanPreview = forwardRef(({ form, foundPejabat }, ref) => {
  
  const isNotRektor = foundPejabat && foundPejabat.jabatan !== 'Rektor';

  return (
    <div className="flex-1 bg-slate-100/80 overflow-y-auto p-4 flex justify-center items-start relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* CSS PREVIEW COMPACT */}
      <style>{`
         .arial-content, .arial-content * { font-family: Arial, Helvetica, sans-serif !important; }
         .html-content ul { list-style-type: disc; margin-left: 1.5em; margin-bottom: 0.2em; }
         .html-content ol { list-style-type: decimal; margin-left: 1.5em; margin-bottom: 0.2em; }
         .html-content table { border-collapse: collapse; width: 100%; margin: 0.2em 0; }
         .html-content th, .html-content td { border: 1px solid black; padding: 2px 4px; vertical-align: top; }
         
         /* TABEL BIODATA TANPA BORDER */
         .html-content table[style*="border: none"] td,
         .html-content table[style*="border: none"] th {
             border: none !important;
             padding: 0px 2px 0px 0px !important;
             line-height: 1.2 !important;
         }
         .html-content p { margin-bottom: 0.3em; line-height: 1.4; }
         .html-content .indent-first { text-indent: 40px; }
      `}</style>

      {/* --- WRAPPER SCALE 0.8 (ZOOM OUT) --- */}
      <div className="relative group transition-transform duration-300 ease-in-out scale-[0.8] origin-top">
        <div ref={ref} className="relative bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm_25mm_35mm_25mm] text-black text-[10pt] leading-normal arial-content mx-auto flex flex-col">
          
          {/* --- KOP SURAT (Compact) --- */}
          <div className="flex items-center gap-3 mb-1">
            <div className="shrink-0"><img src={logoUIGM} alt="Logo UIGM" className="w-[90px] h-auto" /></div>
            <div className="flex-1 text-center mt-1">
              <h1 className="text-[16pt] font-extrabold text-[#0066cc] uppercase leading-none tracking-tight scale-y-110">Universitas Indo Global Mandiri</h1>
              <p className="text-[9pt] text-black mt-1 tracking-wide font-normal">Jalan Jenderal Sudirman No. 629 Palembang 30129</p>
              <p className="text-[9pt] text-black font-normal">Telp: 0711-322705, 322706 Fax: 0711-357754</p>
            </div>
          </div>
          <div className="w-full h-auto bg-[#3b82f6] border-t-[1px] border-b-[1px] border-[#1e40af] flex justify-between items-center px-4 py-0.5 text-white font-bold mt-1 text-[8pt]">
            <span>UNIVERSITAS IGM</span>
            <span>Website : www.uigm.ac.id</span>
            <span>E-mail : info@uigm.ac.id</span>
            </div>
          <div className="border-b-[2px] border-black mt-[2px] mb-6"></div>

          {/* --- JUDUL & NOMOR (CENTER) --- */}
          <div className="text-center mb-6">
            <h2 className="text-[12pt] font-bold uppercase underline underline-offset-4 decoration-1">
                {form.perihal || "JUDUL SURAT"}
            </h2>
            <p className="mt-1 text-[10pt]">No : {form.nomor_surat}</p>
          </div>

          {/* --- ISI SURAT --- */}
          <div className="text-justify mb-6 text-[10pt] leading-relaxed flex-grow html-content">
            {form.isi_surat ? (
               <div dangerouslySetInnerHTML={{ __html: form.isi_surat }} />
            ) : (
               <span className="text-slate-300 italic block text-center mt-10">[Isi surat, biodata, dan pernyataan...]</span>
            )}
          </div>

          {/* --- TANDA TANGAN --- */}
          <div className="flex justify-end mt-4 text-[10pt]">
            <div className="text-left min-w-[220px]">
              {/* Tanggal di kanan atas TTD */}
              <p className="mb-1">Palembang, {new Date(form.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              
              {isNotRektor && (<p className="mb-0.5">a.n. Rektor</p>)}
              <p className="font mb-20">
                  {foundPejabat?.jabatan || "Jabatan Pimpinan"}{isNotRektor && ","} 
              </p>
              <p className="font-bold underline underline-offset-2 decoration-1">
                {foundPejabat ? foundPejabat.nama_pejabat : "(...................................)"}
              </p>
              <p className="mt-0.5">NIDN. {foundPejabat?.NIDN || "..................."}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

SuratPernyataanPreview.displayName = "SuratPernyataanPreview";
export default SuratPernyataanPreview;