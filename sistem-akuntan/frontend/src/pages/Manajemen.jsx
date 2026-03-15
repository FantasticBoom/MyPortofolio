import { useState, useEffect, useRef } from "react";
import {
  Save,
  Lock,
  Users,
  Database,
  Package,
  Shield,
  ArrowLeft,
  Calendar,
  Tag,
  Upload,
  Plus,
  X,
  FileSpreadsheet,
  Pencil,
  Trash2,
  Search, // Icon Search Baru
  Filter, // Icon Filter Baru
  ChevronLeft, // Icon Pagination Baru
  ChevronRight, // Icon Pagination Baru
} from "lucide-react";
import { MainLayout } from "../components/Layout/MainLayout";
import { Card } from "../components/common/Card";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ModalKonfirmasi } from "../components/common/ModalKonfirmasi";
import { useForm } from "../hooks/useForm";
import manajemenService from "../services/manajemenService";
import { formatCurrency } from "../utils/formatCurrency";

export const Manajemen = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data States
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [prices, setPrices] = useState([]);
  const [codings, setCodings] = useState([]);

  // --- STATE BARU UNTUK FILTER & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Edit Mode States
  const [editingId, setEditingId] = useState(null);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);

  // Modal Input State
  const [showInputModal, setShowInputModal] = useState(false);

  // Modal Konfirmasi Delete State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    type: null,
    title: "",
    message: "",
  });

  // Refs
  const fileInputRef = useRef(null);
  const importCodingRef = useRef(null);

  // Forms
  const profileForm = useForm(
    { nama_lengkap: "", email: "" },
    async (data) => await handleUpdateProfile(data)
  );
  const passwordForm = useForm(
    { oldPassword: "", newPassword: "", confirmPassword: "" },
    async (data) => await handleChangePassword(data)
  );

  const periodForm = useForm(
    { nama_periode: "", start_date: "", end_date: "", status: "active" },
    async (data) => {
      if (isEditingPeriod) await handleUpdatePeriod(data);
      else await handleCreatePeriod(data);
    }
  );

  const codingForm = useForm(
    { kode: "", nama_barang: "", kategori: "" },
    async (data) => {
      if (editingId) await handleUpdateCoding(data);
      else await handleCreateCoding(data);
    }
  );

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    if (currentView === "users") fetchAllUsers();
    if (currentView === "periods") fetchPeriods();
    if (currentView === "prices") fetchPrices();
    if (currentView === "coding") fetchCodings();
  }, [currentView]);

  // --- LOGIKA FILTER & PAGINATION ---

  // 1. Filter Data
  const filteredCodings = codings.filter((item) => {
    const itemName = item.nama_barang ? item.nama_barang.toLowerCase() : "";
    const itemKode = item.kode ? item.kode.toLowerCase() : "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      itemName.includes(searchLower) || itemKode.includes(searchLower);

    const matchesCategory = filterCategory
      ? item.kategori &&
        item.kategori.toLowerCase() === filterCategory.toLowerCase()
      : true;

    return matchesSearch && matchesCategory;
  });

  // 2. Hitung Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentCodings = filteredCodings.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredCodings.length / rowsPerPage);

  // Reset page ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, rowsPerPage]);

  // --- API FETCHERS ---
  const fetchCurrentUser = async () => {
    try {
      const res = await manajemenService.getCurrentUser();
      if (res.success) {
        setCurrentUser(res.data);
        profileForm.setFormData({
          nama_lengkap: res.data.nama_lengkap,
          email: res.data.email,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const res = await manajemenService.getAllUsers();
      if (res.success) setAllUsers(res.data);
    } catch (err) {
      setError("Gagal memuat user");
    } finally {
      setLoading(false);
    }
  };
  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const res = await manajemenService.getPeriods();
      if (res.success) setPeriods(res.data);
    } catch (err) {
      setError("Gagal memuat periode");
    } finally {
      setLoading(false);
    }
  };
  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await manajemenService.getPrices();
      if (res.success) setPrices(res.data);
    } catch (err) {
      setError("Gagal memuat harga");
    } finally {
      setLoading(false);
    }
  };
  const fetchCodings = async () => {
    try {
      setLoading(true);
      const res = await manajemenService.getCodings();
      if (res.success) setCodings(res.data);
    } catch (err) {
      setError("Gagal memuat pengkodean");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS UTAMA ---
  const handleUpdateProfile = async (data) => {
    try {
      setSubmitting(true);
      const res = await manajemenService.updateProfile(data);
      if (res.success) {
        setSuccess("Profil diperbarui!");
        await fetchCurrentUser();
      } else setError(res.message);
    } catch (err) {
      setError("Gagal update profil");
    } finally {
      setSubmitting(false);
    }
  };
  const handleChangePassword = async (data) => {
    try {
      setSubmitting(true);
      if (data.newPassword !== data.confirmPassword) {
        setError("Konfirmasi password tidak sesuai");
        return;
      }
      const res = await manajemenService.changePassword(data);
      if (res.success) {
        setSuccess("Password diubah!");
        passwordForm.resetForm();
      } else setError(res.message);
    } catch (err) {
      setError("Gagal ubah password");
    } finally {
      setSubmitting(false);
    }
  };

  // --- DELETE MODAL HANDLERS ---
  const openDeleteModal = (id, type, itemName) => {
    let title = "Konfirmasi Hapus";
    let message = "Apakah Anda yakin ingin menghapus data ini?";
    if (type === "period") {
      title = "Hapus Periode";
      message = `Hapus periode "${itemName}"?`;
    } else if (type === "coding") {
      title = "Hapus Barang";
      message = `Hapus data barang "${itemName}"?`;
    }
    setDeleteModal({ isOpen: true, id, type, title, message });
  };
  const closeDeleteModal = () =>
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
  const handleConfirmDelete = async () => {
    const { id, type } = deleteModal;
    if (!id || !type) return;
    try {
      setSubmitting(true);
      let res;
      if (type === "period") res = await manajemenService.deletePeriod(id);
      else if (type === "coding") res = await manajemenService.deleteCoding(id);

      if (res && res.success) {
        setSuccess("Data berhasil dihapus");
        if (type === "period") fetchPeriods();
        else fetchCodings();
      } else setError(res?.message || "Gagal menghapus");
    } catch (e) {
      setError("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
      closeDeleteModal();
    }
  };

  // --- PERIODE & CODING CRUD HANDLERS (Sama seperti sebelumnya) ---
  const handleCreatePeriod = async (data) => {
    try {
      setSubmitting(true);
      const res = await manajemenService.createPeriod(data);
      if (res.success) {
        setSuccess("Periode dibuat!");
        periodForm.resetForm();
        fetchPeriods();
      } else setError(res.message);
    } catch (err) {
      setError("Gagal");
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdatePeriod = async (data) => {
    try {
      setSubmitting(true);
      const res = await manajemenService.updatePeriod(editingId, data);
      if (res.success) {
        setSuccess("Updated!");
        periodForm.resetForm();
        setIsEditingPeriod(false);
        setEditingId(null);
        fetchPeriods();
      } else setError(res.message);
    } catch (err) {
      setError("Gagal");
    } finally {
      setSubmitting(false);
    }
  };
  const handleEditPeriodClick = (item) => {
    setIsEditingPeriod(true);
    setEditingId(item.id);
    periodForm.setFormData({
      nama_periode: item.nama_periode,
      start_date: item.start_date.split("T")[0],
      end_date: item.end_date.split("T")[0],
      status: item.status || "active",
    });
  };

  const handleCreateCoding = async (data) => {
    try {
      setSubmitting(true);
      const res = await manajemenService.createCoding(data);
      if (res.success) {
        setSuccess("Disimpan!");
        codingForm.resetForm();
        fetchCodings();
        setShowInputModal(false);
      } else setError(res.message);
    } catch (err) {
      setError("Gagal");
    } finally {
      setSubmitting(false);
    }
  };
  const handleUpdateCoding = async (data) => {
    try {
      setSubmitting(true);
      const res = await manajemenService.updateCoding(editingId, data);
      if (res.success) {
        setSuccess("Updated!");
        codingForm.resetForm();
        setEditingId(null);
        fetchCodings();
        setShowInputModal(false);
      } else setError(res.message);
    } catch (err) {
      setError("Gagal");
    } finally {
      setSubmitting(false);
    }
  };
  const handleEditCodingClick = (item) => {
    setEditingId(item.id);
    codingForm.setFormData({
      kode: item.kode,
      nama_barang: item.nama_barang,
      kategori: item.kategori,
    });
    setShowInputModal(true);
  };
  const handleCloseInputModal = () => {
    setShowInputModal(false);
    setEditingId(null);
    codingForm.resetForm();
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setSubmitting(true);
      let res;
      if (type === "prices")
        res = await manajemenService.uploadPrices(formData);
      else if (type === "coding")
        res = await manajemenService.uploadCodings(formData);
      if (res.success) {
        setSuccess("Import Sukses!");
        if (type === "prices") fetchPrices();
        else fetchCodings();
      } else setError(res.message);
    } catch (err) {
      setError("Gagal upload");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (importCodingRef.current) importCodingRef.current.value = "";
    }
  };

  const MenuCard = ({
    icon: Icon,
    title,
    desc,
    footer,
    colorClass,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition cursor-pointer flex flex-col h-full justify-between group"
    >
      <div>
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      </div>
      <div className="pt-4 mt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
          {footer}
        </p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MenuCard
          icon={Users}
          title="Manajemen Pengguna"
          desc="Kelola akun pengguna dan hak akses sistem"
          footer="Akses fitur pengguna"
          colorClass="bg-blue-100 text-blue-600"
          onClick={() => setCurrentView("users")}
        />
        <MenuCard
          icon={Calendar}
          title="Manajemen Periode"
          desc="Atur periode akuntansi"
          footer="Akses fitur periode"
          colorClass="bg-indigo-100 text-indigo-600"
          onClick={() => setCurrentView("periods")}
        />
        <MenuCard
          icon={Package}
          title="Pengkodean Barang"
          desc="Master data kode, nama barang, dan kategori"
          footer="Akses fitur pengkodean"
          colorClass="bg-purple-100 text-purple-600"
          onClick={() => setCurrentView("coding")}
        />
        <MenuCard
          icon={Tag}
          title="Harga Satuan Barang"
          desc="Kelola daftar harga standar barang"
          footer="Akses fitur harga"
          colorClass="bg-teal-100 text-teal-600"
          onClick={() => setCurrentView("prices")}
        />
        <MenuCard
          icon={Database}
          title="Manajemen Database"
          desc="Backup dan restore data sistem"
          footer="Akses fitur database"
          colorClass="bg-green-100 text-green-600"
          onClick={() => setCurrentView("database")}
        />
        <MenuCard
          icon={Shield}
          title="Keamanan"
          desc="Pengaturan keamanan dan log aktivitas"
          footer="Akses fitur keamanan"
          colorClass="bg-orange-100 text-orange-600"
          onClick={() => setCurrentView("security")}
        />
      </div>
      <div className="bg-white rounded-xl border p-6">
        <p className="text-gray-500 text-sm">Sistem Versi 1.0.0</p>
      </div>
    </>
  );

  const renderFeatureView = () => (
    <div className="animate-fade-in relative">
      <button
        onClick={() => setCurrentView("dashboard")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />{" "}
        <span className="font-medium">Kembali ke Menu</span>
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4 text-green-700">
          {success}
        </div>
      )}

      {/* --- VIEW: PENGKODEAN BARANG (UPDATED) --- */}
      {currentView === "coding" && (
        <>
          <Card>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Pengkodean Bahan & Barang
                </h2>
                <p className="text-gray-500 text-sm">
                  Master data kodefikasi barang dan kategori
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={importCodingRef}
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, "coding")}
                />
                <button
                  onClick={() => importCodingRef.current.click()}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <FileSpreadsheet size={18} /> Import Excel
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    codingForm.resetForm();
                    setShowInputModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus size={18} /> Tambah Data
                </button>
              </div>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari Kode atau Nama Barang..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative w-full md:w-64">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Semua Kategori</option>
                  <option value="Bahan">Bahan</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Transaksi">Transaksi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="overflow-x-auto min-h-[300px]">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left w-16 font-semibold text-gray-600">
                          No
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Kode
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Nama Barang
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Kategori
                        </th>
                        <th className="px-4 py-3 text-center w-32 font-semibold text-gray-600">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCodings.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-12 text-gray-500"
                          >
                            Tidak ada data ditemukan.
                          </td>
                        </tr>
                      ) : (
                        currentCodings.map((item, idx) => (
                          <tr
                            key={item.id || idx}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-500">
                              {indexOfFirstRow + idx + 1}
                            </td>
                            <td className="px-4 py-3 font-mono font-medium text-blue-600">
                              {item.kode}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-800">
                              {item.nama_barang}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold
                                ${
                                  item.kategori === "Bahan"
                                    ? "bg-amber-100 text-amber-800"
                                    : item.kategori === "Operasional"
                                    ? "bg-cyan-100 text-cyan-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {item.kategori}
                              </span>
                            </td>
                            <td className="px-4 py-3 flex justify-center gap-2">
                              <button
                                onClick={() => handleEditCodingClick(item)}
                                className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200 transition"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  openDeleteModal(
                                    item.id,
                                    "coding",
                                    item.nama_barang
                                  )
                                }
                                className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- PAGINATION FOOTER --- */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t mt-4 gap-4">
                  {/* Rows Per Page */}
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">Baris per halaman:</span>
                    <select
                      className="border rounded p-1 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Info & Controls */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Menampilkan{" "}
                      {filteredCodings.length > 0 ? indexOfFirstRow + 1 : 0} -{" "}
                      {Math.min(indexOfLastRow, filteredCodings.length)} dari{" "}
                      {filteredCodings.length} data
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Modal Input Form */}
          {showInputModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center p-6 border-b">
                  <h3 className="text-xl font-bold">
                    {editingId ? "Edit Pengkodean" : "Tambah Pengkodean"}
                  </h3>
                  <button
                    onClick={handleCloseInputModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form
                  onSubmit={codingForm.handleSubmit}
                  className="p-6 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kode Barang
                    </label>
                    <input
                      type="text"
                      name="kode"
                      value={codingForm.formData.kode}
                      onChange={codingForm.handleChange}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cth: BRG-001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      name="nama_barang"
                      value={codingForm.formData.nama_barang}
                      onChange={codingForm.handleChange}
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cth: Laptop"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kategori
                    </label>
                    <select
                      name="kategori"
                      value={codingForm.formData.kategori}
                      onChange={codingForm.handleChange}
                      className="w-full border rounded-lg px-3 py-2 outline-none bg-white focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Bahan">Bahan</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Transaksi">Transaksi</option>
                    </select>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseInputModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingId ? "Update" : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW: PERIODS (Standard - Keep Previous Logic) */}
      {currentView === "periods" && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">
              {isEditingPeriod ? "Edit Periode" : "Buat Periode Baru"}
            </h2>
            <form
              onSubmit={periodForm.handleSubmit}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Nama Periode
                </label>
                <input
                  type="text"
                  name="nama_periode"
                  value={periodForm.formData.nama_periode}
                  onChange={periodForm.handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Contoh: Jan 2025"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={periodForm.formData.start_date}
                  onChange={periodForm.handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Selesai
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={periodForm.formData.end_date}
                  onChange={periodForm.handleChange}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-1 flex gap-2">
                {isEditingPeriod && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPeriod(false);
                      setEditingId(null);
                      periodForm.resetForm();
                    }}
                    className="w-1/2 border px-2 py-2 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 h-10 flex items-center justify-center gap-2 ${
                    isEditingPeriod ? "w-1/2" : "w-full"
                  }`}
                >
                  {isEditingPeriod ? <Save size={18} /> : <Plus size={18} />}{" "}
                  {isEditingPeriod ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </Card>
          <Card>
            <h2 className="text-xl font-bold mb-4">Daftar Periode</h2>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Nama Periode</th>
                      <th className="px-4 py-3 text-left">Mulai</th>
                      <th className="px-4 py-3 text-left">Selesai</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-4 text-gray-500"
                        >
                          Belum ada data periode
                        </td>
                      </tr>
                    ) : (
                      periods.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {p.nama_periode}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(p.start_date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(p.end_date).toLocaleDateString("id-ID")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                p.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {p.status || "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex justify-center gap-2">
                            <button
                              onClick={() => handleEditPeriodClick(p)}
                              className="p-1.5 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() =>
                                openDeleteModal(p.id, "period", p.nama_periode)
                              }
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* VIEW: USERS (Standard) */}
      {currentView === "users" && (
        <Card>
          <h2 className="text-2xl font-bold mb-6">Manajemen Pengguna</h2>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Nama Lengkap
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {u.username}
                    </td>
                    <td className="px-4 py-3">{u.nama_lengkap}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* VIEW: PRICES (Standard) */}
      {currentView === "prices" && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Harga Satuan Barang</h2>
              <p className="text-gray-500 text-sm">Standar harga barang</p>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => handleFileUpload(e, "prices")}
              />
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={submitting}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg flex gap-2 hover:bg-teal-700"
              >
                <Upload size={18} /> Import Harga
              </button>
            </div>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Kode
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Nama Barang
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Harga Satuan
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Satuan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prices.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-12 text-gray-500"
                      >
                        Belum ada data harga.
                      </td>
                    </tr>
                  ) : (
                    prices.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-sm text-gray-500">
                          {item.kode_barang || "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.nama_barang}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-teal-700">
                          {typeof formatCurrency === "function"
                            ? formatCurrency(item.harga)
                            : `Rp ${parseInt(item.harga).toLocaleString(
                                "id-ID"
                              )}`}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600 text-sm">
                          {item.satuan}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* VIEW: SECURITY & DB */}
      {currentView === "security" && (
        <Card>
          <h2 className="text-2xl font-bold mb-4">Ubah Password</h2>
          <form
            onSubmit={passwordForm.handleSubmit}
            className="space-y-4 max-w-md"
          >
            <div>
              <label className="block mb-1 font-medium text-sm">
                Password Lama
              </label>
              <input
                type="password"
                className="w-full border p-2 rounded-lg"
                {...passwordForm.register("oldPassword")}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">
                Password Baru
              </label>
              <input
                type="password"
                className="w-full border p-2 rounded-lg"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-sm">
                Konfirmasi Password
              </label>
              <input
                type="password"
                className="w-full border p-2 rounded-lg"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 w-full flex justify-center items-center gap-2"
            >
              <Lock size={16} /> Ubah Password
            </button>
          </form>
        </Card>
      )}
      {currentView === "database" && (
        <Card className="text-center py-12">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Database</h3>
          <p className="text-gray-500 mt-2">Backup & Restore segera hadir.</p>
        </Card>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen</h1>
          <p className="text-gray-600 mt-1">
            Kelola sistem, pengkodean, dan referensi
          </p>
        </div>
        {currentView === "dashboard" ? renderDashboard() : renderFeatureView()}
        <ModalKonfirmasi
          isOpen={deleteModal.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          title={deleteModal.title}
          message={deleteModal.message}
          isLoading={submitting}
        />
      </div>
    </MainLayout>
  );
};
