import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaSave,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaBook,
  FaListUl,
  FaLink,
  FaBullseye,
  FaProjectDiagram,
  FaTasks,
  FaSearch,
  FaUserTie,
} from "react-icons/fa";

// --- KOMPONEN DIPINDAHKAN KELUAR (FIX FOCUS ISSUE) ---
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
    />
  </div>
);

const DynamicList = ({
  title,
  data,
  field,
  placeholder,
  onAdd,
  onRemove,
  onChange,
}) => (
  <div className="animate-fade-in-up">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <button
        onClick={() => onAdd(field)}
        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-blue-200 transition flex items-center gap-2"
      >
        <FaPlus /> Tambah Baris
      </button>
    </div>
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex gap-3 group">
          <div className="flex-grow">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value, field)}
              placeholder={placeholder}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            />
          </div>
          {data.length > 1 && (
            <button
              onClick={() => onRemove(index, field)}
              className="bg-red-50 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

// --- KOMPONEN UTAMA ---
const CreateRPS = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  const [step, setStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- DATA STATE ---
  const [listMK, setListMK] = useState([]);
  const [listCPL, setListCPL] = useState([]);
  const [listCPMK, setListCPMK] = useState([]);
  const [listSubCPMK, setListSubCPMK] = useState([]);
  const [listDosen, setListDosen] = useState([]);

  // State khusus untuk Auto Complete Dosen
  const [dosenSearch, setDosenSearch] = useState("");
  const [showDosenDropdown, setShowDosenDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const [formData, setFormData] = useState({
    mata_kuliah_id: "",
    dosen_id: user?.id || "",
    semester: "",
    tahun_akademik: "",
    deskripsi_mk: "",
    mk_syarat: "",
    bahan_kajian: [""],
    pustaka_utama: [""],
    pustaka_pendukung: [""],
    selected_cpl: [],
    selected_cpmk: [],
    selected_sub_cpmk: [],
    matrix_korelasi: {},
    rencana_penilaian: {},
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [mk, cpl, cpmk, sub, dosen] = await Promise.all([
          axios.get("http://localhost:8081/api/matakuliah"),
          axios.get("http://localhost:8081/api/cpl"),
          axios.get("http://localhost:8081/api/cpmk"),
          axios.get("http://localhost:8081/api/subcpmk"),
          axios.get("http://localhost:8081/api/dosen"),
        ]);
        setListMK(mk.data);
        setListCPL(cpl.data);
        setListCPMK(cpmk.data);
        setListSubCPMK(sub.data);
        setListDosen(dosen.data);

        if (!id && user) {
          const currentUserAsDosen = dosen.data.find((d) => d.id === user.id);
          if (currentUserAsDosen) {
            setDosenSearch(currentUserAsDosen.name);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMasterData();
  }, [id, user]);

  // --- LOAD EDIT DATA ---
  useEffect(() => {
    if (id && listDosen.length > 0) {
      setIsEditMode(true);
      loadEditData();
    }
  }, [id, listDosen]);

  const loadEditData = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/rps/detail/${id}`);
      const data = res.data;
      if (!data) return;

      const foundDosen = listDosen.find((d) => d.id === data.dosen_id);
      if (foundDosen) {
        setDosenSearch(foundDosen.name);
      }

      const newForm = {
        mata_kuliah_id: data.mata_kuliah_id,
        dosen_id: data.dosen_id,
        semester: data.semester,
        tahun_akademik: data.tahun_akademik,
        deskripsi_mk: data.deskripsi_mk,
        mk_syarat: data.mata_kuliah_syarat || "",
        bahan_kajian:
          data.bahan_kajian.length > 0
            ? data.bahan_kajian.map((b) => b.isi_teks)
            : [""],
        pustaka_utama:
          data.pustaka_utama.length > 0
            ? data.pustaka_utama.map((p) => p.isi_teks)
            : [""],
        pustaka_pendukung:
          data.pustaka_pendukung.length > 0
            ? data.pustaka_pendukung.map((p) => p.isi_teks)
            : [""],
        selected_cpl: data.korelasi
          ? [...new Set(data.korelasi.map((k) => k.cpl_id))]
          : [],
        selected_cpmk: [],
        selected_sub_cpmk: data.penilaian
          ? [...new Set(data.penilaian.map((p) => p.sub_cpmk_id))]
          : [],
        matrix_korelasi: {},
        rencana_penilaian: {},
      };

      if (data.korelasi) {
        data.korelasi.forEach((k) => {
          if (!newForm.matrix_korelasi[k.sub_cpmk_id])
            newForm.matrix_korelasi[k.sub_cpmk_id] = {};
          newForm.matrix_korelasi[k.sub_cpmk_id][k.cpl_id] = k.persentase;
        });
      }

      if (data.penilaian) {
        data.penilaian.forEach((p) => {
          newForm.rencana_penilaian[p.sub_cpmk_id] = {
            minggu: p.minggu_ke,
            bentuk: p.bentuk_asesmen,
            bobot: p.bobot_penilaian,
          };
        });
      }
      setFormData(newForm);
    } catch (err) {
      console.error("Gagal load data edit:", err);
    }
  };

  // --- AUTO COMPLETE LOGIC ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDosenDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleDosenSearch = (e) => {
    setDosenSearch(e.target.value);
    setShowDosenDropdown(true);
    if (e.target.value === "") {
      setFormData({ ...formData, dosen_id: "" });
    }
  };

  const selectDosen = (dosen) => {
    setDosenSearch(dosen.name);
    setFormData({ ...formData, dosen_id: dosen.id });
    setShowDosenDropdown(false);
  };

  const filteredDosen = listDosen.filter((d) =>
    d.name.toLowerCase().includes(dosenSearch.toLowerCase())
  );

  // --- HANDLERS ---
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArrayTextChange = (index, val, field) => {
    const newArr = [...formData[field]];
    newArr[index] = val;
    setFormData({ ...formData, [field]: newArr });
  };
  const addArrayField = (field) =>
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  const removeArrayField = (index, field) => {
    const newArr = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArr });
  };
  const handleCheck = (id, field) => {
    const currentList = formData[field];
    if (currentList.includes(id)) {
      setFormData({
        ...formData,
        [field]: currentList.filter((item) => item !== id),
      });
    } else {
      setFormData({ ...formData, [field]: [...currentList, id] });
    }
  };

  const stepsList = [
    { id: 1, title: "Identitas MK", icon: <FaInfoCircle /> },
    { id: 2, title: "Bahan Kajian", icon: <FaBook /> },
    { id: 3, title: "Pustaka Utama", icon: <FaListUl /> },
    { id: 4, title: "Pustaka Pendukung", icon: <FaLink /> },
    { id: 5, title: "Pilih CPL & Sub", icon: <FaBullseye /> },
    { id: 6, title: "Matriks Korelasi", icon: <FaProjectDiagram /> },
    { id: 7, title: "Rencana Penilaian", icon: <FaTasks /> },
  ];

  // --- RENDER STEPS ---
  const renderStep1 = () => (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Informasi Mata Kuliah
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Mata Kuliah *
          </label>
          <select
            name="mata_kuliah_id"
            value={formData.mata_kuliah_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">-- Pilih Mata Kuliah --</option>
            {listMK.map((m) => (
              <option key={m.id} value={m.id}>
                {m.kode_mk} - {m.nama_mk} ({m.sks} SKS)
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 relative" ref={wrapperRef}>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Dosen Pengampu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUserTie className="text-gray-400" />
            </div>
            <input
              type="text"
              value={dosenSearch}
              onChange={handleDosenSearch}
              onFocus={() => setShowDosenDropdown(true)}
              placeholder="Ketik nama dosen..."
              className="w-full pl-10 border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-xs" />
            </div>
          </div>
          {showDosenDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredDosen.length > 0 ? (
                filteredDosen.map((dosen) => (
                  <div
                    key={dosen.id}
                    onClick={() => selectDosen(dosen)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b last:border-0"
                  >
                    <p className="font-bold">{dosen.name}</p>
                    <p className="text-xs text-gray-500">{dosen.email}</p>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Dosen tidak ditemukan.
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Semester
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Pilih Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Tahun Ajaran"
          name="tahun_akademik"
          value={formData.tahun_akademik}
          onChange={handleChange}
          placeholder="Contoh: 2023/2024"
        />

        <div className="md:col-span-2">
          <InputField
            label="Mata Kuliah Prasyarat"
            name="mk_syarat"
            value={formData.mk_syarat}
            onChange={handleChange}
            placeholder="Contoh: Algoritma Pemrograman"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Deskripsi Singkat
          </label>
          <textarea
            name="deskripsi_mk"
            value={formData.deskripsi_mk}
            onChange={handleChange}
            rows="4"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Deskripsi singkat mengenai mata kuliah ini..."
          ></textarea>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <DynamicList
      title="Bahan Kajian (Materi Ajar)"
      data={formData.bahan_kajian}
      field="bahan_kajian"
      placeholder="Topik materi..."
      onAdd={addArrayField}
      onRemove={removeArrayField}
      onChange={handleArrayTextChange}
    />
  );
  const renderStep3 = () => (
    <DynamicList
      title="Pustaka Utama (Wajib)"
      data={formData.pustaka_utama}
      field="pustaka_utama"
      placeholder="Judul Buku, Pengarang, Tahun..."
      onAdd={addArrayField}
      onRemove={removeArrayField}
      onChange={handleArrayTextChange}
    />
  );
  const renderStep4 = () => (
    <DynamicList
      title="Pustaka Pendukung"
      data={formData.pustaka_pendukung}
      field="pustaka_pendukung"
      placeholder="Jurnal atau Referensi Tambahan..."
      onAdd={addArrayField}
      onRemove={removeArrayField}
      onChange={handleArrayTextChange}
    />
  );

  // ... (Step 5, 6, 7 tidak perlu diubah, tapi disertakan untuk kelengkapan)
  const renderStep5 = () => (
    <div className="animate-fade-in-up">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3 items-start">
        <FaInfoCircle className="text-blue-600 mt-1" />
        <p className="text-sm text-blue-800">
          Silakan pilih CPL, CPMK, dan Sub-CPMK yang akan dibebankan pada mata
          kuliah ini.
        </p>
      </div>

      {/* Ubah grid menjadi 3 kolom (lg:grid-cols-3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM 1: CPL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <FaBullseye />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">1. Pilih CPL</h3>
              <p className="text-[10px] text-gray-400">
                Capaian Pembelajaran Lulusan
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {listCPL.map((cpl) => (
              <div
                key={cpl.id}
                onClick={() => handleCheck(cpl.id, "selected_cpl")}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                  formData.selected_cpl.includes(cpl.id)
                    ? "bg-blue-600 border-blue-600 text-white shadow-md transform scale-[1.01]"
                    : "bg-gray-50 border-gray-100 hover:bg-white hover:border-blue-300"
                }`}
              >
                <div
                  className={`mt-1 min-w-[18px] h-[18px] rounded border flex items-center justify-center ${
                    formData.selected_cpl.includes(cpl.id)
                      ? "bg-white border-white"
                      : "border-gray-400"
                  }`}
                >
                  {formData.selected_cpl.includes(cpl.id) && (
                    <FaCheck className="text-blue-600 text-[10px]" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    {cpl.kode_cpl}
                  </span>
                  <p
                    className={`text-[11px] mt-1 ${
                      formData.selected_cpl.includes(cpl.id)
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {cpl.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM 2: CPMK (BARU DITAMBAHKAN) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <FaListUl />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">2. Pilih CPMK</h3>
              <p className="text-[10px] text-gray-400">
                Capaian Pembelajaran MK
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {listCPMK.length > 0 ? (
              listCPMK.map((cpmk) => (
                <div
                  key={cpmk.id}
                  onClick={() => handleCheck(cpmk.id, "selected_cpmk")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                    formData.selected_cpmk.includes(cpmk.id)
                      ? "bg-purple-600 border-purple-600 text-white shadow-md transform scale-[1.01]"
                      : "bg-gray-50 border-gray-100 hover:bg-white hover:border-purple-300"
                  }`}
                >
                  <div
                    className={`mt-1 min-w-[18px] h-[18px] rounded border flex items-center justify-center ${
                      formData.selected_cpmk.includes(cpmk.id)
                        ? "bg-white border-white"
                        : "border-gray-400"
                    }`}
                  >
                    {formData.selected_cpmk.includes(cpmk.id) && (
                      <FaCheck className="text-purple-600 text-[10px]" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      {cpmk.kode_cpmk}
                    </span>
                    <p
                      className={`text-[11px] mt-1 ${
                        formData.selected_cpmk.includes(cpmk.id)
                          ? "text-purple-100"
                          : "text-gray-500"
                      }`}
                    >
                      {cpmk.deskripsi}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm mt-10">
                Data CPMK belum tersedia.
              </div>
            )}
          </div>
        </div>

        {/* KOLOM 3: Sub-CPMK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-[500px]">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <FaTasks />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">3. Pilih Sub-CPMK</h3>
              <p className="text-[10px] text-gray-400">
                Kemampuan Akhir Tiap Tahap
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {listSubCPMK.map((sub) => (
              <div
                key={sub.id}
                onClick={() => handleCheck(sub.id, "selected_sub_cpmk")}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                  formData.selected_sub_cpmk.includes(sub.id)
                    ? "bg-green-600 border-green-600 text-white shadow-md transform scale-[1.01]"
                    : "bg-gray-50 border-gray-100 hover:bg-white hover:border-green-300"
                }`}
              >
                <div
                  className={`mt-1 min-w-[18px] h-[18px] rounded border flex items-center justify-center ${
                    formData.selected_sub_cpmk.includes(sub.id)
                      ? "bg-white border-white"
                      : "border-gray-400"
                  }`}
                >
                  {formData.selected_sub_cpmk.includes(sub.id) && (
                    <FaCheck className="text-green-600 text-[10px]" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-sm block">
                    {sub.kode_sub_cpmk}
                  </span>
                  <p
                    className={`text-[11px] mt-1 ${
                      formData.selected_sub_cpmk.includes(sub.id)
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    {sub.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="animate-fade-in-up">
      {/* Info Header */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 flex gap-4 items-center shadow-sm">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <FaProjectDiagram size={20} />
        </div>
        <div>
          <h3 className="font-bold text-blue-800">Matriks Korelasi</h3>
          <p className="text-sm text-blue-600">
            Isikan bobot persentase (%) kontribusi Sub-CPMK terhadap CPL.
          </p>
        </div>
      </div>

      {/* VALIDASI JIKA KOSONG */}
      {formData.selected_cpl.length === 0 ||
      formData.selected_sub_cpmk.length === 0 ? (
        <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="text-gray-500 font-medium">
            Data CPL atau Sub-CPMK belum dipilih.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Silakan kembali ke Step 5 untuk memilih data.
          </p>
          <button
            onClick={() => setStep(5)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition"
          >
            Kembali ke Step 5
          </button>
        </div>
      ) : (
        /* TABEL MATRIX GRID PROFESSIONAL */
        <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md bg-white">
          <table className="w-full text-sm border-collapse">
            {/* TABLE HEAD */}
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                <th className="p-4 border-b border-r border-gray-300 text-left w-1/3 min-w-[250px] sticky left-0 bg-gray-100 z-10">
                  Sub-CPMK
                </th>
                {formData.selected_cpl.map((cplId) => {
                  const cpl = listCPL.find((c) => c.id === cplId);
                  return (
                    <th
                      key={cplId}
                      className="p-3 border-b border-r border-gray-300 text-center min-w-[100px]"
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-blue-700 text-sm">
                          {cpl?.kode_cpl}
                        </span>
                        <span className="text-[10px] text-gray-500 font-normal mt-0.5 line-clamp-1 w-24">
                          {cpl?.deskripsi}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-200">
              {formData.selected_sub_cpmk.map((subId, idx) => {
                const sub = listSubCPMK.find((s) => s.id === subId);
                return (
                  <tr
                    key={subId}
                    className={`hover:bg-blue-50 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Kolom Kiri (Sub-CPMK) */}
                    <td className="p-4 border-r border-gray-300 sticky left-0 bg-inherit z-10">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-sm mb-1">
                          {sub?.kode_sub_cpmk}
                        </span>
                        <span className="text-gray-600 text-xs leading-snug">
                          {sub?.deskripsi}
                        </span>
                      </div>
                    </td>

                    {/* Kolom Input (Looping CPL) */}
                    {formData.selected_cpl.map((cplId) => (
                      <td
                        key={cplId}
                        className="p-0 border-r border-gray-200 relative"
                      >
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          className="w-full h-full min-h-[60px] text-center bg-transparent focus:bg-white focus:ring-inset focus:ring-2 focus:ring-blue-500 outline-none transition font-semibold text-gray-700 text-base"
                          value={
                            formData.matrix_korelasi[subId]?.[cplId] !==
                            undefined
                              ? formData.matrix_korelasi[subId][cplId]
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            // Update State
                            setFormData((prev) => ({
                              ...prev,
                              matrix_korelasi: {
                                ...prev.matrix_korelasi,
                                [subId]: {
                                  ...prev.matrix_korelasi[subId],
                                  [cplId]: val,
                                },
                              },
                            }));
                          }}
                        />
                        {/* Simbol % kecil di pojok input agar user tahu ini persen */}
                        <span className="absolute top-1 right-1 text-[9px] text-gray-300 pointer-events-none font-bold">
                          %
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderStep7 = () => (
    <div className="animate-fade-in-up space-y-4">
      <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4 flex gap-3 items-center">
        <FaInfoCircle className="text-green-600 text-xl" />
        <p className="text-sm text-green-800 font-medium">
          Tentukan target mingguan dan bobot penilaian.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {formData.selected_sub_cpmk.map((subId) => {
          const sub = listSubCPMK.find((s) => s.id === subId);
          const nilai = formData.rencana_penilaian[subId] || {};

          return (
            <div
              key={subId}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {sub?.kode_sub_cpmk}
                </span>
                <span className="text-gray-700 font-medium text-sm truncate">
                  {sub?.deskripsi}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Minggu Ke-
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1-2"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                    value={nilai.minggu || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rencana_penilaian: {
                          ...formData.rencana_penilaian,
                          [subId]: { ...nilai, minggu: e.target.value },
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Bentuk Asesmen
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                    value={nilai.bentuk || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rencana_penilaian: {
                          ...formData.rencana_penilaian,
                          [subId]: { ...nilai, bentuk: e.target.value },
                        },
                      })
                    }
                  >
                    <option value="">-- Pilih --</option>
                    <option value="Tugas">Tugas</option>
                    <option value="Kuis">Kuis</option>
                    <option value="UTS">UTS</option>
                    <option value="UAS">UAS</option>
                    <option value="Praktikum">Praktikum</option>
                    <option value="Proyek">Proyek</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                    Bobot (%)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-blue-600"
                    value={nilai.bobot || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rencana_penilaian: {
                          ...formData.rencana_penilaian,
                          [subId]: { ...nilai, bobot: e.target.value },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleFinalSubmit = async () => {
    if (!formData.mata_kuliah_id || !formData.dosen_id) {
      alert("Harap lengkapi Mata Kuliah dan Dosen Pengampu!");
      return;
    }

    const payload = {
      mata_kuliah_id: formData.mata_kuliah_id,
      dosen_id: formData.dosen_id,
      semester: formData.semester,
      tahun_akademik: formData.tahun_akademik,
      deskripsi_mk: formData.deskripsi_mk,
      mk_syarat: formData.mk_syarat || "-",
      bahan_kajian: formData.bahan_kajian.filter((t) => t.trim() !== ""),
      pustaka_utama: formData.pustaka_utama.filter((t) => t.trim() !== ""),
      pustaka_pendukung: formData.pustaka_pendukung.filter(
        (t) => t.trim() !== ""
      ),
      matrix_korelasi: [],
      rencana_penilaian: [],
    };

    Object.keys(formData.matrix_korelasi).forEach((subId) => {
      const cplData = formData.matrix_korelasi[subId];
      Object.keys(cplData).forEach((cplId) => {
        if (cplData[cplId] > 0) {
          payload.matrix_korelasi.push({
            sub_cpmk_id: parseInt(subId),
            cpl_id: parseInt(cplId),
            persentase: parseFloat(cplData[cplId]),
          });
        }
      });
    });

    Object.keys(formData.rencana_penilaian).forEach((subId) => {
      const item = formData.rencana_penilaian[subId];
      if (item.minggu && item.bobot) {
        payload.rencana_penilaian.push({
          sub_cpmk_id: parseInt(subId),
          minggu_ke: item.minggu,
          bentuk_asesmen: item.bentuk || "Tugas",
          bobot: parseFloat(item.bobot),
        });
      }
    });

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8081/api/rps/${id}`, payload);
        alert("RPS Berhasil Diperbarui!");
      } else {
        await axios.post("http://localhost:8081/api/rps", payload);
        alert("RPS Berhasil Disimpan!");
      }
      navigate("/dosen/dashboard");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan RPS");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-blue-700 flex items-center gap-2">
            <span className="bg-blue-600 text-white rounded-lg p-1.5">
              <FaProjectDiagram size={16} />
            </span>
            OBE System
          </h2>
          <p className="text-xs text-gray-500 mt-1 ml-9">
            Rencana Pembelajaran Semester
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {stepsList.map((s) => {
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div
                key={s.id}
                onClick={() => (isDone ? setStep(s.id) : null)}
                className={`
                            flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
                            ${
                              isActive
                                ? "bg-blue-50 border-l-4 border-blue-600"
                                : ""
                            }
                            ${
                              isDone
                                ? "text-gray-600 hover:bg-gray-50"
                                : "text-gray-400"
                            }
                        `}
              >
                <div
                  className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                            ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : ""
                            }
                            ${isDone ? "bg-green-500 text-white" : ""}
                            ${
                              !isActive && !isDone
                                ? "bg-gray-100 text-gray-500"
                                : ""
                            }
                        `}
                >
                  {isDone ? <FaCheck /> : s.id}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-sm font-semibold ${
                      isActive ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {isActive ? "Sedang Diisi" : isDone ? "Selesai" : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => navigate("/dosen/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm font-semibold transition"
          >
            <FaArrowLeft /> Batal & Kembali
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 lg:ml-72 p-4 md:p-8 overflow-x-hidden">
        <div className="lg:hidden mb-6 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">Buat RPS</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            Step {step}/7
          </span>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {stepsList[step - 1].title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Lengkapi data berikut dengan benar.
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                {stepsList[step - 1].icon}
              </div>
            </div>

            <div className="p-8 flex-1">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
              {step === 6 && renderStep6()}
              {step === 7 && renderStep7()}
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setStep(step > 1 ? step - 1 : step)}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  step === 1
                    ? "opacity-0 pointer-events-none"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <FaArrowLeft /> Sebelumnya
              </button>

              {step < 7 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  Selanjutnya <FaArrowRight />
                </button>
              ) : (
                <button
                  onClick={handleFinalSubmit}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-200 hover:shadow-green-300 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <FaSave />{" "}
                  {isEditMode ? "Simpan Perubahan" : "Selesai & Simpan"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRPS;
