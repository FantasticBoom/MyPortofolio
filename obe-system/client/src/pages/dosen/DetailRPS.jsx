import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaPrint, FaEdit } from "react-icons/fa";

const DetailRPS = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Nama Dosen",
  };
  const [rps, setRps] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8081/api/rps/detail/${id}`
        );
        setRps(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return <div className="p-10 text-center">Loading Data RPS...</div>;
  if (!rps) return <div className="p-10 text-center">Data tidak ditemukan</div>;

  // --- HELPER ---
  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const uniqueCPLs = [
    ...new Set(rps.korelasi.map((item) => item.kode_cpl_join)),
  ];
  const uniqueSubs = [...new Set(rps.korelasi.map((item) => item.kode_sub))];

  // STYLE KHUSUS (Agar garis tabel menyatu/menempel)
  const tableStyle =
    "w-full border-collapse border border-black table-fixed mb-[-1px] text-[12px] font-sans text-black leading-tight";
  const headerColor = "bg-[#daeef3]"; // Warna biru muda sesuai gambar

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* TOOLBAR (Tombol) */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => navigate("/dosen/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold"
        >
          <FaArrowLeft /> Kembali
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dosen/edit-rps/${id}`)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-6 py-2 rounded font-bold shadow"
          >
            <FaEdit /> Edit
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2 rounded font-bold shadow"
          >
            <FaPrint /> Cetak
          </button>
        </div>
      </div>

      {/* --- KANVAS KERTAS (A4 LANDSCAPE) --- */}
      <div className="max-w-[297mm] mx-auto bg-white p-[10mm] shadow-2xl print:shadow-none print:p-0">
        {/* ================================================================================== */}
        {/* TABEL 1: HEADER LOGO & INSTITUSI */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "75%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr className={`${headerColor} text-center font-bold`}>
              <td className="border border-black p-2">
                LOGO
                <br />
                INSTITUSI
              </td>
              <td className="border border-black p-2 text-sm uppercase">
                UNIVERSITAS INDO GLOBAL MANDIRI; FAKULTAS ILMU KOMPUTER DAN
                SAINS; <br />
                PROGRAM STUDI TEKNIK INFORMATIKA
              </td>
              <td className="border border-black p-2">
                KODE
                <br />
                DOKUMEN
              </td>
            </tr>
            <tr className="bg-white text-center font-bold">
              <td className="border border-black p-1 bg-gray-200" colSpan="3">
                RENCANA PEMBELAJARAN SEMESTER
              </td>
            </tr>
          </thead>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 2: IDENTITAS MATA KULIAH */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          {/* Pengaturan Lebar Kolom Spesifik Identitas */}
          <colgroup>
            <col style={{ width: "25%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
          </colgroup>
          <tbody className="text-left align-middle">
            <tr className="font-bold bg-white">
              <td className="border border-black p-1 px-2">Mata Kuliah</td>
              <td className="border border-black p-1 px-2">Kode MK</td>
              <td className="border border-black p-1 px-2">Rumpun MK</td>
              <td className="border border-black p-1 px-2">Bobot (SKS)</td>
              <td className="border border-black p-1 px-2">Semester</td>
              <td className="border border-black p-1 px-2">Tgl Penyusunan</td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2">{rps.nama_mk}</td>
              <td className="border border-black p-1 px-2">{rps.kode_mk}</td>
              <td className="border border-black p-1 px-2">
                Mata Kuliah Wajib
              </td>
              <td className="border border-black p-1 px-2">
                T = {rps.sks} &nbsp; P = 0
              </td>
              <td className="border border-black p-1 px-2">{rps.semester}</td>
              <td className="border border-black p-1 px-2">
                {formatDate(rps.created_at)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 3: OTORISASI / PENGESAHAN */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          {/* Lebar Kolom Otorisasi yang proporsional */}
          <colgroup>
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
          <tbody>
            <tr className="font-bold bg-white text-center align-middle">
              <td className="border border-black p-1 bg-gray-100">
                OTORISASI/PENGESAHAN
              </td>
              <td className="border border-black p-1 bg-gray-100">
                DOSEN PENGEMBANG RPS
              </td>
              <td className="border border-black p-1 bg-gray-100">
                KOORDINATOR RMK
              </td>
              <td className="border border-black p-1 bg-gray-100">KAPRODI</td>
            </tr>
            <tr className="h-24 text-center align-bottom">
              {/* Kotak 1: Kosong */}
              <td className="border border-black p-1 bg-white"></td>

              {/* Kotak 2: Dosen */}
              <td className="border border-black p-1 pb-4">
                <span className="font-bold underline">{user.name}</span>
                <br />
                <span className="text-[9px]">Tanda Tangan</span>
              </td>

              {/* Kotak 3: Koordinator */}
              <td className="border border-black p-1 pb-4">
                <br />
                <br />
                <span className="text-[9px]">Tanda Tangan (jika ada)</span>
              </td>

              {/* Kotak 4: Kaprodi */}
              <td className="border border-black p-1 pb-4">
                <br />
                <br />
                <span className="text-[9px]">Tanda Tangan</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 4: CAPAIAN PEMBELAJARAN (CPL, CPMK, SUB, KORELASI) */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "85%" }} />
          </colgroup>
          <tbody>
            {/* Header Utama */}
            <tr>
              <td
                className="border border-black p-1 px-2 font-bold bg-gray-200"
                rowSpan={uniqueCPLs.length + 5 + 10}
              >
                Capaian
                <br />
                Pembelajaran
              </td>
              <td className="border border-black p-1 px-2 font-bold bg-yellow-100">
                CPL Prodi yang dibebankan pada MK
              </td>
            </tr>

            {/* Loop CPL */}
            {uniqueCPLs.map((cpl, idx) => (
              <tr key={`cpl-${idx}`}>
                <td className="border border-black p-1 px-2 text-justify">
                  {cpl}
                </td>
              </tr>
            ))}

            {/* Header CPMK */}
            <tr>
              <td className="border border-black p-1 px-2 font-bold bg-yellow-100">
                Capaian Pembelajaran Mata Kuliah (CPMK)
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2">
                <ul className="list-none pl-0 m-0">
                  {[
                    ...new Set(
                      rps.penilaian.map(
                        (p) =>
                          `${p.kode_sub_cpmk.split("-")[0]} : ${
                            p.deskripsi_sub
                          }`
                      )
                    ),
                  ].map((item, i) => (
                    <li key={i}>{item}</li> // Simplified logic for CPMK view
                  ))}
                </ul>
              </td>
            </tr>

            {/* Header Sub-CPMK */}
            <tr>
              <td className="border border-black p-1 px-2 font-bold bg-green-100">
                Kemampuan akhir tiap tahapan belajar MK (Sub-CPMK)
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2">
                <ul className="list-none pl-0 m-0">
                  {uniqueSubs.map((sub, i) => {
                    // Cari deskripsi sub
                    const detail = rps.penilaian.find(
                      (p) => p.kode_sub_cpmk === sub
                    );
                    return (
                      <li key={i}>
                        {sub} : {detail ? detail.deskripsi_sub : ""}
                      </li>
                    );
                  })}
                </ul>
              </td>
            </tr>

            {/* --- TABEL KORELASI (NESTED TABLE) --- */}
            <tr>
              <td className="border border-black p-1 px-2 font-bold bg-gray-200">
                Korelasi CPL terhadap Sub-CPMK
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2">
                {/* Nested Table untuk Matriks */}
                <table className="w-full border-collapse border border-black text-center text-[9px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-black p-1">Sub-CPMK</th>
                      {uniqueCPLs.map((cpl, i) => (
                        <th key={i} className="border border-black p-1">
                          {cpl.split(" ")[0]}
                        </th>
                      ))}
                      <th className="border border-black p-1">Bobot (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueSubs.map((sub, idx) => (
                      <tr key={idx}>
                        <td className="border border-black p-1 text-left font-bold">
                          {sub}
                        </td>
                        {uniqueCPLs.map((cpl, cIdx) => {
                          const rel = rps.korelasi.find(
                            (r) => r.kode_sub === sub && r.kode_cpl_join === cpl
                          );
                          return (
                            <td key={cIdx} className="border border-black p-1">
                              {rel ? rel.persentase : ""}
                            </td>
                          );
                        })}
                        <td className="border border-black p-1 font-bold">
                          {rps.korelasi
                            .filter((r) => r.kode_sub === sub)
                            .reduce((a, b) => a + parseFloat(b.persentase), 0)}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="font-bold bg-gray-100">
                      <td className="border border-black p-1 text-right">
                        Total
                      </td>
                      {uniqueCPLs.map((cpl, cIdx) => (
                        <td key={cIdx} className="border border-black p-1">
                          {rps.korelasi
                            .filter((r) => r.kode_cpl_join === cpl)
                            .reduce((a, b) => a + parseFloat(b.persentase), 0)}
                        </td>
                      ))}
                      <td className="border border-black p-1">100</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 5: DESKRIPSI, BAHAN, PUSTAKA */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "85%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-black p-1 px-2 font-bold align-top">
                Deskripsi
                <br />
                Singkat MK
              </td>
              <td className="border border-black p-1 px-2 text-justify">
                {rps.deskripsi_mk}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2 font-bold align-top">
                Bahan Kajian
              </td>
              <td className="border border-black p-1 px-2">
                <ol className="list-decimal pl-4 m-0">
                  {rps.bahan_kajian.map((b, i) => (
                    <li key={i}>{b.isi_teks}</li>
                  ))}
                </ol>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2 font-bold align-top">
                Pustaka
              </td>
              <td className="border border-black p-1 px-2">
                <p className="font-bold underline">Utama:</p>
                <ol className="list-decimal pl-4 m-0 mb-2">
                  {rps.pustaka_utama.map((b, i) => (
                    <li key={i}>{b.isi_teks}</li>
                  ))}
                </ol>
                <p className="font-bold underline">Pendukung:</p>
                <ol className="list-decimal pl-4 m-0">
                  {rps.pustaka_pendukung.map((b, i) => (
                    <li key={i}>{b.isi_teks}</li>
                  ))}
                </ol>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 6: DOSEN & SYARAT */}
        {/* ================================================================================== */}
        <table className={tableStyle}>
          <colgroup>
            <col style={{ width: "15%" }} />
            <col style={{ width: "85%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-black p-1 px-2 font-bold">
                Dosen Pengampu
              </td>
              <td className="border border-black p-1 px-2">: {user.name}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 px-2 font-bold">
                Mata kuliah Syarat
              </td>
              <td className="border border-black p-1 px-2">
                : {rps.mata_kuliah_syarat || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ================================================================================== */}
        {/* TABEL 7: MINGGUAN (GRID BESAR) */}
        {/* ================================================================================== */}
        {/* Header Grid */}
        <table className={tableStyle}>
          <colgroup>
            <col style={{ width: "5%" }} /> {/* Mg ke */}
            <col style={{ width: "20%" }} /> {/* Sub CPMK */}
            <col style={{ width: "10%" }} /> {/* Indikator */}
            <col style={{ width: "10%" }} /> {/* Kriteria */}
            <col style={{ width: "15%" }} /> {/* Luring */}
            <col style={{ width: "15%" }} /> {/* Daring */}
            <col style={{ width: "20%" }} /> {/* Materi */}
            <col style={{ width: "5%" }} /> {/* Bobot */}
          </colgroup>
          <thead className="bg-gray-100 text-center font-bold">
            <tr>
              <td className="border border-black p-1" rowSpan="2">
                Mg ke-
              </td>
              <td className="border border-black p-1" rowSpan="2">
                Sub-CPMK sbg kemampuan akhir yang diharapkan
              </td>
              <td className="border border-black p-1" colSpan="2">
                Penilaian
              </td>
              <td className="border border-black p-1" colSpan="2">
                Bentuk Pembelajaran; Metode Pembelajaran; Penugasan
              </td>
              <td className="border border-black p-1" rowSpan="2">
                Materi Pembelajaran [Pustaka]
              </td>
              <td className="border border-black p-1" rowSpan="2">
                Bobot Nilai (%)
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1">Indikator</td>
              <td className="border border-black p-1">Teknik & Kriteria</td>
              <td className="border border-black p-1">Tatap Muka/Luring</td>
              <td className="border border-black p-1">Daring</td>
            </tr>
            {/* Nomor Kolom */}
            <tr className="text-[9px] italic">
              <td className="border border-black">(1)</td>
              <td className="border border-black">(2)</td>
              <td className="border border-black">(3)</td>
              <td className="border border-black">(4)</td>
              <td className="border border-black">(5)</td>
              <td className="border border-black">(6)</td>
              <td className="border border-black">(7)</td>
              <td className="border border-black">(8)</td>
            </tr>
          </thead>
          <tbody>
            {rps.penilaian.map((p, idx) => (
              <tr key={idx} className="align-top">
                <td className="border border-black p-1 text-center font-bold">
                  {p.minggu_ke}
                </td>
                <td className="border border-black p-1 text-justify">
                  <strong>{p.kode_sub_cpmk}</strong>. {p.deskripsi_sub}
                </td>
                {/* Dummy Data for Display purpose matching image */}
                <td className="border border-black p-1 text-left">
                  Ketepatan menjelaskan..
                </td>
                <td className="border border-black p-1 text-left">
                  <strong>Kriteria:</strong>
                  <br />
                  Pedoman Penskoran
                  <br />
                  <strong>Bentuk:</strong>
                  <br />
                  {p.bentuk_asesmen}
                </td>
                <td className="border border-black p-1 text-left">
                  • Kuliah
                  <br />• Diskusi
                  <br />
                  [TM: 2x50"]
                </td>
                <td className="border border-black p-1 text-left">
                  eLearning
                  <br />
                  LMS
                </td>
                <td className="border border-black p-1 text-left">
                  Materi pertemuan {p.minggu_ke}
                </td>
                <td className="border border-black p-1 text-center font-bold">
                  {p.bobot_penilaian}
                </td>
              </tr>
            ))}
          </tbody>
          {/* FOOTER TOTAL */}
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              <td className="border border-black p-1" colSpan="7"></td>
              <td className="border border-black p-1 text-center">
                TOTAL BOBOT PENILAIAN 100
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DetailRPS;
