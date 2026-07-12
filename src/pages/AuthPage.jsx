import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Phone, X, ArrowRight, Shield, ChevronLeft, Mail, Key } from "lucide-react";
import { loginWithGoogle, setupRecaptcha, sendPhoneOTP, loginWithEmail, registerWithEmail } from "../firebase";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("main"); // main | phone | otp | email_login | email_register
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [confirmResult, setConfirmResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Cleanup recaptcha on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Login dibatalkan.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("Domain belum didaftarkan di Firebase Console. Tambahkan domain ini ke Authorized Domains.");
      } else {
        setError(err.message || "Gagal login dengan Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError("Masukkan nomor telepon.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Format nomor
      let formatted = phoneNumber.trim();
      if (formatted.startsWith("08")) {
        formatted = "+62" + formatted.slice(1);
      } else if (formatted.startsWith("8")) {
        formatted = "+62" + formatted;
      } else if (!formatted.startsWith("+")) {
        formatted = "+62" + formatted;
      }

      const verifier = setupRecaptcha("recaptcha-container");
      const confirmation = await sendPhoneOTP(formatted, verifier);
      setConfirmResult(confirmation);
      setMode("otp");
    } catch (err) {
      if (err.code === "auth/invalid-phone-number") {
        setError("Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx");
      } else if (err.code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setError(err.message || "Gagal mengirim OTP.");
      }
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await confirmResult.confirm(otpCode);
      onLogin(result.user);
    } catch (err) {
      if (err.code === "auth/invalid-verification-code") {
        setError("Kode OTP salah. Periksa kembali kode yang dikirim.");
      } else {
        setError(err.message || "Gagal verifikasi OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Masukkan email dan password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await loginWithEmail(email, password);
      onLogin(user);
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Email atau password salah.");
      } else {
        setError(err.message || "Gagal masuk.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setError("Masukkan email valid dan password minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await registerWithEmail(email, password);
      onLogin(user);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar. Silakan login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Format email tidak valid.");
      } else if (err.code === "auth/weak-password") {
        setError("Password terlalu lemah.");
      } else {
        setError(err.message || "Gagal mendaftar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="auth-page h-full w-full overflow-y-auto flex items-center justify-center px-4 py-8 page-bg"
    >
      <div className="auth-container w-full max-w-md">
        {/* Logo + Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-400 shadow-xl mb-4 border border-emerald-400/30"
          >
            <Car size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-info-heading">
            Traffic<span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-2 font-medium">
            Asisten Edukasi Lalu Lintas Indonesia
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="auth-card glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-2xl"
          style={{ background: "var(--color-surface-container-lowest)" }}
        >
          <AnimatePresence mode="wait">
            {/* MAIN: Pilih metode login */}
            {mode === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-100">
                    <Shield size={12} /> Login Diperlukan
                  </div>
                  <h2 className="text-xl font-bold text-info-heading">Masuk ke Akun Anda</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Pilih metode login untuk melanjutkan
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2"
                  >
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="auth-btn-google w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3 border border-outline-variant hover:border-emerald-300 shadow-sm hover:shadow-md"
                  style={{ background: "var(--color-surface-container-low)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span className="text-info-heading">
                    {loading ? "Memproses..." : "Lanjutkan dengan Google"}
                  </span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-outline-variant" />
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">atau</span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>

                {/* Phone Login */}
                <button
                  onClick={() => { setMode("phone"); setError(""); }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border border-outline-variant hover:border-emerald-300 shadow-sm hover:shadow-md mb-3"
                  style={{ background: "var(--color-surface-container-low)" }}
                >
                  <Phone size={18} className="text-emerald-600" />
                  <span className="text-info-heading">Lanjutkan dengan Nomor Telepon</span>
                </button>

                {/* Email Login */}
                <button
                  onClick={() => { setMode("email_login"); setError(""); }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed border border-outline-variant hover:border-emerald-300 shadow-sm hover:shadow-md"
                  style={{ background: "var(--color-surface-container-low)" }}
                >
                  <Mail size={18} className="text-emerald-600" />
                  <span className="text-info-heading">Lanjutkan dengan Email</span>
                </button>
              </motion.div>
            )}

            {/* PHONE: Input nomor telepon */}
            {mode === "phone" && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setMode("main"); setError(""); }}
                  className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-info-heading transition-colors mb-5"
                >
                  <ChevronLeft size={16} /> Kembali
                </button>

                <h2 className="text-xl font-bold text-info-heading mb-1">Masuk dengan Telepon</h2>
                <p className="text-sm text-on-surface-variant mb-5">
                  Kami akan mengirimkan kode OTP ke nomor Anda
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2"
                  >
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Nomor Telepon
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <span className="text-sm font-bold text-outline shrink-0">+62</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="812xxxxxxxx"
                        className="flex-1 bg-transparent text-sm text-info-heading font-medium outline-none placeholder-outline"
                        maxLength={13}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !phoneNumber.trim()}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Mengirim OTP..." : "Kirim Kode OTP"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>

                <div id="recaptcha-container" ref={recaptchaRef} />
              </motion.div>
            )}

            {/* OTP: Input kode verifikasi */}
            {mode === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setMode("phone"); setError(""); setOtpCode(""); }}
                  className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-info-heading transition-colors mb-5"
                >
                  <ChevronLeft size={16} /> Kembali
                </button>

                <h2 className="text-xl font-bold text-info-heading mb-1">Verifikasi OTP</h2>
                <p className="text-sm text-on-surface-variant mb-5">
                  Masukkan kode 6 digit yang dikirim ke nomor Anda
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2"
                  >
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Kode OTP
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-info-heading outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-outline"
                      maxLength={6}
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otpCode.length < 6}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>
              </motion.div>
            )}

            {/* EMAIL LOGIN */}
            {mode === "email_login" && (
              <motion.div
                key="email_login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setMode("main"); setError(""); }}
                  className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-info-heading transition-colors mb-5"
                >
                  <ChevronLeft size={16} /> Kembali
                </button>

                <h2 className="text-xl font-bold text-info-heading mb-1">Masuk dengan Email</h2>
                <p className="text-sm text-on-surface-variant mb-5">
                  Masukkan email dan kata sandi akun Anda
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2"
                  >
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Alamat Email
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <Mail size={18} className="text-outline shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@email.com"
                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-info-heading placeholder:text-outline"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Kata Sandi
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <Key size={18} className="text-outline shrink-0" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-info-heading placeholder:text-outline"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 mt-6"
                  >
                    {loading ? "Memproses..." : "Masuk"} <ArrowRight size={18} />
                  </button>
                </form>

                <p className="text-center text-sm text-on-surface-variant mt-6">
                  Belum punya akun?{" "}
                  <button onClick={() => { setMode("email_register"); setError(""); }} className="text-emerald-600 font-bold hover:underline">
                    Daftar di sini
                  </button>
                </p>
              </motion.div>
            )}

            {/* EMAIL REGISTER */}
            {mode === "email_register" && (
              <motion.div
                key="email_register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => { setMode("main"); setError(""); }}
                  className="flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-info-heading transition-colors mb-5"
                >
                  <ChevronLeft size={16} /> Kembali
                </button>

                <h2 className="text-xl font-bold text-info-heading mb-1">Daftar Akun Baru</h2>
                <p className="text-sm text-on-surface-variant mb-5">
                  Buat akun dengan email dan kata sandi Anda
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2"
                  >
                    <X size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Alamat Email
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <Mail size={18} className="text-outline shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@email.com"
                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-info-heading placeholder:text-outline"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                      Kata Sandi Baru
                    </label>
                    <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                      <Key size={18} className="text-outline shrink-0" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full bg-transparent border-none outline-none text-sm font-medium text-info-heading placeholder:text-outline"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || password.length < 6}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 mt-6"
                  >
                    {loading ? "Mendaftarkan..." : "Daftar Akun"} <ArrowRight size={18} />
                  </button>
                </form>

                <p className="text-center text-sm text-on-surface-variant mt-6">
                  Sudah punya akun?{" "}
                  <button onClick={() => { setMode("email_login"); setError(""); }} className="text-emerald-600 font-bold hover:underline">
                    Masuk di sini
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-outline mt-6 font-medium"
        >
          Dengan masuk, Anda menyetujui penggunaan layanan TrafficAI untuk tujuan edukasi.
        </motion.p>
      </div>
    </motion.div>
  );
}
