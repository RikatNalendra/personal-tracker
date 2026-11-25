import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ExternalLink, CheckCircle2, Copy, FileSpreadsheet, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { APPS_SCRIPT_SOURCE_CODE } from '../../services/googleSheetsService';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({ isOpen, onClose }) => {
  const { success } = useToast();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SOURCE_CODE);
    setCopied(true);
    success('Kode Berhasil Disalin', 'Kode Google Apps Script telah disalin ke clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Panduan Integrasi Google Sheets (Data Mutasi & Saldo)"
      subtitle="Sinkronisasi mutasi otomatis langsung ke Google Spreadsheet tanpa Google Cloud Console & tanpa error 403"
      maxWidth="3xl"
    >
      <div className="space-y-5 text-sm max-h-[75vh] overflow-y-auto pr-1">
        {/* Keunggulan Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-[#171C2A] to-blue-500/10 border border-emerald-500/20 flex items-start space-x-3 text-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#F3F4F6] text-sm">100% Aman, Gratis & Terhubung Langsung ke Akun Anda</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                BEBAS ERROR 403
              </span>
            </div>
            <p className="text-[#9CA3AF] leading-relaxed">
              Google Apps Script berjalan langsung di akun Google Anda (<strong className="text-emerald-300">rikatnalendra25@gmail.com</strong>). Tidak memerlukan verifikasi Google Cloud OAuth yang rumit dan dapat dibuka kapan saja di aplikasi Google Sheets HP atau Laptop!
            </p>
          </div>
        </div>

        {/* 4 Langkah Praktis */}
        <div className="space-y-4">
          {/* Langkah 1 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#131722] border border-[#1E2433]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#F3F4F6] flex items-center justify-between">
                <span>Buat Google Spreadsheet Baru</span>
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center space-x-1 text-xs"
                >
                  <span>Buka sheets.new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Buka tab baru dengan mengklik tautan di atas untuk membuat spreadsheet baru. Anda dapat memberinya nama bebas, misalnya: <strong className="text-[#F3F4F6]">Executive Personal Tracker</strong>.
              </p>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#131722] border border-[#1E2433]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#F3F4F6]">Buka Menu Apps Script</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Pada spreadsheet tersebut, klik menu bagian atas: <strong className="text-emerald-400">Ekstensi (Extensions)</strong> &gt; <strong className="text-emerald-400">Apps Script</strong>. Jendela editor kode Google Apps Script akan terbuka. Hapus kode default yang ada di dalam file <code className="text-amber-400 font-mono">Code.gs</code>.
              </p>
            </div>
          </div>

          {/* Langkah 3 - Salin Kode */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#131722] border border-[#1E2433]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              3
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[#F3F4F6]">Salin & Paste Kode Script Sinkronisasi</h4>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Klik tombol di samping untuk menyalin kode siap pakai, lalu paste ke jendela Apps Script tadi.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode Script'}</span>
                </button>
              </div>

              {/* Preview Script Box */}
              <div className="relative rounded-lg bg-[#0E121B] border border-[#1E2433] p-3 text-[11px] font-mono text-[#9CA3AF] overflow-hidden max-h-32">
                <div className="text-emerald-400 font-bold mb-1">// EXECUTIVE PERSONAL TRACKER - GOOGLE SHEETS SYNC ENGINE</div>
                <div>function doGet(e) &#123; ... &#125;</div>
                <div>function doPost(e) &#123; ... &#125;</div>
                <div className="text-[#64748B] italic mt-1">// Otomatis membuat sheet Mutasi Transaksi, Rekening &amp; Saldo, dan Ringkasan Bulanan</div>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Setelah di-paste, klik tombol <strong>Simpan (ikon Disket / Save)</strong> di Apps Script.
              </p>
            </div>
          </div>

          {/* Langkah 4 - Deploy Web App */}
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-[#131722] border border-[#1E2433]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              4
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-[#F3F4F6]">Terapkan sebagai Aplikasi Web (Deploy Web App)</h4>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                Di kanan atas jendela Apps Script, klik tombol biru <strong className="text-blue-400">Terapkan (Deploy)</strong> &gt; <strong className="text-blue-400">Penerapan Baru (New deployment)</strong>.
              </p>
              
              <div className="p-3 rounded-lg bg-[#0E121B] border border-[#1E2433] space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[#9CA3AF]">Pilih Jenis (Gear icon):</span>
                  <strong className="text-[#F3F4F6]">Aplikasi Web (Web App)</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[#9CA3AF]">Jalankan sebagai (Execute as):</span>
                  <strong className="text-emerald-400">Saya (rikatnalendra25@gmail.com)</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[#9CA3AF]">Yang memiliki akses (Who has access):</span>
                  <strong className="text-amber-400">Siapa saja (Anyone)</strong>
                </div>
              </div>

              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                Klik tombol <strong>Terapkan (Deploy)</strong>. Jika muncul popup <em>"Beri izin (Review permissions)"</em>, klik akun Google Anda &gt; <em>Lanjutan (Advanced)</em> &gt; <em>Buka Webhook (tidak aman)</em> &gt; <em>Izinkan (Allow)</em>.
              </p>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berawalan <code className="font-mono text-white">https://script.google.com/macros/s/.../exec</code> dan paste ke form di tab Google Sheets dashboard ini!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E2433]">
          <span className="text-xs text-[#64748B]">Semua data tersimpan rapi dan dapat diexport kapan saja.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Mengerti &amp; Tutup Panduan
          </button>
        </div>
      </div>
    </Modal>
  );
};
