import React from 'react';
import { Modal } from '../common/Modal';
import { ExternalLink, CheckCircle2, Shield, Info, Copy } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface GoogleDriveGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveGuideModal: React.FC<GoogleDriveGuideModalProps> = ({ isOpen, onClose }) => {
  const { info } = useToast();
  const currentOrigin = window.location.origin;

  const copyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    info('Origin Copied', `${currentOrigin} copied to clipboard`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Drive Cloud Sync Setup"
      subtitle="How to create your personal Google OAuth 2.0 Client ID in 2 minutes"
      maxWidth="2xl"
    >
      <div className="space-y-5 text-sm">
        {/* Security Alert */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">100% Private & Direct to Your Drive:</span> All your executive financial data and daily tasks sync directly between your browser and your private Google Drive folder using the minimal <code className="text-amber-300 font-mono">drive.file</code> scope. No intermediate servers or third parties ever touch your data.
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2433] text-[#F59E0B] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#F59E0B]/30">
              1
            </div>
            <div>
              <h4 className="font-semibold text-[#F3F4F6] flex items-center space-x-2">
                <span>Open Google Cloud Console</span>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#F59E0B] hover:underline inline-flex items-center space-x-1 text-xs"
                >
                  <span>Go to Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Log into Google Cloud Console. Select or create a project (e.g. <em>"Executive-OS"</em>).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2433] text-[#F59E0B] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#F59E0B]/30">
              2
            </div>
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Enable Google Drive API</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Navigate to <strong>APIs & Services &gt; Library</strong>, search for <strong>Google Drive API</strong>, and click <strong>Enable</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2433] text-[#F59E0B] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#F59E0B]/30">
              3
            </div>
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Configure OAuth Consent Screen</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Go to <strong>OAuth consent screen</strong>. Choose <strong>External</strong>, set App Name to <em>Executive OS</em>, enter your support email, and add your Google account as a <strong>Test User</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2433] text-[#F59E0B] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#F59E0B]/30">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-[#F3F4F6]">Create Credentials &gt; OAuth Client ID</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Go to <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong>.
                Select <strong>Web application</strong>. Under <strong>Authorized JavaScript origins</strong>, add this URL:
              </p>
              <div className="mt-2 flex items-center justify-between p-2.5 rounded-lg bg-[#0E121B] border border-[#1E2433] text-xs font-mono text-[#F59E0B]">
                <span>{currentOrigin}</span>
                <button
                  onClick={copyOrigin}
                  className="p-1.5 rounded hover:bg-[#1E2433] text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
                  title="Copy Origin"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-[#1E2433] text-[#10B981] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-[#10B981]/30">
              5
            </div>
            <div>
              <h4 className="font-semibold text-[#F3F4F6]">Copy Client ID and Paste into Settings</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Copy the generated <strong>Client ID</strong> (ends with <code>.apps.googleusercontent.com</code>) and paste it into the Client ID field in Settings. Click <strong>Connect with Google</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Dedicated Folder details */}
        <div className="p-3.5 rounded-xl bg-[#171C2A] border border-[#1E2433] text-xs text-[#9CA3AF]">
          <div className="font-semibold text-[#F3F4F6] mb-1 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Dedicated Google Drive Master File</span>
          </div>
          <p>
            Once connected, the system automatically creates a folder named <strong>Executive_Dashboard_Data</strong> and updates <strong>personal_executive_dashboard_db.json</strong> in real-time.
          </p>
        </div>
      </div>
    </Modal>
  );
};
