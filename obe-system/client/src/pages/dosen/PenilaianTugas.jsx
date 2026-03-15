import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaSearch,
  FaSave,
  FaExclamationCircle,
  FaTrophy,
  FaChartLine,
} from "react-icons/fa";

const PenilaianTugas = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [listRPS, setListRPS] = useState([]);
  const [selectedRPS, setSelectedRPS] = useState("");
  const [mahasiswa, setMahasiswa] = useState([]);
  const [nilaiData, setNilaiData] = useState({});

  // Struktur Data Header (Hierarchy: CPL -> CPMK -> Sub-CPMK)
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. LOAD LIST RPS ---
  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/dosen/rps/${user.id}`)
      .then((res) => setListRPS(res.data))
      .catch((err) => console.error(err));
  }, [user.id]);

  // --- 2. LOAD DATA SAAT RPS DIPILIH ---
  useEffect(() => {
    if (selectedRPS) {
      loadData();
    }
  }, [selectedRPS]);

  const loadData = async () => {
    setLoading(true);
    try {
      // A. Ambil Mahasiswa Kelas
      const resMhs = await axios.get(
        `http://localhost:8081/api/rps/mahasiswa/${selectedRPS}`
      );
      setMahasiswa(resMhs.data);

      // B. Ambil Nilai Existing
      const resNilai = await axios.get(
        `http://localhost:8081/api/nilai/${selectedRPS}`
      );
      const mapNilai = {};
      resNilai.data.forEach((n) => {
        mapNilai[`${n.mahasiswa_id}_${n.sub_cpmk_id}`] = n.nilai;
      });
      setNilaiData(mapNilai);

      // C. Ambil Struktur Penilaian (Hierarchy)
      // Kita perlu custom endpoint atau memproses data raw agar membentuk tree: CPL -> CPMK -> Sub
      // Disini kita asumsi endpoint 'structure' mengembalikan flat data yang lengkap, lalu kita group manual.
      const resStruct = await axios.get(
        `http://localhost:8081/api/nilai/structure/${selectedRPS}`
      );
      processStructure(resStruct.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. PROCESS HIERARCHY STRUCTURE ---
  const processStructure = (flatData) => {
    // Grouping Logic:
    // CPL 1
    //   -> CPMK A
    //      -> Sub 1 (Bobot 5%)
    //      -> Sub 2 (Bobot 10%)

    const cplMap = {};

    flatData.forEach((item) => {
      // 1. Group by CPL
      if (!cplMap[item.kode_cpl]) {
        cplMap[item.kode_cpl] = {
          id: item.cpl_id,
          kode: item.kode_cpl,
          cpmkMap: {}, // Nested Map for CPMK
        };
      }

      // 2. Group by CPMK (Kita asumsi data structure mengembalikan kode_cpmk juga, jika tidak kita pakai placeholder)
      // Note: Pastikan endpoint API 'structure' Anda me-return kolom cpmk.kode_cpmk & cpmk.id
      // Jika belum ada di API, Anda bisa modifikasi backend.
      // *SEMENTARA*: Kita pakai Sub-CPMK parent logic atau dummy grouping jika data CPMK tidak ada di join.
      // Asumsi: item.kode_cpmk tersedia.

      // Fallback jika API belum join ke tabel CPMK: Anggap 1 CPL punya list Sub langsung (Skip level CPMK visual)
      // Tapi agar mirip gambar excel (ada level CPMK), kita coba simulasi atau ambil dari item.
      const cpmkKey = item.kode_cpmk || "CPMK-Umum";

      if (!cplMap[item.kode_cpl].cpmkMap[cpmkKey]) {
        cplMap[item.kode_cpl].cpmkMap[cpmkKey] = {
          kode: cpmkKey,
          subs: [],
        };
      }

      // 3. Push Sub-CPMK
      cplMap[item.kode_cpl].cpmkMap[cpmkKey].subs.push({
        subId: item.sub_cpmk_id,
        subKode: item.kode_sub_cpmk,
        bobot: item.persentase,
      });
    });

    // Convert Map to Array for Rendering
    const resultArray = Object.values(cplMap).map((cpl) => ({
      ...cpl,
      cpmks: Object.values(cpl.cpmkMap),
    }));

    // Sort by CPL Code
    resultArray.sort((a, b) => a.kode.localeCompare(b.kode));

    setStructure(resultArray);
  };

  // --- 4. HANDLE INPUT NILAI ---
  const handleNilaiChange = (mhsId, subId, val) => {
    if (val > 100) return; // Prevent > 100
    setNilaiData((prev) => ({ ...prev, [`${mhsId}_${subId}`]: val }));
  };

  const saveNilai = async (mhsId, subId) => {
    const val = nilaiData[`${mhsId}_${subId}`];
    // Allow saving 0 or empty (as null/0)
    if (val === undefined) return;

    try {
      await axios.post("http://localhost:8081/api/nilai/save", {
        rps_id: selectedRPS,
        mahasiswa_id: mhsId,
        sub_cpmk_id: subId,
        nilai: val === "" ? 0 : parseFloat(val),
      });
    } catch (err) {
      console.error("Gagal simpan nilai per cell", err);
    }
  };

  // --- 5. CALCULATION LOGIC ---
  const calculateCPLScore = (mhsId, cplData) => {
    // Hitung rata-rata atau bobot total untuk SATU kolom CPL
    // Rumus: (Sum(Nilai Sub * Bobot Sub)) / Total Bobot Sub di CPL ini
    let totalScore = 0;
    let totalBobot = 0;

    cplData.cpmks.forEach((cpmk) => {
      cpmk.subs.forEach((sub) => {
        const val = parseFloat(nilaiData[`${mhsId}_${sub.subId}`] || 0);
        totalScore += val * sub.bobot;
        totalBobot += sub.bobot;
      });
    });

    if (totalBobot === 0) return 0;
    return (totalScore / totalBobot).toFixed(2); // Skala 100
  };

  const calculateFinalScore = (mhsId) => {
    // Total Akhir = Rata-rata dari semua komponen CPL yang sudah dibobotkan
    // Atau akumulasi murni dari semua Sub-CPMK * Bobot Global
    let totalScore = 0;
    let totalBobot = 0;

    structure.forEach((cpl) => {
      cpl.cpmks.forEach((cpmk) => {
        cpmk.subs.forEach((sub) => {
          const val = parseFloat(nilaiData[`${mhsId}_${sub.subId}`] || 0);
          totalScore += val * sub.bobot;
          totalBobot += sub.bobot;
        });
      });
    });

    // Normalisasi ke 100% jika total bobot tidak 100
    // Misal total bobot di RPS baru 50%, maka nilai 40/50 = 80.
    return totalBobot > 0 ? ((totalScore / totalBobot) * 100).toFixed(2) : 0;
  };

  const getGrade = (score) => {
    const s = parseFloat(score);
    if (s >= 85) return "A";
    if (s >= 80) return "A-";
    if (s >= 75) return "B+";
    if (s >= 70) return "B";
    if (s >= 65) return "B-";
    if (s >= 60) return "C+";
    if (s >= 55) return "C";
    if (s >= 40) return "D";
    return "E";
  };

  // --- FILTER MAHASISWA ---
  const filteredMhs = mahasiswa.filter(
    (m) =>
      m.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nim.includes(searchTerm)
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6 font-sans text-gray-800">
      {/* HEADER PAGE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-2 rounded-lg">
              <FaClipboardList size={20} />
            </span>
            Buku Nilai Mahasiswa
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-11">
            Input dan monitoring capaian CPL & CPMK mahasiswa.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
          <FaSearch className="text-gray-400 ml-2" />
          <input
            type="text"
            placeholder="Cari Mahasiswa..."
            className="outline-none text-sm w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* SELECTION CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Pilih Mata Kuliah (RPS) :
        </label>
        <select
          className="w-full md:w-1/2 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
          value={selectedRPS}
          onChange={(e) => setSelectedRPS(e.target.value)}
        >
          <option value="">-- Pilih Mata Kuliah --</option>
          {listRPS.map((rps) => (
            <option key={rps.id} value={rps.id}>
              Semester {rps.semester} - {rps.kode_mk} {rps.nama_mk}
            </option>
          ))}
        </select>
      </div>

      {/* MAIN CONTENT TABLE */}
      {selectedRPS ? (
        loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 animate-pulse font-medium">
              Memuat Data Penilaian...
            </p>
          </div>
        ) : structure.length === 0 ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-100">
            <FaExclamationCircle className="text-red-400 text-4xl mx-auto mb-3" />
            <h3 className="text-red-800 font-bold text-lg">
              Matriks Penilaian Kosong
            </h3>
            <p className="text-red-600 text-sm max-w-md mx-auto mt-2">
              RPS ini belum memiliki bobot penilaian pada{" "}
              <strong>Step 6 (Matriks Korelasi)</strong>. Silakan edit RPS dan
              isi persentase kontribusi Sub-CPMK terhadap CPL.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* WRAPPER OVERFLOW UNTUK TABEL */}
            <div className="overflow-x-auto custom-scrollbar pb-4">
              <table className="min-w-max border-collapse text-sm text-center">
                <thead>
                  {/* --- ROW 1: HEADER CPL --- */}
                  <tr className="bg-gray-100 text-gray-800 font-bold uppercase tracking-wider text-xs">
                    {/* Sticky Identity Columns */}
                    <th
                      rowSpan="3"
                      className="p-3 border border-gray-300 bg-gray-100 sticky left-0 z-30 w-12 shadow-sm"
                    >
                      No
                    </th>
                    <th
                      rowSpan="3"
                      className="p-3 border border-gray-300 bg-gray-100 sticky left-12 z-30 w-32 shadow-sm"
                    >
                      NIM
                    </th>
                    <th
                      rowSpan="3"
                      className="p-3 border border-gray-300 bg-gray-100 text-left sticky left-44 z-30 w-64 shadow-sm min-w-[200px]"
                    >
                      Nama Mahasiswa
                    </th>

                    {/* Dynamic CPL Headers */}
                    {structure.map((cpl, idx) => {
                      // Hitung total colspan dari semua sub di dalam semua cpmk di cpl ini
                      const totalSubs = cpl.cpmks.reduce(
                        (acc, curr) => acc + curr.subs.length,
                        0
                      );
                      return (
                        <th
                          key={`cpl-${idx}`}
                          colSpan={totalSubs}
                          className="p-2 border border-gray-300 bg-blue-100 text-blue-900 border-b-2 border-b-blue-300"
                        >
                          {cpl.kode}
                        </th>
                      );
                    })}

                    {/* Result Columns */}
                    {structure.map((cpl) => (
                      <th
                        key={`res-cpl-${cpl.id}`}
                        rowSpan="3"
                        className="p-2 border border-gray-300 bg-yellow-50 text-yellow-800 w-16 writing-vertical rotate-180"
                      >
                        <span className="block transform rotate-90 whitespace-nowrap">
                          Skor {cpl.kode}
                        </span>
                      </th>
                    ))}
                    <th
                      rowSpan="3"
                      className="p-3 border border-gray-300 bg-green-100 text-green-900 w-20"
                    >
                      Nilai
                      <br />
                      Total
                    </th>
                    <th
                      rowSpan="3"
                      className="p-3 border border-gray-300 bg-green-100 text-green-900 w-16"
                    >
                      Grade
                    </th>
                  </tr>

                  {/* --- ROW 2: HEADER CPMK --- */}
                  <tr className="bg-white text-gray-700 font-semibold text-xs">
                    {structure.map((cpl) =>
                      cpl.cpmks.map((cpmk, cIdx) => (
                        <th
                          key={`cpmk-${cIdx}`}
                          colSpan={cpmk.subs.length}
                          className="p-2 border border-gray-300 bg-gray-50 text-gray-600"
                        >
                          {cpmk.kode}
                        </th>
                      ))
                    )}
                  </tr>

                  {/* --- ROW 3: HEADER SUB-CPMK + BOBOT --- */}
                  <tr className="bg-white text-gray-600 text-[10px]">
                    {structure.map((cpl) =>
                      cpl.cpmks.map((cpmk) =>
                        cpmk.subs.map((sub, sIdx) => (
                          <th
                            key={`sub-${sub.subId}`}
                            className="p-2 border border-gray-300 bg-white min-w-[60px] hover:bg-gray-50 transition"
                          >
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-blue-600">
                                {sub.subKode}
                              </span>
                              <span className="bg-gray-100 text-gray-500 rounded px-1 py-0.5 border border-gray-200">
                                {sub.bobot}%
                              </span>
                            </div>
                          </th>
                        ))
                      )
                    )}
                  </tr>
                </thead>

                {/* --- BODY --- */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMhs.length > 0 ? (
                    filteredMhs.map((m, idx) => {
                      const finalScore = calculateFinalScore(m.mhs_id);
                      const grade = getGrade(finalScore);
                      const isPass = parseFloat(finalScore) >= 55; // C ke atas lulus

                      return (
                        <tr
                          key={m.mhs_id}
                          className="hover:bg-blue-50/50 transition duration-150 group"
                        >
                          {/* Sticky Identity Cells */}
                          <td className="p-2 border border-gray-300 bg-white group-hover:bg-blue-50/50 sticky left-0 z-20 font-medium text-gray-500">
                            {idx + 1}
                          </td>
                          <td className="p-2 border border-gray-300 bg-white group-hover:bg-blue-50/50 sticky left-12 z-20 font-mono text-gray-700">
                            {m.nim}
                          </td>
                          <td className="p-2 border border-gray-300 bg-white group-hover:bg-blue-50/50 text-left sticky left-44 z-20 font-semibold text-gray-800 truncate max-w-[200px]">
                            {m.nama_lengkap}
                          </td>

                          {/* Input Cells */}
                          {structure.map((cpl) =>
                            cpl.cpmks.map((cpmk) =>
                              cpmk.subs.map((sub) => (
                                <td
                                  key={`val-${m.mhs_id}-${sub.subId}`}
                                  className="p-0 border border-gray-300 relative h-10"
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full h-full text-center border-none outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-transparent font-medium text-gray-700"
                                    value={
                                      nilaiData[`${m.mhs_id}_${sub.subId}`] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      handleNilaiChange(
                                        m.mhs_id,
                                        sub.subId,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() =>
                                      saveNilai(m.mhs_id, sub.subId)
                                    }
                                  />
                                </td>
                              ))
                            )
                          )}

                          {/* Result Per CPL */}
                          {structure.map((cpl) => (
                            <td
                              key={`res-val-${cpl.id}`}
                              className="p-2 border border-gray-300 bg-yellow-50 font-bold text-gray-700 text-xs"
                            >
                              {calculateCPLScore(m.mhs_id, cpl)}
                            </td>
                          ))}

                          {/* Final Result */}
                          <td
                            className={`p-2 border border-gray-300 font-bold text-sm ${
                              isPass
                                ? "text-gray-800 bg-green-50"
                                : "text-red-600 bg-red-50"
                            }`}
                          >
                            {finalScore}
                          </td>
                          <td
                            className={`p-2 border border-gray-300 font-bold text-lg ${
                              isPass ? "text-blue-600" : "text-red-500"
                            }`}
                          >
                            {grade}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="100"
                        className="p-8 text-center text-gray-400"
                      >
                        Data mahasiswa tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER STATS */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-wrap justify-between items-center text-sm gap-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-blue-500" />
                  <span className="text-gray-600">
                    Total Mahasiswa:{" "}
                    <strong className="text-gray-800">
                      {filteredMhs.length}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  <span className="text-gray-600">
                    Lulus:{" "}
                    <strong className="text-green-600">
                      {filteredMhs.length > 0 ? "Calculating..." : "0"}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="text-gray-400 text-xs italic">
                * Nilai otomatis tersimpan saat Anda pindah kolom (Auto-Save).
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <FaClipboardList className="text-blue-400 text-3xl" />
          </div>
          <h3 className="text-gray-700 font-bold text-lg">Pilih Mata Kuliah</h3>
          <p className="text-gray-400 text-sm mt-1">
            Silakan pilih kelas di atas untuk mulai mengisi nilai.
          </p>
        </div>
      )}
    </div>
  );
};

export default PenilaianTugas;
