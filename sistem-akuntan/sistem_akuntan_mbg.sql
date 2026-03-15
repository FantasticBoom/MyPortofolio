-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 12, 2025 at 10:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sistem_akuntan_mbg`
--

-- --------------------------------------------------------

--
-- Table structure for table `biaya_operasional`
--

CREATE TABLE `biaya_operasional` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periode_id` int(11) NOT NULL,
  `tanggal` date DEFAULT NULL,
  `kode` varchar(50) DEFAULT NULL,
  `uraian` varchar(255) DEFAULT NULL,
  `jenis_biaya` enum('biaya_sewa','biaya_operasional','biaya_bahan_baku') NOT NULL,
  `qty` int(11) DEFAULT NULL,
  `satuan` varchar(50) DEFAULT NULL,
  `harga_satuan` decimal(15,2) DEFAULT NULL,
  `nominal` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `buku_kas`
--

CREATE TABLE `buku_kas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tanggal` date NOT NULL,
  `kode_akun` varchar(50) DEFAULT NULL,
  `no_bukti` varchar(100) DEFAULT NULL,
  `uraian` varchar(255) DEFAULT NULL,
  `pemasukan` decimal(15,2) DEFAULT 0.00,
  `pengeluaran` decimal(15,2) DEFAULT 0.00,
  `saldo` decimal(15,2) DEFAULT NULL,
  `bukti_nota` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buku_kas`
--

INSERT INTO `buku_kas` (`id`, `user_id`, `tanggal`, `kode_akun`, `no_bukti`, `uraian`, `pemasukan`, `pengeluaran`, `saldo`, `bukti_nota`, `created_at`, `updated_at`) VALUES
(23, 2, '2025-11-10', '3001', '', 'Saldo Awal', 1666549730.00, 0.00, 1666549730.00, NULL, '2025-12-10 08:14:03', '2025-12-10 08:28:36'),
(24, 2, '2025-11-22', '5001', '', 'Honor 47 Tenaga Dapur periode 12 hari (tanggal 10 November s.d 22 November 2025)', 0.00, 62675000.00, 1603874730.00, NULL, '2025-12-10 08:17:05', '2025-12-10 08:28:36'),
(25, 2, '2025-11-22', '2102', '', 'Pelunasan GAS LPG 12 Kg sejumlah  ta57bung kepada PT Farrez Makmur Abadi (Tanggal 10 November s.d 22 November 2025)', 0.00, 11115000.00, 1592759730.00, NULL, '2025-12-10 08:20:15', '2025-12-10 08:28:36'),
(26, 2, '2025-11-22', '5002', '', 'Insentif Mitra periode  12 Hari (tanggal 10 November s.d 22 November 2025)', 0.00, 72000000.00, 1520759730.00, NULL, '2025-12-10 08:21:08', '2025-12-10 08:28:36'),
(27, 2, '2025-11-22', '5005', '', 'Pembayaran Sewa kendaraan ke RAMA RENTCAR untuk periode 1 bulan November', 0.00, 11400000.00, 1509359730.00, NULL, '2025-12-10 08:22:51', '2025-12-10 08:28:36'),
(28, 2, '2025-11-22', '5006', '', 'Admin Sewa Kendaraan', 0.00, 6500.00, 1509353230.00, NULL, '2025-12-10 08:23:34', '2025-12-10 08:28:36'),
(29, 2, '2025-11-22', '5003', '', 'Pelunasan Belanja Operasional Periode 12 hari (tanggal 10 November s.d 22 November 2025)', 0.00, 9592000.00, 1499761230.00, NULL, '2025-12-10 08:25:34', '2025-12-10 08:28:36'),
(30, 2, '2025-11-22', '2101', '', 'Pelunasan Belanja Bahan Baku kepada Koperasi Jasa Kolpa Posai Sejahtera Periode 12 hari (tanggal 10 November s.d 22 November 2025)', 0.00, 390733840.00, 1109027390.00, NULL, '2025-12-10 08:27:18', '2025-12-10 08:28:36'),
(36, 2, '2025-11-22', '5001', '', 'Honor Kader Posyandu Sri ratu periode 12 Hari (tanggal 13 Oktober s.d 25 Oktober 2025)', 0.00, 1740000.00, 1107287390.00, NULL, '2025-12-10 08:46:27', '2025-12-10 08:46:27'),
(37, 2, '2025-11-22', '5001', '', 'Honor Kader Posyandu Flamboyan periode 12 Hari (tanggal 13 Oktober s.d 25 Oktober 2025)', 0.00, 780000.00, 1106507390.00, NULL, '2025-12-10 08:47:01', '2025-12-10 08:47:01'),
(38, 2, '2025-11-22', '5006', '', 'Honor Kader Posyandu Flamboyan periode 12 Hari (tanggal 13 Oktober s.d 25 Oktober 2025)', 0.00, 6500.00, 1106500890.00, NULL, '2025-12-10 08:47:25', '2025-12-10 08:47:25'),
(39, 2, '2025-11-22', '5001', '', 'Honor Kader Posyandu Kasih Ibu periode 12 Hari (tanggal 13 Oktober s.d 25 Oktober 2025)', 0.00, 1152000.00, 1105348890.00, NULL, '2025-12-10 08:48:02', '2025-12-10 08:48:02'),
(40, 2, '2025-11-22', '5006', '', 'Admin Honor kader Poyandu kasih Ibu', 0.00, 6500.00, 1105342390.00, NULL, '2025-12-10 08:48:31', '2025-12-10 08:48:31'),
(41, 2, '2025-11-22', '2102', '', 'Pembayaran Tagihan BPJS Bulan November\r\n', 0.00, 789599.00, 1104552791.00, NULL, '2025-12-10 08:49:01', '2025-12-10 08:49:01');

-- --------------------------------------------------------

--
-- Table structure for table `dana_diajukan`
--

CREATE TABLE `dana_diajukan` (
  `id` int(11) NOT NULL,
  `penggunaan_anggaran_id` int(11) NOT NULL,
  `tanggal_diajukan` date NOT NULL,
  `periode` varchar(100) DEFAULT NULL,
  `nama_proposal` varchar(255) DEFAULT NULL,
  `biaya_diajukan` enum('biaya_sewa','biaya_operasional','biaya_bahan_baku') NOT NULL,
  `jumlah_dana_diajukan` decimal(15,2) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `dokumen_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dana_proposal`
--

CREATE TABLE `dana_proposal` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periode` varchar(50) NOT NULL,
  `judul_proposal` varchar(255) DEFAULT NULL,
  `dana_diajukan` decimal(15,2) DEFAULT 0.00,
  `dokumen_pengajuan` varchar(255) DEFAULT NULL,
  `dana_diterima` decimal(15,2) DEFAULT 0.00,
  `dokumen_penerimaan` varchar(255) DEFAULT NULL,
  `selisih` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dana_proposal`
--

INSERT INTO `dana_proposal` (`id`, `user_id`, `periode`, `judul_proposal`, `dana_diajukan`, `dokumen_pengajuan`, `dana_diterima`, `dokumen_penerimaan`, `selisih`, `created_at`) VALUES
(7, 0, 'Periode November 2025', NULL, 0.00, NULL, 0.00, NULL, 0.00, '2025-12-10 09:05:37');

-- --------------------------------------------------------

--
-- Table structure for table `dana_terealisasi`
--

CREATE TABLE `dana_terealisasi` (
  `id` int(11) NOT NULL,
  `penggunaan_anggaran_id` int(11) NOT NULL,
  `tanggal_terima` date NOT NULL,
  `periode` varchar(100) DEFAULT NULL,
  `jenis_biaya` enum('biaya_sewa','biaya_operasional','biaya_bahan_baku') NOT NULL,
  `jumlah_dana_diterima` decimal(15,2) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `dokumen_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `harga_barang`
