import React, { forwardRef } from 'react';
import logoUIGM from '../../../../assets/logo.png'; 

const SuratKeluarCetakan = forwardRef(({ form, foundPejabat }, ref) => {
  
  const isNotRektor = foundPejabat && foundPejabat.jabatan !== 'REKTOR';

  return (
    <div ref={ref} className="bg-white text-black print-content">
        
        {/* --- STYLE KHUSUS CETAK (PDF) --- */}
        <style type="text/css" media="print">
            {`
               /* 1. ATUR MARGIN HALAMAN DI SINI */
               @page { 
                   size: A4; 
                   margin: 1.5cm 2cm 1.5cm 2cm; 
               }
               
               body {
                   margin: 0;
                   -webkit-print-color-adjust: exact;
                   print-color-adjust: exact;
               }

               /* PAKSA SEMUA TEKS JADI ARIAL */
               .print-content, .print-content * {
                   font-family: Arial, Helvetica, sans-serif !important;
               }

               /* Layout Surat */
               table { width: 100%; border-collapse: collapse; }
               thead { display: table-header-group; } 
               tfoot { display: table-footer-group; }
               tbody { display: table-row-group; }
               
               /* --- STYLE ISI SURAT --- */
               .editor-content ul { list-style-type: disc !important; margin-left: 2em !important; margin-bottom: 0.5em; }
               .editor-content ol { list-style-type: decimal !important; margin-left: 2em !important; margin-bottom: 0.5em; }
               
               .editor-content table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
               .editor-content table th, 
               .editor-content table td { border: 1px solid black !important; padding: 4px 8px; vertical-align: top; }

               /* Tabel Biodata (Tanpa Border & Rapat) */
               .editor-content table[style*="border: none"] {
                   margin: 0.2em 0 !important;
               }
               .editor-content table[style*="border: none"] td,
               .editor-content table[style*="border: none"] th {
                   border: none !important;
                   padding: 0px 4px 0px 0px !important;
                   line-height: 1.3 !important;
               }
               .editor-content table[style*="border: none"] td p {
                   margin: 0 !important;
               }

               .editor-content p { margin-bottom: 0.8em; line-height: 1.5; }
               .editor-content .indent-first { text-indent: 50px !important; }

               .signature-block { page-break-inside: avoid; break-inside: avoid; }
            `}
        </style>

        {/* WRAPPER UTAMA */}
        <div style={{ 
            width: '100%', 
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '12pt',
            lineHeight: '1.5'
        }}>

            <table className="w-full">
                
                {/* --- KOP SURAT --- */}
                <thead>
                    <tr>
                        <td>
                            <div className="pb-4"> 
                                <div className="flex items-center gap-4 mb-1">
                                    <div className="shrink-0">
                                        <img src={logoUIGM} alt="Logo UIGM" style={{ width: '110px', height: 'auto' }} />
                                    </div>
                                    <div className="flex-1 text-center mt-2">
                                        <h1 className="font-extrabold text-[#0066cc] uppercase leading-none tracking-tight scale-y-110" 
                                            style={{ fontSize: '19pt' }}>
                                            Universitas Indo Global Mandiri
                                        </h1>
                                        <p className="text-black mt-1 tracking-wide font-normal" 
                                           style={{ fontSize: '11pt' }}>
                                            Jalan Jenderal Sudirman No. 629 Palembang 30129
                                        </p>
                                        <p className="text-black font-normal" 
                                           style={{ fontSize: '11pt' }}>
                                            Telp: 0711-322705, 322706 Fax: 0711-357754
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full bg-[#3b82f6] border-t-[1px] border-b-[1px] border-[#1e40af] flex justify-between items-center px-6 py-1 text-white font-bold mt-1" 
                                     style={{ fontSize: '9pt' }}>
                                    <span>UNIVERSITAS IGM</span>
                                    <span>Website : www.uigm.ac.id</span>
                                    <span>E-mail : info@uigm.ac.id</span>
                                </div>
                                
                                <div className="border-b-[2px] border-black mt-[2px]"></div>
                            </div>
                        </td>
                    </tr>
                </thead>

                {/* --- ISI SURAT --- */}
                <tbody>
                    <tr>
                        <td className="align-top">
                            
                            {/* Header Surat */}
                            <div className="flex justify-between items-start mb-6" style={{ fontSize: '12pt' }}>
                                <table className="border-collapse w-auto">
                                    <tbody>
                                        <tr><td className="w-24 align-top">Nomor</td><td className="w-4 align-top">:</td><td className="font align-top">{form.nomor_surat}</td></tr>
                                        <tr><td className="align-top">Lamp.</td><td className="align-top">:</td><td className="align-top">{form.lampiran}</td></tr>
                                        <tr><td className="align-top">Hal</td><td className="align-top">:</td><td className="font align-top leading-tight" style={{ maxWidth: '350px' }}>
                                            {form.perihal || "............"}
                                        </td></tr>
                                    </tbody>
                                </table>
                                
                                <div className="text-right whitespace-nowrap min-w-[150px]">
                                    <p>
                                        {new Date(form.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* TUJUAN */}
                            <div className="mb-8" style={{ fontSize: '12pt' }}>
                                <p>Yth. <span className="font">{form.kepada || "..................."}</span></p>
                                
                                {form.kepada_sub && (
                                    <p className="font">{form.kepada_sub}</p>
                                )}

                                <p>di</p>
                                <p className="pl-8">Tempat</p>
                            </div>

                            {/* Isi Surat UTAMA */}
                            <div className="text-justify whitespace-pre-line mb-8 leading-normal editor-content" 
                                 style={{ fontSize: '12pt' }}>
                                {form.isi_surat ? (
                                    <div dangerouslySetInnerHTML={{ __html: form.isi_surat }} />
                                ) : "..."}
                            </div>

                            {/* Tanda Tangan */}
                            <div className="flex justify-end mt-8 signature-block" style={{ fontSize: '12pt' }}>
                                <div className="text-left min-w-[240px]">
                                    {isNotRektor && (<p className="mb-1">a.n. Rektor</p>)}
                                    <p className="font mb-24">
                                        {foundPejabat?.jabatan || "Jabatan Pimpinan"}
                                        {isNotRektor && ","} 
                                    </p>
                                    <p className="font-bold underline underline-offset-4 decoration-1">
                                        {foundPejabat ? foundPejabat.nama_pejabat : "(...................................)"}
                                    </p>
                                    <p className="mt-1">NIDN. {foundPejabat?.NIDN || "..................."}</p>
                                </div>
                            </div>

                            {/* Tembusan */}
                            {form.tembusan && (
                                <div className="mt-8 signature-block" style={{ fontSize: '10pt' }}>
                                    <p className="font-bold mb-1">Tembusan:</p>
                                    <div className="whitespace-pre-line pl-4">
                                        {form.tembusan}
                                    </div>
                                </div>
                            )}
                        </td>
                    </tr>
                </tbody>

                <tfoot></tfoot>

            </table>
        </div>
    </div>
  );
});

SuratKeluarCetakan.displayName = "SuratKeluarCetakan";
export default SuratKeluarCetakan;