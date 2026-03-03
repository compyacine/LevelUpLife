import { X, Check, Palette } from 'lucide-react';
import { useTheme, themes, ThemeId } from '../contexts/ThemeContext';
import { playClick, playSuccess } from '../utils/sounds';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (id: ThemeId) => {
    playSuccess();
    setTheme(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay" style={{ background: 'var(--modal-overlay)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl p-8 modal-content border"
        style={{
          background: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(30px)',
          borderColor: 'var(--border-card)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <Palette size={24} style={{ color: 'var(--text-on-accent)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                اختر ثيمك المفضل
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Choose your preferred theme
              </p>
            </div>
          </div>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-3 rounded-xl transition-all btn-press hover:opacity-70"
            style={{ background: 'var(--bg-card)' }}
          >
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map(t => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`theme-option relative overflow-hidden rounded-2xl p-5 text-right border-2 transition-all btn-press ${isActive ? 'active' : ''
                  }`}
                style={{
                  background: isActive ? `linear-gradient(135deg, ${t.preview[0]}15, ${t.preview[1]}10)` : 'var(--bg-card)',
                  borderColor: isActive ? t.preview[0] : 'var(--border-card)',
                  boxShadow: isActive ? `0 8px 30px ${t.preview[0]}25` : 'none',
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center check-pop"
                    style={{ background: t.preview[0] }}
                  >
                    <Check size={14} color="white" strokeWidth={3} />
                  </div>
                )}

                {/* Theme emoji & name */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </h3>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {t.nameEn}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs mb-4 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {t.description}
                </p>

                {/* Color Preview */}
                <div className="flex gap-2">
                  {t.preview.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 h-8 rounded-xl transition-all"
                      style={{
                        background: color,
                        boxShadow: isActive ? `0 4px 12px ${color}40` : 'none',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>

                {/* Mini preview bar */}
                <div
                  className="mt-4 rounded-xl p-3 flex items-center gap-2"
                  style={{
                    background: t.id === 'kids' || t.id === 'girls'
                      ? `linear-gradient(135deg, ${t.preview[0]}15, ${t.preview[1]}10)`
                      : `linear-gradient(135deg, ${t.preview[0]}20, ${t.preview[1]}10)`,
                    border: `1px solid ${t.preview[0]}20`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: t.preview[0] }}
                  />
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: `${t.preview[0]}20` }}
                  >
                    <div
                      className="h-full rounded-full w-2/3"
                      style={{ background: `linear-gradient(90deg, ${t.preview[0]}, ${t.preview[1]})` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: t.preview[0] }}>
                    {isActive ? '✓ نشط' : 'اختر'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🎨 يمكنك تغيير الثيم في أي وقت من الشريط الجانبي
          </p>
        </div>
      </div>
    </div>
  );
}
