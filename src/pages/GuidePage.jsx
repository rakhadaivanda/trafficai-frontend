import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Camera, Search, BookOpen, History, Shield,
  ChevronRight, ChevronDown, Car, Zap, CheckCircle2, ArrowRight,
  HelpCircle, AlertTriangle
} from "lucide-react";

const STEPS = [
  {
    id: "login",
    icon: Shield,
    title: "Login ke Akun",
    subtitle: "Langkah pertama untuk memulai",
    color: "#059669",
    content: [
      "Buka aplikasi TrafficAI di browser Anda.",
      "Klik tombol 'Lanjutkan dengan Google' untuk login cepat menggunakan akun Google Anda.",
      "Atau pilih 'Lanjutkan dengan Nomor Telepon' untuk login menggunakan OTP.",
      "Setelah berhasil login, Anda akan diarahkan ke halaman utama.",
    ],
    tip: "Login diperlukan agar riwayat konsultasi Anda tersimpan dengan aman di cloud dan bisa diakses dari perangkat mana saja.",
  },
  {
    id: "chat",
    icon: MessageSquare,
    title: "Konsultasi Teks",
    subtitle: "Ceritakan kronologi berkendara",
    color: "#10b981",
    content: [
      "Navigasi ke menu 'Consult' dari navbar.",
      "Ketikkan kronologi atau pertanyaan Anda di kolom input chat. Contoh: 'Saya naik motor tanpa helm dan tidak bawa SIM'.",
      "Tekan Enter atau klik tombol kirim.",
      "AI akan menganalisis dan menampilkan pasal pelanggaran, sanksi, dan penjelasan hukum yang relevan.",
    ],
    tip: "Semakin detail kronologi yang Anda ceritakan, semakin akurat hasil analisis AI.",
  },
  {
    id: "image",
    icon: Camera,
    title: "Analisis Gambar",
    subtitle: "Deteksi pelanggaran dari foto",
    color: "#0d9488",
    content: [
      "Di halaman Konsultasi, klik ikon kamera di sebelah kiri kolom input.",
      "Pilih foto dari galeri perangkat Anda (maks. 8MB).",
      "Preview gambar akan muncul di atas kolom input.",
      "Klik kirim. AI akan menganalisis gambar menggunakan teknologi Vision AI multi-tahap.",
      "Hasil analisis mencakup jenis kendaraan, pelanggaran terdeteksi, dan pasal hukum terkait.",
    ],
    tip: "Untuk hasil terbaik, gunakan foto yang jelas dan terang dengan objek kendaraan terlihat utuh.",
  },
  {
    id: "laws",
    icon: BookOpen,
    title: "Database Pasal",
    subtitle: "Jelajahi 45+ pasal UU Lalu Lintas",
    color: "#065f46",
    content: [
      "Navigasi ke menu 'Laws' dari navbar.",
      "Gunakan kolom pencarian untuk mencari pasal berdasarkan nomor atau jenis pelanggaran.",
      "Klik pada kartu pasal untuk melihat detail lengkap termasuk bunyi pasal dan ancaman sanksi.",
    ],
    tip: "Semua pasal bersumber dari UU No. 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan.",
  },
  {
    id: "history",
    icon: History,
    title: "Riwayat Konsultasi",
    subtitle: "Akses kembali hasil analisis",
    color: "#047857",
    content: [
      "Navigasi ke menu 'History' dari navbar.",
      "Semua konsultasi yang mengandung pelanggaran otomatis tersimpan.",
      "Riwayat disimpan di cloud (Firestore) sehingga bisa diakses dari perangkat lain selama Anda login.",
      "Gunakan kolom pencarian untuk menemukan riwayat tertentu.",
      "Klik 'Hapus semua' untuk membersihkan seluruh riwayat.",
    ],
    tip: "Riwayat Anda bersifat privat dan hanya bisa diakses oleh akun Anda sendiri.",
  },
];

