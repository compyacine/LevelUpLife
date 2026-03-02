
import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  MessageCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  ShieldCheck,
  Clock,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Bell,
  Smartphone,
  Globe,
  Send,
} from 'lucide-react';
import { AppSettings } from '../types';
import { playClick, playSuccess, playError } from '../utils/sounds';
import { addToast } from '../utils/toastStore';
import { useLang, languages, LangId } from '../contexts/LanguageContext';
import DigitProLogo from './DigitProLogo';

const DEFAULT_SETTINGS: AppSettings = {
  showWhatsApp: true,
  passwordEnabled: false,
  passwordHash: '',
  lockOnClose: true,
  autoLockMinutes: 5,
};

function hashPassword(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pwd.length;
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem('tm_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem('tm_settings', JSON.stringify(s));
}

export function verifyPassword(input: string): boolean {
  const settings = getSettings();
  if (!settings.passwordEnabled) return true;
  return hashPassword(input) === settings.passwordHash;
}

export function isPasswordSet(): boolean {
  const settings = getSettings();
  return settings.passwordEnabled && settings.passwordHash !== '';
}

interface SettingsProps {
  onRefresh: () => void;
  onSettingsChange: (s: AppSettings) => void;
}

export default function Settings({ onRefresh, onSettingsChange }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { t, lang, setLang } = useLang();

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    playClick();
  };

  const handleSetPassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (settings.passwordEnabled && !showChangePassword) {
      if (!verifyPassword(currentPassword)) {
        setPasswordError(t('wrongCurrentPassword'));
        playError();
        return;
      }
    }

    if (newPassword.length < 4) {
      setPasswordError(t('passwordTooShort'));
      playError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordMismatch'));
      playError();
      return;
    }

    const newSettings: AppSettings = {
      ...settings,
      passwordEnabled: true,
      passwordHash: hashPassword(newPassword),
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setShowChangePassword(false);
    setPasswordSuccess(t('passwordSetSuccess'));
    playSuccess();
    addToast({ type: 'success', title: t('passwordSetSuccess'), message: '🔐', emoji: '🔐', points: 5 });
    onRefresh();
  };

  const handleRemovePassword = () => {
    if (!verifyPassword(currentPassword)) {
      setPasswordError(t('wrongCurrentPassword'));
      playError();
      return;
    }

    const newSettings: AppSettings = {
      ...settings,
      passwordEnabled: false,
      passwordHash: '',
    };
    setSettings(newSettings);
    saveSettings(newSettings);
    setCurrentPassword('');
    setShowDeleteConfirm(false);
    setPasswordSuccess(t('passwordRemoved'));
    playSuccess();
    addToast({ type: 'info', title: t('passwordRemoved'), message: '🔓', emoji: '🔓', points: 0 });
    onRefresh();
  };

  const handleDeleteAllData = () => {
    if (settings.passwordEnabled && !verifyPassword(currentPassword)) {
      setPasswordError(t('enterCorrectPassword'));
      playError();
      return;
    }
    localStorage.clear();
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setShowDeleteConfirm(false);
    setCurrentPassword('');
    playSuccess();
    addToast({ type: 'warning', title: t('deleteAllData'), message: '🗑️', emoji: '🗑️', points: 0 });
    onRefresh();
  };

  const handleLangChange = (newLang: LangId) => {
    playClick();
    setLang(newLang);
    addToast({ type: 'success', title: languages.find(l => l.id === newLang)?.nativeName || '', message: languages.find(l => l.id === newLang)?.flag || '', emoji: '🌐', points: 0 });
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* Header Card */}
      <div
        className="t-card p-6 card-hover shimmer relative overflow-hidden"
        style={{ boxShadow: '0 10px 40px var(--shadow-card)' }}
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-primary)' }} />
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg pulse-scale"
            style={{ background: 'var(--gradient-primary)', boxShadow: '0 8px 30px var(--shadow-accent)' }}
          >
            <SettingsIcon size={28} style={{ color: 'var(--text-on-accent)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {t('settingsTitle')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t('settingsSubtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== LANGUAGE SECTION ==================== */}
      <div className="t-card p-5 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
            <Globe size={20} style={{ color: 'var(--accent-1)' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('languageTitle')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('languageDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languages.map(l => {
            const isActive = lang === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleLangChange(l.id)}
                className="relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl transition-all btn-press card-hover"
                style={{
                  background: isActive
                    ? 'var(--gradient-primary)'
                    : 'var(--bg-input)',
                  border: isActive
                    ? '2px solid var(--accent-1)'
                    : '2px solid var(--border-input)',
                  color: isActive
                    ? 'var(--text-on-accent)'
                    : 'var(--text-primary)',
                  boxShadow: isActive ? '0 8px 25px var(--shadow-accent)' : 'none',
                }}
              >
                <span className="text-3xl">{l.flag}</span>
                <div className="text-start">
                  <p className="font-black text-sm">{l.nativeName}</p>
                  <p className="text-[10px] opacity-80">{l.name}</p>
                </div>
                {isActive && (
                  <div className="absolute top-2 end-2">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Current language indicator */}
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold mt-4"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-input)',
            color: 'var(--text-muted)',
          }}
        >
          <Globe size={14} style={{ color: 'var(--accent-1)' }} />
          {t('currentLanguage')}: {languages.find(l => l.id === lang)?.flag} {languages.find(l => l.id === lang)?.nativeName}
        </div>
      </div>

      {/* ==================== WHATSAPP TOGGLE ==================== */}
      <div className="t-card p-5 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37, 211, 102, 0.15)' }}>
            <MessageCircle size={20} color="#25D366" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('whatsappFloating')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('whatsappFloatingDesc')}
            </p>
          </div>
          <button
            onClick={() => {
              updateSetting('showWhatsApp', !settings.showWhatsApp);
              addToast({
                type: settings.showWhatsApp ? 'info' : 'success',
                title: settings.showWhatsApp ? t('whatsappHidden') : t('whatsappShown'),
                message: '',
                emoji: settings.showWhatsApp ? '🔕' : '💬',
                points: 0,
              });
            }}
            className="relative w-16 h-8 rounded-full transition-all duration-500 btn-press"
            style={{
              background: settings.showWhatsApp
                ? 'linear-gradient(135deg, #25D366, #128C7E)'
                : 'var(--bg-input)',
              border: `1px solid ${settings.showWhatsApp ? '#25D366' : 'var(--border-input)'} `,
              boxShadow: settings.showWhatsApp ? '0 4px 15px rgba(37, 211, 102, 0.4)' : 'none',
            }}
          >
            <div
              className="absolute top-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: 'white',
                left: settings.showWhatsApp ? '2px' : 'auto',
                right: settings.showWhatsApp ? 'auto' : '2px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {settings.showWhatsApp ? <Eye size={12} color="#25D366" /> : <EyeOff size={12} color="#999" />}
            </div>
          </button>
        </div>
        <div
          className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold"
          style={{
            background: settings.showWhatsApp ? 'rgba(37, 211, 102, 0.1)' : 'var(--bg-input)',
            border: `1px solid ${settings.showWhatsApp ? 'rgba(37, 211, 102, 0.2)' : 'var(--border-input)'} `,
            color: settings.showWhatsApp ? '#25D366' : 'var(--text-muted)',
          }}
        >
          <div className={`w - 2 h - 2 rounded - full ${settings.showWhatsApp ? 'animate-pulse' : ''} `} style={{ background: settings.showWhatsApp ? '#25D366' : 'var(--text-muted)' }} />
          {settings.showWhatsApp ? t('whatsappEnabled') : t('whatsappDisabled')}
        </div>
      </div>

      {/* ==================== PASSWORD SECTION ==================== */}
      <div className="t-card p-5 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
            <Shield size={20} style={{ color: 'var(--accent-1)' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              {t('passwordProtection')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {t('passwordProtDesc')}
            </p>
          </div>
          {settings.passwordEnabled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <ShieldCheck size={14} />
              <span>{t('enabled')}</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl mb-5" style={{
          background: settings.passwordEnabled
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(244, 63, 94, 0.1))',
          border: `1px solid ${settings.passwordEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'} `,
        }}>
          <div className="flex items-center gap-3">
            {settings.passwordEnabled ? (
              <>
                <Lock size={24} color="#10B981" />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#10B981' }}>{t('appProtected')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('appProtectedDesc')}</p>
                </div>
              </>
            ) : (
              <>
                <Unlock size={24} color="#F59E0B" />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#F59E0B' }}>{t('appNotProtected')}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{t('appNotProtectedDesc')}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {passwordError && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl text-xs font-bold" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <AlertTriangle size={14} />
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-xl text-xs font-bold" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle2 size={14} />
            {passwordSuccess}
          </div>
        )}

        {!settings.passwordEnabled ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <KeyRound size={12} className="inline ml-1" />
                {t('newPassword')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder={t('newPasswordPlaceholder')}
                  className="t-input w-full text-sm pl-12"
                  dir="auto"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 btn-press" style={{ color: 'var(--text-muted)' }}>
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={12} className="inline ml-1" />
                {t('confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="t-input w-full text-sm pl-12"
                  dir="auto"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 btn-press" style={{ color: 'var(--text-muted)' }}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--progress-bg)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min(100, newPassword.length * 15)}% `,
                      background: newPassword.length < 4 ? '#F43F5E' : newPassword.length < 8 ? '#F59E0B' : '#10B981',
                    }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{
                    color: newPassword.length < 4 ? '#F43F5E' : newPassword.length < 8 ? '#F59E0B' : '#10B981',
                  }}>
                    {newPassword.length < 4 ? t('passwordWeak') : newPassword.length < 8 ? t('passwordMedium') : t('passwordStrong')}
                  </span>
                </div>
                {newPassword.length > 0 && confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-bold" style={{
                    color: newPassword === confirmPassword ? '#10B981' : '#F43F5E',
                  }}>
                    {newPassword === confirmPassword ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                    {newPassword === confirmPassword ? t('passwordsMatch') : t('passwordsNoMatch')}
                  </div>
                )}
              </div>
            )}
            <button onClick={handleSetPassword} className="t-btn-primary w-full flex items-center justify-center gap-2 text-sm btn-press">
              <Lock size={16} />
              {t('setPassword')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!showChangePassword ? (
              <div className="flex gap-3">
                <button onClick={() => { playClick(); setShowChangePassword(true); setPasswordError(''); setPasswordSuccess(''); }} className="t-btn-secondary flex-1 flex items-center justify-center gap-2 text-sm btn-press">
                  <KeyRound size={16} />
                  {t('changePassword')}
                </button>
                <button onClick={() => { playClick(); setShowDeleteConfirm(true); setPasswordError(''); setPasswordSuccess(''); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold btn-press transition-all"
                  style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                  <Unlock size={16} />
                  {t('removePassword')}
                </button>
              </div>
            ) : (
              <div className="space-y-4 p-4 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{t('currentPassword')}</label>
                  <div className="relative">
                    <input type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setPasswordError(''); }} placeholder={t('currentPasswordPlaceholder')} className="t-input w-full text-sm pl-12" dir="auto" />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 btn-press" style={{ color: 'var(--text-muted)' }}>
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{t('newPassword')}</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }} placeholder={t('newPasswordPlaceholder')} className="t-input w-full text-sm pl-12" dir="auto" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 btn-press" style={{ color: 'var(--text-muted)' }}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{t('confirmPassword')}</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }} placeholder={t('confirmPasswordPlaceholder')} className="t-input w-full text-sm pl-12" dir="auto" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 btn-press" style={{ color: 'var(--text-muted)' }}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSetPassword} className="t-btn-primary flex-1 flex items-center justify-center gap-2 text-sm btn-press">
                    <Save size={16} />
                    {t('saveChanges')}
                  </button>
                  <button onClick={() => { playClick(); setShowChangePassword(false); setNewPassword(''); setConfirmPassword(''); setCurrentPassword(''); setPasswordError(''); }} className="t-btn-secondary flex items-center justify-center gap-2 text-sm btn-press px-6">
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="mt-4 p-4 rounded-xl space-y-4" style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} color="#F43F5E" />
              <p className="text-sm font-bold" style={{ color: '#F43F5E' }}>{t('removePasswordConfirm')}</p>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>{t('removePasswordConfirmLabel')}</label>
              <input type="password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setPasswordError(''); }} placeholder={t('currentPasswordPlaceholder')} className="t-input w-full text-sm" dir="auto" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleRemovePassword} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold btn-press" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <Unlock size={16} />
                {t('yesRemoveProtection')}
              </button>
              <button onClick={() => { playClick(); setShowDeleteConfirm(false); setCurrentPassword(''); }} className="t-btn-secondary flex items-center justify-center gap-2 text-sm btn-press px-6">
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== LOCK OPTIONS ==================== */}
      {settings.passwordEnabled && (
        <div className="t-card p-5 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--badge-bg)' }}>
              <Bell size={20} style={{ color: 'var(--accent-2)' }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('lockOptions')}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
              <div className="flex items-center gap-3">
                <Smartphone size={16} style={{ color: 'var(--accent-1)' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('lockOnClose')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('lockOnCloseDesc')}</p>
                </div>
              </div>
              <button onClick={() => updateSetting('lockOnClose', !settings.lockOnClose)}
                className="relative w-14 h-7 rounded-full transition-all duration-500 btn-press"
                style={{
                  background: settings.lockOnClose ? 'var(--gradient-primary)' : 'var(--bg-input)',
                  border: `1px solid ${settings.lockOnClose ? 'var(--accent-1)' : 'var(--border-input)'} `,
                  boxShadow: settings.lockOnClose ? '0 4px 15px var(--shadow-accent)' : 'none',
                }}>
                <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-500" style={{
                  left: settings.lockOnClose ? '2px' : 'auto',
                  right: settings.lockOnClose ? 'auto' : '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
              <div className="flex items-center gap-3">
                <Clock size={16} style={{ color: 'var(--accent-2)' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('autoLock')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t('autoLockDesc')}</p>
                </div>
              </div>
              <select value={settings.autoLockMinutes} onChange={e => updateSetting('autoLockMinutes', Number(e.target.value))} className="t-input text-xs !py-1.5 !px-3">
                <option value={1}>{t('oneMinute')}</option>
                <option value={5}>{t('fiveMinutes')}</option>
                <option value={10}>{t('tenMinutes')}</option>
                <option value={30}>{t('thirtyMinutes')}</option>
                <option value={0}>{t('noAutoLock')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DANGER ZONE ==================== */}
      <div className="t-card p-5 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244, 63, 94, 0.12)' }}>
            <AlertTriangle size={20} color="#F43F5E" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#F43F5E' }}>
              {t('dangerZone')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dangerZoneDesc')}</p>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            if (confirm(t('deleteAllConfirm'))) {
              handleDeleteAllData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold btn-press transition-all"
          style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)' }}
        >
          <Trash2 size={16} />
          {t('deleteAllData')}
        </button>
      </div>

      {/* App Info */}
      <div className="t-card p-6 card-hover" style={{ boxShadow: '0 4px 20px var(--shadow-card)' }}>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <DigitProLogo size={56} variant="icon" animated glowing />
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>LevelUp Life v1.0</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{t('appInfo')}</p>
          </div>
          <div className="flex items-center justify-center">
            <a
              href="https://t.me/+QpKqwX1hsxtiZGQ0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all btn-press card-hover"
              style={{
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(59, 130, 246, 0.08))',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              }}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #38BDF8, #3B82F6)' }}>
                <Send size={12} color="white" />
              </div>
              <span style={{
                background: 'linear-gradient(135deg, #38BDF8, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 900,
              }}>{t('supportGroup')}</span>
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }} dir="ltr">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
