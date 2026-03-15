import React, { forwardRef } from 'react';
import logoUIGM from '../../../../assets/logo.png'; 
// Pastikan path logoUIGM disesuaikan

const SuratKeluarPreview = forwardRef(({ form, foundPejabat }, ref) => {
  
  const isNotRektor = foundPejabat && foundPejabat.jabatan !== 'Rektor';

  return (
    <div className="flex-1 bg-slate-100/80 overflow-y-auto p-4 flex justify-center items-start relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* CSS PREVIEW */}
      <style>{`
         .arial-content, .arial-content * {
             font-family: Arial, Helvetica, sans-serif !important;
         }

         .html-content ul { list-style-type: disc; margin-left: 1.5em; margin-bottom: 0.2em; }
         .html-content ol { list-style-type: decimal; margin-left: 1.5em; margin-bottom: 0.2em; }
         
         .html-content table { border-collapse: collapse; width: 100%; margin: 0.2em 0; }
         .html-content th, .html-content td { border: 1px solid black; padding: 2px 4px; vertical-align: top; }
         
         .html-content table[style*="border: none"] td,
         .html-content table[style*="border: none"] th {
             border: none !important;
             padding: 0px 2px !important;
             line-height: 1.2 !important;
         }
         
         .html-content img { max-width: 100%; height: auto; }
         .html-content p { margin-bottom: 0.3em; line-height: 1.4; }
         .html-content .indent-first { text-indent: 40px; }
      `}</style>

      {/* --- WRAPPER SKALA  --- */}
      <div className="relative group transition-transform duration-300 ease-in-out scale-[0.8] origin-top">
        
        <div 
          ref={ref} 
          className="relative bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm_20mm_20mm_25mm] text-black text-[10pt] leading-normal arial-content mx-auto flex flex-col"
        >
          {/* --- KOP SURAT --- */}
          <div className="flex items-center gap-3 mb-1">
            <div className="shrink-0"><img src={logoUIGM} alt="Logo UIGM" className="w-[90px] h-auto" /></div>
            <div className="flex-1 text-center mt-1">
              <h1 className="text-[16pt] font-extrabold text-[#0066cc] uppercase leading-none tracking-tight scale-y-110">Universitas Indo Global Mandiri</h1>
              <p className="text-[9pt] text-black mt-1 tracking-wide font-normal">Jalan Jenderal Sudirman No. 629 Palembang 30129</p>
              <p className="text-[9pt] text-black font-normal">Telp: 0711-322705, 322706 Fax: 0711-357754</p>
            </div>
          </div>
          <div className="w-full h-auto bg-[#3b82f6] border-t-[1px] border-b-[1px] border-[#1e40af] flex justify-between items-center px-4 py-0.5 text-white text-[8pt] font-bold mt-1">
            <span>UNIVERSITAS IGM</span>
            <span>Website : www.uigm.ac.id</span>
            <span>E-mail : info@uigm.ac.id</span>
          </div>
          <div className="border-b-[2px] border-black mt-[2px] mb-6"></div>

          {/* --- HEADER --- */}
          <div className="flex justify-between items-start mb-4 text-[10pt]">
            <table className="border-collapse w-auto">
              <tbody>
                <tr><td className="w-20 align-top">Nomor</td><td className="px-2 align-top">:</td><td className="font">{form.nomor_surat}</td></tr>
                <tr><td className="align-top">Lamp.</td><td className="px-2 align-top">:</td><td>{form.lampiran}</td></tr>
                <tr><td className="align-top">Hal</td><td className="px-2 align-top">:</td><td className="font max-w-[350px] leading-tight">{form.perihal || "............"}</td></tr>
              </tbody>
            </table>
            <div className="text-right whitespace-nowrap">
              <p>{new Date(form.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* --- TUJUAN --- */}
          <div className="mb-6 text-[10pt]">
            <p>Yth. <span className="font">{form.kepada || "..................."}</span></p>
            
            {form.kepada_sub && (
                <p className="font">{form.kepada_sub}</p>
            )}

            <p>di</p>
            <p className="pl-4">Tempat</p>
          </div>

          {/* --- ISI SURAT --- */}
          <div className="text-justify mb-6 text-[10pt] leading-relaxed flex-grow html-content">
            {form.isi_surat ? (
               <div dangerouslySetInnerHTML={{ __html: form.isi_surat }} />
            ) : (
               <span className="text-slate-300 italic text-[9pt]">[Isi surat akan tampil di sini...]</span>
            )}
          </div>

          {/* --- TANDA TANGAN --- */}
          <div className="flex justify-end mt-2 text-[10pt]">
            <div className="text-left min-w-[200px]">
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

          {/* --- TEMBUSAN --- */}
          {form.tembusan && (
              <div className="mt-8 text-[9pt] align-bottom">
                  <p className="font-bold mb-0.5">Tembusan:</p>
                  <div className="whitespace-pre-line pl-4 text-gray-700">{form.tembusan}</div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
});

SuratKeluarPreview.displayName = "SuratKeluarPreview";
export default SuratKeluarPreview;