--

CREATE TABLE `harga_barang` (
  `id` int(11) NOT NULL,
  `kode_barang` varchar(50) DEFAULT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `harga` decimal(15,2) NOT NULL DEFAULT 0.00,
  `satuan` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `harga_barang`
--

INSERT INTO `harga_barang` (`id`, `kode_barang`, `nama_barang`, `harga`, `satuan`, `created_at`) VALUES
(3, 'AG001', 'Agar - Agar Pagi@7gr', 4400.00, 'Pcs', '2025-12-08 12:37:30'),
(4, 'AG002', 'Agar - Agar Swallow @7gr', 5550.00, 'Pcs', '2025-12-08 12:37:30'),
(5, 'AG003', 'Agar - Agar Ethoz @8gr', 47500.00, 'Pack', '2025-12-08 12:37:30'),
(6, 'AJ001', 'Asam Jawa', 33600.00, 'Kg', '2025-12-08 12:37:30'),
(7, 'AF001', 'Ayam Fillet', 62000.00, 'Kg', '2025-12-08 12:37:30'),
(8, 'AF002', 'Ayam Frozen Potong 10', 42400.00, 'Ekor', '2025-12-08 12:37:30'),
(9, 'BBY001', 'Bawang Bombay', 37000.00, 'Kg', '2025-12-08 12:48:55'),
(10, 'BG001', 'Bawang Goreng', 112000.00, 'Kg', '2025-12-08 12:48:55'),
(11, 'BMTK01', 'Bawang Merah (tidak kupas)', 50400.00, 'Kg', '2025-12-08 12:48:55'),
(12, 'BMK01', 'Bawang Merah Kupas', 56000.00, 'Kg', '2025-12-08 12:48:55'),
(13, 'BMKB01', 'Bawang Merah Kupas Bima', 56000.00, 'Kg', '2025-12-08 12:48:55'),
(14, 'BPTK01', 'Bawang Putih (tidak kupas)', 44800.00, 'Kg', '2025-12-08 12:48:55'),
(15, 'BPB01', 'Bawang Putih Bubuk', 210900.00, 'Kg', '2025-12-08 12:48:55'),
(16, 'BPK01', 'Bawang Putih Kupas', 44800.00, 'Kg', '2025-12-08 12:48:55');

-- --------------------------------------------------------

--
-- Table structure for table `kartu_stock`
--

CREATE TABLE `kartu_stock` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `kode` varchar(50) NOT NULL,
  `nama_barang` varchar(100) DEFAULT NULL,
  `satuan_barang` varchar(25) NOT NULL,
  `tanggal` date NOT NULL,
  `stock_awal` int(11) DEFAULT 0,
  `masuk` int(11) DEFAULT 0,
  `keluar` int(11) DEFAULT 0,
  `stock_akhir` int(11) DEFAULT 0,
  `harga_satuan` decimal(15,2) DEFAULT NULL,
  `nilai_persediaan` decimal(15,2) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kartu_stock`
--

INSERT INTO `kartu_stock` (`id`, `user_id`, `kode`, `nama_barang`, `satuan_barang`, `tanggal`, `stock_awal`, `masuk`, `keluar`, `stock_akhir`, `harga_satuan`, `nilai_persediaan`, `keterangan`, `created_at`, `updated_at`) VALUES
(16, 2, 'AF001', 'Ayam Fillet', 'Kg', '2025-11-11', 10, 10, 0, 20, 61000.00, 1220000.00, '', '2025-12-11 08:45:10', '2025-12-11 13:12:35'),
(19, 2, 'AF001', 'Ayam Fillet', 'Kg', '2025-11-12', 20, 5, 0, 25, 61000.00, 1525000.00, '', '2025-12-11 13:29:20', '2025-12-11 13:29:20'),
(21, 2, 'AF001', 'Ayam Fillet', 'Kg', '2025-11-14', 0, 10, 0, 10, 62000.00, 620000.00, '', '2025-12-12 03:22:33', '2025-12-12 03:22:33'),
(22, 2, 'AF001', 'Ayam Fillet', 'Kg', '2025-11-17', 10, 5, 0, 15, 62000.00, 930000.00, '', '2025-12-12 03:24:45', '2025-12-12 03:24:45'),
(23, 2, 'AF001', 'Ayam Fillet', 'Kg', '2025-11-18', 25, 0, 8, 17, 61000.00, 1037000.00, '', '2025-12-12 03:54:22', '2025-12-12 03:54:43');

-- --------------------------------------------------------

--
-- Table structure for table `keterangan_detail`
--

CREATE TABLE `keterangan_detail` (
  `id` int(11) NOT NULL,
  `penggunaan_anggaran_id` int(11) NOT NULL,
  `item` varchar(100) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `penggunaan_anggaran`
--

CREATE TABLE `penggunaan_anggaran` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periode_id` int(11) NOT NULL,
  `periode` varchar(100) NOT NULL,
  `tanggal_awal` date DEFAULT NULL,
  `tanggal_akhir` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penggunaan_anggaran`
--

INSERT INTO `penggunaan_anggaran` (`id`, `user_id`, `periode_id`, `periode`, `tanggal_awal`, `tanggal_akhir`, `created_at`, `updated_at`) VALUES
(1, 2, 0, 'November 2025', '2025-11-01', '2025-11-14', '2025-11-22 10:39:26', '2025-11-22 10:39:26'),
(2, 2, 0, 'Desember', '2025-11-15', '2025-11-29', '2025-11-22 10:41:21', '2025-11-22 10:41:21'),
(3, 2, 0, 'Periode 1', '2025-11-01', '2025-11-14', '2025-11-22 14:05:05', '2025-11-22 14:05:05'),
(4, 2, 0, 'Periode 1 Januari 2026', '2026-01-01', '2025-12-12', '2025-12-05 11:18:07', '2025-12-05 11:18:07'),
(5, 2, 5, 'periode 2 Desember 2025', '2025-12-14', '2025-12-28', '2025-12-08 15:23:46', '2025-12-08 15:23:46'),
(6, 2, 6, 'Periode 1 Desember 2025', '2025-11-30', '2025-12-13', '2025-12-09 06:42:12', '2025-12-09 06:42:12'),
(7, 2, 8, 'Periode November 2025', '2025-11-08', '2025-11-21', '2025-12-10 13:38:57', '2025-12-10 13:38:57');

-- --------------------------------------------------------

--
-- Table structure for table `pengkodean_barang`
--

CREATE TABLE `pengkodean_barang` (
  `id` int(11) NOT NULL,
  `kode` varchar(50) NOT NULL,
  `nama_barang` varchar(255) NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengkodean_barang`
--

INSERT INTO `pengkodean_barang` (`id`, `kode`, `nama_barang`, `kategori`, `created_at`) VALUES
(2, 'MSKH001', 'MASKER HIJAB', 'operasional', '2025-12-09 15:44:37'),
(3, 'MSKM002', 'MASKER MEDIS', 'operasional', '2025-12-09 15:44:37'),
(4, 'HIRC001', 'HAIR CUP', 'operasional', '2025-12-09 15:44:37'),
(5, 'SRTK001', 'SARUNG TANGAN KARET', 'operasional', '2025-12-09 15:44:37'),
(6, 'SRTP002', 'SARUNG TANGAN PLASTIK', 'operasional', '2025-12-09 15:44:37'),
(7, 'CLMK001', 'CELEMEK', 'operasional', '2025-12-09 15:44:37'),
(8, 'TLH001', 'TALI HITAM', 'operasional', '2025-12-09 15:44:37'),
(9, 'TLW002', 'TALI WARNA', 'operasional', '2025-12-09 15:44:37'),
(10, 'BBM001', 'BBM', 'operasional', '2025-12-09 15:44:37'),
(11, 'PLK001', 'PLASTIK', 'operasional', '2025-12-09 15:44:37'),
(12, 'PLKS002', 'PLASTIK SAMPAH', 'operasional', '2025-12-09 15:44:37'),
(13, 'PLKA003', 'PLASTIK ASOY', 'operasional', '2025-12-09 15:44:37'),
(14, 'GLN001', 'ISI ULANG GALON', 'operasional', '2025-12-09 15:44:37'),
(15, 'AMC001', 'AIR MINUM CUP', 'operasional', '2025-12-09 15:44:37'),
(16, 'AMB002', 'AIR MINUM BTL', 'operasional', '2025-12-09 15:44:37'),
(17, 'GAS001', 'GAS LPJ PT', 'operasional', '2025-12-09 15:44:37'),
(18, 'GASM002', 'GAS LPJ MTR', 'operasional', '2025-12-09 15:44:37'),
(19, 'TEH001', 'THE', 'operasional', '2025-12-09 15:44:37'),
(20, 'GDM001', 'GANDUM', 'operasional', '2025-12-09 15:44:37'),
(21, 'TPK001', 'TAPIOKA', 'operasional', '2025-12-09 15:44:37'),
(22, 'GL001', 'GULA', 'operasional', '2025-12-09 15:44:37'),
(23, 'HND001', 'HANDSAPLAS', 'operasional', '2025-12-09 15:44:37'),
(24, 'MML001', 'MAMA LEMON', 'operasional', '2025-12-09 15:44:37'),
(25, 'SBNT001', 'SABUN CUCI TANGAN', 'operasional', '2025-12-09 15:44:37'),
(26, 'SBN001', 'SABUN', 'operasional', '2025-12-09 15:44:37'),
(27, 'SPNP001', 'SPON CUCI PIRING', 'operasional', '2025-12-09 15:44:37'),
(28, 'SRBT001', 'SERBET', 'operasional', '2025-12-09 15:44:37'),
(29, 'KRYW001', 'KARYAWAN', 'operasional', '2025-12-09 15:44:37'),
(30, 'PYSD002', 'POSYANDU', 'operasional', '2025-12-09 15:44:37'),
(31, 'ATK001', 'ATK', 'operasional', '2025-12-09 15:44:37'),
(32, 'LSTRK001', 'LISTIK', 'operasional', '2025-12-09 15:44:37'),
(33, 'AIR001', 'PDAM', 'operasional', '2025-12-09 15:44:37'),
(34, 'INTR001', 'INTERNET', 'operasional', '2025-12-09 15:44:37'),
(35, 'KNB001', 'KANEBO', 'operasional', '2025-12-09 15:44:37'),
(36, 'TS001', 'TISU', 'operasional', '2025-12-09 15:44:37'),
(37, 'RL001', 'RELAWAN', 'operasional', '2025-12-09 15:44:37'),
(38, 'KP001', 'KADER POSYANDU', 'operasional', '2025-12-09 15:44:37'),
(39, 'LN001', 'LAINNYA', 'operasional', '2025-12-09 15:44:37'),
(41, 'ak123', 'cabai', 'Bahan', '2025-12-10 05:34:33');

-- --------------------------------------------------------

--
-- Table structure for table `peringatan_stock`
--

CREATE TABLE `peringatan_stock` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `kartu_stock_id` int(11) NOT NULL,
  `nama_barang` varchar(100) DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `stock_saat_ini` int(11) DEFAULT NULL,
  `status` enum('kritis','rendah') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `periods`
--

CREATE TABLE `periods` (
  `id` int(11) NOT NULL,
  `nama_periode` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `periods`
--

INSERT INTO `periods` (`id`, `nama_periode`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(8, 'Periode November 2025', '2025-11-10', '2025-11-22', 'active', '2025-12-10 08:11:49');

-- --------------------------------------------------------

--
-- Table structure for table `rincian_keuangan`
--

CREATE TABLE `rincian_keuangan` (
  `id` int(11) NOT NULL,
  `penggunaan_anggaran_id` int(11) NOT NULL,
  `item` varchar(100) DEFAULT NULL,
  `dana_diajukan` decimal(15,2) DEFAULT NULL,
  `dana_terealisasi` decimal(15,2) DEFAULT NULL,
  `sisa_dana` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sisa_saldo_sumber_dana`
--

CREATE TABLE `sisa_saldo_sumber_dana` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periode` varchar(100) DEFAULT NULL,
  `tanggal` date NOT NULL,
  `sumber_dana` varchar(100) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `tipe` enum('pemasukan','pengeluaran') NOT NULL,
  `nominal` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_opname`
--

CREATE TABLE `stock_opname` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `periode_id` int(11) DEFAULT NULL,
  `nama_item` varchar(100) DEFAULT NULL,
  `satuan` varchar(50) DEFAULT NULL,
  `stock_fisik` int(11) DEFAULT NULL,
  `stock_kartu` int(11) DEFAULT NULL,
  `selisih` int(11) DEFAULT NULL,
  `harga_satuan` decimal(15,2) DEFAULT NULL,
  `total` decimal(15,2) DEFAULT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nama_lengkap` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'akuntan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `nama_lengkap`, `role`, `created_at`, `updated_at`) VALUES
(2, 'admin', '$2b$10$JRVZzi8dL4ecRCBkPcJlhuxwrivBqHNcgj6j/go1KcbXFk281Pphu', 'admin@mbg.com', 'Admin MBG', 'akuntan', '2025-11-21 04:04:08', '2025-11-21 04:04:08'),
(3, 'meibgn', '$2b$10$PvAQYY9A0IR4q/tPBVsB3Ojd27HfujOWva1t5mRVW9yLcKzGViESy', 'mei@mbg.com', 'Admin MBG', 'akuntan', '2025-11-22 09:31:02', '2025-11-22 09:31:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `biaya_operasional`
--
ALTER TABLE `biaya_operasional`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_biaya_operasional_user` (`user_id`);

--
-- Indexes for table `buku_kas`
--
ALTER TABLE `buku_kas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_buku_kas_user` (`user_id`),
  ADD KEY `idx_buku_kas_tanggal` (`tanggal`);

--
-- Indexes for table `dana_diajukan`
--
ALTER TABLE `dana_diajukan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_anggaran_id` (`penggunaan_anggaran_id`);

--
-- Indexes for table `dana_proposal`
--
ALTER TABLE `dana_proposal`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dana_terealisasi`
--
ALTER TABLE `dana_terealisasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_anggaran_id` (`penggunaan_anggaran_id`);

--
-- Indexes for table `harga_barang`
--
ALTER TABLE `harga_barang`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kartu_stock`
--
ALTER TABLE `kartu_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kartu_stock_user` (`user_id`),
  ADD KEY `idx_kartu_stock_kode` (`kode`);

--
-- Indexes for table `keterangan_detail`
--
ALTER TABLE `keterangan_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_anggaran_id` (`penggunaan_anggaran_id`);

--
-- Indexes for table `penggunaan_anggaran`
--
ALTER TABLE `penggunaan_anggaran`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_penggunaan_anggaran_user` (`user_id`);

--
-- Indexes for table `pengkodean_barang`
--
ALTER TABLE `pengkodean_barang`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`);

--
-- Indexes for table `peringatan_stock`
--
ALTER TABLE `peringatan_stock`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kartu_stock_id` (`kartu_stock_id`);

--
-- Indexes for table `periods`
--
ALTER TABLE `periods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rincian_keuangan`
--
ALTER TABLE `rincian_keuangan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `penggunaan_anggaran_id` (`penggunaan_anggaran_id`);

--
-- Indexes for table `sisa_saldo_sumber_dana`
--
ALTER TABLE `sisa_saldo_sumber_dana`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sisa_saldo_user` (`user_id`),
  ADD KEY `idx_sisa_saldo_periode` (`periode`);

--
-- Indexes for table `stock_opname`
--
ALTER TABLE `stock_opname`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_opname_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `biaya_operasional`
--
ALTER TABLE `biaya_operasional`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `buku_kas`
--
ALTER TABLE `buku_kas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `dana_diajukan`
--
ALTER TABLE `dana_diajukan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dana_proposal`
--
ALTER TABLE `dana_proposal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `dana_terealisasi`
--
ALTER TABLE `dana_terealisasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `harga_barang`
--
ALTER TABLE `harga_barang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `kartu_stock`
--
ALTER TABLE `kartu_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `keterangan_detail`
--
ALTER TABLE `keterangan_detail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `penggunaan_anggaran`
--
ALTER TABLE `penggunaan_anggaran`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `pengkodean_barang`
--
ALTER TABLE `pengkodean_barang`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `peringatan_stock`
--
ALTER TABLE `peringatan_stock`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `periods`
--
ALTER TABLE `periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `rincian_keuangan`
--
ALTER TABLE `rincian_keuangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `sisa_saldo_sumber_dana`
--
ALTER TABLE `sisa_saldo_sumber_dana`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stock_opname`
--
ALTER TABLE `stock_opname`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `biaya_operasional`
--
ALTER TABLE `biaya_operasional`
  ADD CONSTRAINT `biaya_operasional_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `buku_kas`
--
ALTER TABLE `buku_kas`
  ADD CONSTRAINT `buku_kas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dana_diajukan`
--
ALTER TABLE `dana_diajukan`
  ADD CONSTRAINT `dana_diajukan_ibfk_1` FOREIGN KEY (`penggunaan_anggaran_id`) REFERENCES `penggunaan_anggaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dana_terealisasi`
--
ALTER TABLE `dana_terealisasi`
  ADD CONSTRAINT `dana_terealisasi_ibfk_1` FOREIGN KEY (`penggunaan_anggaran_id`) REFERENCES `penggunaan_anggaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kartu_stock`
--
ALTER TABLE `kartu_stock`
  ADD CONSTRAINT `kartu_stock_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `keterangan_detail`
--
ALTER TABLE `keterangan_detail`
  ADD CONSTRAINT `keterangan_detail_ibfk_1` FOREIGN KEY (`penggunaan_anggaran_id`) REFERENCES `penggunaan_anggaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `penggunaan_anggaran`
--
ALTER TABLE `penggunaan_anggaran`
  ADD CONSTRAINT `penggunaan_anggaran_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `peringatan_stock`
--
ALTER TABLE `peringatan_stock`
  ADD CONSTRAINT `peringatan_stock_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peringatan_stock_ibfk_2` FOREIGN KEY (`kartu_stock_id`) REFERENCES `kartu_stock` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rincian_keuangan`
--
ALTER TABLE `rincian_keuangan`
  ADD CONSTRAINT `rincian_keuangan_ibfk_1` FOREIGN KEY (`penggunaan_anggaran_id`) REFERENCES `penggunaan_anggaran` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sisa_saldo_sumber_dana`
--
ALTER TABLE `sisa_saldo_sumber_dana`
  ADD CONSTRAINT `sisa_saldo_sumber_dana_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_opname`
--
ALTER TABLE `stock_opname`
  ADD CONSTRAINT `stock_opname_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