const FAQ = [
  {
    q: "Apakah hasil analisis TrafficAI bisa dijadikan bukti hukum?",
    a: "Tidak. Hasil analisis TrafficAI bersifat edukatif dan tidak menggantikan keputusan resmi pihak berwenang seperti Kepolisian atau Pengadilan.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya. TrafficAI menggunakan Firebase Authentication dan Cloud Firestore dari Google. Data riwayat Anda dienkripsi dan hanya bisa diakses oleh akun Anda sendiri.",
  },
  {
    q: "Model AI apa yang digunakan?",
    a: "TrafficAI menggunakan Groq API dengan model gpt-oss-120b untuk analisis teks, dan Llama 4 Scout untuk analisis gambar (Vision AI). Sistem RAG menggunakan ChromaDB dengan embedding multilingual.",
  },
  {
    q: "Berapa ukuran maksimal gambar yang bisa diunggah?",
    a: "Maksimal 8MB per gambar. Format yang didukung: JPG, PNG, dan WebP. Gambar akan di-compress otomatis untuk efisiensi.",
  },
  {
    q: "Apakah aplikasi ini gratis?",
    a: "Ya, TrafficAI sepenuhnya gratis untuk digunakan. Proyek ini dikembangkan untuk tujuan edukasi dan penelitian skripsi.",
  },
];

function StepCard({ step, index, isOpen, onToggle }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card rounded-2xl overflow-hidden border border-outline-variant hover:border-emerald-300 transition-all"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-surface-container-low"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-transform"
          style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}99)` }}
        >
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Langkah {index + 1}
            </span>
          </div>
          <h3 className="font-bold text-base text-info-heading">{step.title}</h3>
          <p className="text-xs text-on-surface-variant font-medium">{step.subtitle}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-outline shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              <div className="bg-surface-container-low rounded-xl p-4 mb-3">
                <ol className="space-y-2.5">
                  {step.content.map((line, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-on-surface leading-relaxed">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {step.tip && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <Zap size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    <span className="font-bold">Tips:</span> {step.tip}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="glass-card rounded-xl overflow-hidden border border-outline-variant"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-surface-container-low"
      >
        <HelpCircle size={16} className="text-emerald-600 shrink-0" />
        <span className="flex-1 text-sm font-bold text-info-heading">{faq.q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-outline shrink-0"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <p className="text-sm text-on-surface-variant leading-relaxed pl-7">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GuidePage() {
  const [openStep, setOpenStep] = useState(0);
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-y-auto h-full w-full page-bg"
    >
      <div className="max-w-3xl mx-auto px-6 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-400 flex items-center justify-center shadow-md">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold tracking-tighter text-3xl md:text-4xl text-info-heading">
                Cara Penggunaan
              </h1>
              <p className="text-sm text-on-surface-variant font-medium">
                Panduan lengkap menggunakan TrafficAI
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero Banner */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden mb-8 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #022c22 0%, #064e3b 40%, #059669 70%, #10b981 100%)",
          }}
        >
          <div className="px-6 py-8 md:px-10 md:py-10 relative">
            <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                  Pelajari TrafficAI<br />dalam 5 Langkah
                </h2>
                <p className="text-emerald-200/80 text-sm md:text-base leading-relaxed max-w-lg">
                  Dari login hingga mengakses riwayat konsultasi, panduan ini akan membantu Anda
                  memahami cara menggunakan setiap fitur TrafficAI secara optimal.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {[
                  { icon: MessageSquare, label: "Chat AI" },
                  { icon: Camera, label: "Vision" },
                  { icon: BookOpen, label: "45+ Pasal" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <item.icon size={12} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-emerald-600" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Panduan Langkah demi Langkah
            </span>
          </div>
          {STEPS.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              isOpen={openStep === i}
              onToggle={() => setOpenStep(openStep === i ? -1 : i)}
            />
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-emerald-600" />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
              Pertanyaan Umum (FAQ)
            </span>
          </div>
          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                index={i}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3 mb-8"
        >
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">Disclaimer</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Hasil analisis TrafficAI bersifat <strong>edukatif</strong> berdasarkan UU No. 22 Tahun 2009
              tentang Lalu Lintas dan Angkutan Jalan. Informasi yang diberikan <strong>tidak menggantikan
              keputusan resmi</strong> pihak berwenang seperti Kepolisian atau Pengadilan.
            </p>
          </div>
        </motion.div>

        {/* Footer spacer */}
        <div className="flex-1" />
        <div className="border-t border-outline-variant pt-6 pb-4 text-center text-xs text-outline font-medium">
          TrafficAI - Panduan Penggunaan v1.0
        </div>
      </div>
    </motion.div>
  );
}
