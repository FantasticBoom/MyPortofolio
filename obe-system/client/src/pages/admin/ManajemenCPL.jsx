import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaBullseye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBook,
  FaListUl,
} from "react-icons/fa";

const ManajemenCPL = () => {
  const [activeTab, setActiveTab] = useState("cpl");

  // --- STATE DATA UTAMA ---
  const [dataCPL, setDataCPL] = useState([]);
  const [dataCPMK, setDataCPMK] = useState([]);
  const [dataSubCPMK, setDataSubCPMK] = useState([]);

  // --- STATE DATA PENDUKUNG (DROPDOWN) ---
  const [listMK, setListMK] = useState([]);
  const [listCPMK, setListCPMK] = useState([]);

  // --- STATE FORM ---
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kode: "",
    deskripsi: "",
    mata_kuliah_id: "",
    cpmk_id: "",
  });

  // --- FETCH DATA LOGIC ---
  useEffect(() => {
    setShowForm(false);
    setFormData({ kode: "", deskripsi: "", mata_kuliah_id: "", cpmk_id: "" });

    if (activeTab === "cpl") fetchCPL();
    if (activeTab === "cpmk") {
      fetchCPMK();
      fetchMataKuliah();
    }
    if (activeTab === "sub-cpmk") {
      fetchSubCPMK();
      fetchCPMK();
    }
  }, [activeTab]);

  // Function Fetching API
  const fetchCPL = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/cpl");
      setDataCPL(res.data);
    } catch (err) {
      console.error("Error fetching CPL:", err);
    }
  };
  const fetchCPMK = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/cpmk");
      setDataCPMK(res.data);
      setListCPMK(res.data);
    } catch (err) {
      console.error("Error fetching CPMK:", err);
    }
  };
  const fetchSubCPMK = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/subcpmk");
      setDataSubCPMK(res.data);
    } catch (err) {
      console.error("Error fetching Sub-CPMK:", err);
    }
  };
  const fetchMataKuliah = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/matakuliah");
      setListMK(res.data);
    } catch (err) {
      console.error("Error fetching MK:", err);
    }
  };

  // --- HANDLE SUBMIT (TAMBAH DATA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "cpl") {
        await axios.post("http://localhost:8081/api/cpl", {
          kode_cpl: formData.kode,
          deskripsi: formData.deskripsi,
        });
        fetchCPL();
      } else if (activeTab === "cpmk") {
        await axios.post("http://localhost:8081/api/cpmk", {
          mata_kuliah_id: formData.mata_kuliah_id,
          kode_cpmk: formData.kode,
          deskripsi: formData.deskripsi,
        });
        fetchCPMK();
      } else if (activeTab === "sub-cpmk") {
        await axios.post("http://localhost:8081/api/subcpmk", {
          cpmk_id: formData.cpmk_id,
          kode_sub_cpmk: formData.kode,
          deskripsi: formData.deskripsi,
        });
        fetchSubCPMK();
      }
      setShowForm(false);
      setFormData({ kode: "", deskripsi: "", mata_kuliah_id: "", cpmk_id: "" });
      alert("Data berhasil disimpan!");
    } catch (err) {
      console.log(err);
      alert("Gagal menyimpan data");
    }
  };

  // --- HANDLE DELETE (PERBAIKAN UTAMA) ---
  const handleDelete = async (id) => {
    // Cek apakah ID valid
    if (!id) {
      alert("Error: ID data tidak ditemukan!");
      return;
    }

    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    let endpoint = "";
    if (activeTab === "cpl") endpoint = `http://localhost:8081/api/cpl/${id}`;
    else if (activeTab === "cpmk")
      endpoint = `http://localhost:8081/api/cpmk/${id}`;
    else if (activeTab === "sub-cpmk")
      endpoint = `http://localhost:8081/api/subcpmk/${id}`;

    console.log(`Menghapus data di endpoint: ${endpoint}`); // Debugging di Console

    try {
      const res = await axios.delete(endpoint);
      if (res.data.Status === "Success") {
        alert("Data berhasil dihapus");
        // Refresh data sesuai tab aktif
        if (activeTab === "cpl") fetchCPL();
        else if (activeTab === "cpmk") fetchCPMK();
        else if (activeTab === "sub-cpmk") fetchSubCPMK();
      } else {
        alert(res.data.Error || "Gagal menghapus data");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Terjadi kesalahan koneksi ke server (Cek Console F12)");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaBullseye className="text-blue-600" /> Manajemen CPL/CPMK/Sub-CPMK
        </h2>
        <p className="text-gray-500 text-sm">Kelola capaian pembelajaran</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="bg-white rounded-t-xl border-b border-gray-200 px-4 pt-4 flex gap-6 overflow-x-auto">
        {["cpl", "cpmk", "sub-cpmk"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 capitalize whitespace-nowrap
                        ${
                          activeTab === tab
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
          >
            {tab === "cpl"
              ? "CPL (Lulusan)"
              : tab === "cpmk"
              ? "CPMK (Mata Kuliah)"
              : "Sub-CPMK"}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 p-6 min-h-[500px]">
        {/* Tombol Tambah */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 mb-6 transition"
          >
            <FaPlus /> Tambah {activeTab.toUpperCase()}
          </button>
        )}

        {/* --- FORM INPUT AREA --- */}
        {showForm && (
          <div className="bg-gray-50 p-6 rounded-xl border border-blue-100 mb-8 animate-fade-in-down">
            <h4 className="font-bold text-gray-700 mb-4 border-b pb-2 uppercase">
              Input Data {activeTab}
            </h4>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                {activeTab === "cpmk" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Kuliah
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                      value={formData.mata_kuliah_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mata_kuliah_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Pilih Mata Kuliah --</option>
                      {listMK.map((mk) => (
                        <option key={mk.id} value={mk.id}>
                          {mk.kode_mk} - {mk.nama_mk}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "sub-cpmk" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Induk CPMK
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                      value={formData.cpmk_id}
                      onChange={(e) =>
                        setFormData({ ...formData, cpmk_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Pilih CPMK --</option>
                      {listCPMK.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.kode_cpmk} ({c.nama_mk || "No MK"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode{" "}
                    {activeTab === "cpl"
                      ? "CPL"
                      : activeTab === "cpmk"
                      ? "CPMK"
                      : "Sub-CPMK"}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder={`Contoh: ${
                      activeTab === "cpl"
                        ? "CPL-A"
                        : activeTab === "cpmk"
                        ? "CPMK-1"
                        : "Sub-CPMK-1"
                    }`}
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                    placeholder="Tuliskan deskripsi capaian pembelajaran..."
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- DISPLAY DATA LIST --- */}
        <div className="space-y-4">
          {/* LIST CPL */}
          {activeTab === "cpl" &&
            dataCPL.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 p-4 rounded-lg flex justify-between items-start hover:shadow-md transition group"
              >
                <div>
                  <span className="font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded text-sm mb-2 inline-block">
                    {item.kode_cpl}
                  </span>
                  <p className="text-gray-600 text-sm">{item.deskripsi}</p>
                </div>
                <div className="flex gap-2">
                  {/* TOMBOL HAPUS CPL */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                    title="Hapus Data"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

          {/* LIST CPMK */}
          {activeTab === "cpmk" &&
            dataCPMK.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start hover:shadow-md transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-indigo-800 bg-indigo-50 px-2 py-1 rounded text-sm">
                      {item.kode_cpmk}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      <FaBook size={10} /> {item.kode_mk} - {item.nama_mk}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.deskripsi}</p>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  {/* TOMBOL HAPUS CPMK */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                    title="Hapus Data"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

          {/* LIST SUB-CPMK */}
          {activeTab === "sub-cpmk" &&
            dataSubCPMK.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start hover:shadow-md transition border-l-4 border-l-teal-500"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded text-sm">
                      {item.kode_sub_cpmk}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      <FaListUl size={10} /> Induk: {item.kode_cpmk}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{item.deskripsi}</p>
                </div>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  {/* TOMBOL HAPUS SUB-CPMK */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                    title="Hapus Data"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

          {/* Empty States */}
          {((activeTab === "cpl" && dataCPL.length === 0) ||
            (activeTab === "cpmk" && dataCPMK.length === 0) ||
            (activeTab === "sub-cpmk" && dataSubCPMK.length === 0)) && (
            <div className="text-center py-10 text-gray-400">
              <p>Belum ada data {activeTab.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManajemenCPL;
