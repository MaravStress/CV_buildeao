import React, { useState } from 'react';
import type { CVSettings, CVData } from '../../types/cv';
import { FONT_OPTIONS } from '../../constants/fonts';
import type { User } from 'firebase/auth';
import { ADMIN_EMAIL } from '../../firebase/config';

interface SettingsFormProps {
  settings: CVSettings;
  currentCvData: CVData;
  onChangeSetting: (field: keyof CVSettings, value: string | number) => void;
  onApplyCvData: (newData: CVData) => void;
  user: User | null;
  onLoginGoogle: () => Promise<void>;
  onLogoutGoogle: () => Promise<void>;
  onSaveToCloud: () => Promise<void>;
  onFetchFromCloud: () => Promise<void>;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  settings,
  onChangeSetting,
  onApplyCvData: _onApplyCvData,
  user,
  onLoginGoogle,
  onLogoutGoogle,
  onSaveToCloud,
  onFetchFromCloud,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'cloud'>('appearance');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const handleAuthLogin = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await onLoginGoogle();
      setStatusMessage({ type: 'success', text: `¡Sesión iniciada con éxito como administrador (${ADMIN_EMAIL})!` });
    } catch (err: any) {
      console.error('Login error:', err);
      setStatusMessage({ type: 'danger', text: err.message || 'Error al iniciar sesión con Google.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthLogout = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await onLogoutGoogle();
      setStatusMessage({ type: 'success', text: 'Sesión cerrada correctamente.' });
    } catch (err: any) {
      setStatusMessage({ type: 'danger', text: 'Error al cerrar sesión.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToCloud = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await onSaveToCloud();
      setStatusMessage({
        type: 'success',
        text: '¡Base de Datos de Firebase (portfolio/bdData) actualizada con éxito con la información del CV actual!',
      });
    } catch (err: any) {
      console.error('Cloud save error:', err);
      setStatusMessage({ type: 'danger', text: err.message || 'Error al actualizar la base de datos en Firebase.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFromCloud = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await onFetchFromCloud();
      setStatusMessage({
        type: 'success',
        text: '¡Información del CV cargada correctamente desde Firebase Realtime Database!',
      });
    } catch (err: any) {
      console.error('Cloud fetch error:', err);
      setStatusMessage({ type: 'danger', text: err.message || 'Error al leer la base de datos desde Firebase.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {/* Tab Selector Navigation */}
      <div className="d-flex border-bottom border-secondary border-opacity-15 pb-2 gap-2">
        <button
          type="button"
          className={`btn btn-sm px-3 py-1.5 rounded-2 d-flex align-items-center gap-1.5 transition-all ${
            activeTab === 'appearance'
              ? 'btn-primary text-white'
              : 'btn-secondary text-muted bg-transparent border-0'
          }`}
          onClick={() => setActiveTab('appearance')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>palette</span>
          <span>Formato & Apariencia</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm px-3 py-1.5 rounded-2 d-flex align-items-center gap-1.5 transition-all ${
            activeTab === 'cloud'
              ? 'btn-primary text-white'
              : 'btn-secondary text-muted bg-transparent border-0'
          }`}
          onClick={() => setActiveTab('cloud')}
        >
          <span className="material-symbols-outlined text-warning" style={{ fontSize: '16px' }}>cloud</span>
          <span>Firebase Cloud & Login</span>
          {user && <span className="badge bg-success rounded-pill ms-1" style={{ fontSize: '0.65rem' }}>Admin</span>}
        </button>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`alert alert-${statusMessage.type} py-2 px-3 m-0 rounded-3 d-flex align-items-center gap-2`}
          style={{ fontSize: '0.84rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {statusMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: APPEARANCE & FORMAT */}
      {activeTab === 'appearance' && (
        <div className="row g-3">
          <div className="col-6 form-group">
            <label htmlFor="opt-font" className="form-label mb-1">Tipografía</label>
            <select
              id="opt-font"
              className="form-select"
              value={settings.fontFamily}
              onChange={e => onChangeSetting('fontFamily', e.target.value)}
            >
              <optgroup label="Serif (Elegante)">
                {FONT_OPTIONS.filter(f => f.category === 'Serif').map(f => (
                  <option key={f.name} value={f.cssValue}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Sans-Serif (Moderno)">
                {FONT_OPTIONS.filter(f => f.category === 'Sans-Serif').map(f => (
                  <option key={f.name} value={f.cssValue}>{f.name}</option>
                ))}
              </optgroup>
              <optgroup label="Monospace (Código)">
                {FONT_OPTIONS.filter(f => f.category === 'Monospace').map(f => (
                  <option key={f.name} value={f.cssValue}>{f.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="col-6 form-group">
            <label htmlFor="opt-size" className="form-label mb-1">Tamaño Fuente</label>
            <select
              id="opt-size"
              className="form-select"
              value={settings.fontSize}
              onChange={e => onChangeSetting('fontSize', e.target.value)}
            >
              <option value="9.5pt">9.5pt (Compacto)</option>
              <option value="10pt">10pt</option>
              <option value="10.5pt">10.5pt (Recomendado)</option>
              <option value="11pt">11pt</option>
              <option value="12pt">12pt</option>
            </select>
          </div>

          <div className="col-6 form-group">
            <label htmlFor="opt-spacing" className="form-label mb-1">Interlineado</label>
            <select
              id="opt-spacing"
              className="form-select"
              value={settings.lineSpacing}
              onChange={e => onChangeSetting('lineSpacing', parseFloat(e.target.value))}
            >
              <option value="1.1">1.1 (Compacto)</option>
              <option value="1.2">1.2</option>
              <option value="1.25">1.25 (Recomendado)</option>
              <option value="1.35">1.35</option>
              <option value="1.5">1.5</option>
            </select>
          </div>

          <div className="col-6 form-group">
            <label htmlFor="opt-margins" className="form-label mb-1">Márgenes</label>
            <select
              id="opt-margins"
              className="form-select"
              value={settings.margins}
              onChange={e => onChangeSetting('margins', e.target.value)}
            >
              <option value="0.4in">0.4 pulg</option>
              <option value="0.5in">0.5 pulg</option>
              <option value="0.6in">0.6 pulg (Recomendado)</option>
              <option value="0.75in">0.75 pulg</option>
              <option value="1in">1 pulg</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 2: FIREBASE CLOUD & ADMIN LOGIN */}
      {activeTab === 'cloud' && (
        <div className="d-flex flex-column gap-3">
          {!user ? (
            <div className="p-3 bg-dark bg-opacity-40 rounded-3 border border-secondary border-opacity-15 text-center d-flex flex-column align-items-center gap-2">
              <span className="material-symbols-outlined text-warning fs-1 mb-1">lock</span>
              <h6 className="text-white fw-bold m-0">Acceso de Administrador (Firebase)</h6>
              <p className="text-muted m-0" style={{ fontSize: '0.82rem', maxWidth: '380px' }}>
                Inicia sesión con Google para sincronizar y actualizar la base de datos de Firebase Realtime (<code>portfolio/bdData</code>).
                <br />
                <span className="text-warning fw-medium">Acceso restringido únicamente a: {ADMIN_EMAIL}</span>
              </p>

              <button
                type="button"
                className="btn btn-outline-light d-flex align-items-center gap-2 px-4 py-2 mt-2 rounded-pill transition-all"
                onClick={handleAuthLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Conectando con Google...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Iniciar sesión con Google</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {/* Authenticated User Status Card */}
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-20 rounded-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Admin'}
                      className="rounded-circle border border-success border-opacity-40"
                      width="42"
                      height="42"
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: '42px', height: '42px', fontSize: '1.2rem' }}
                    >
                      {(user.displayName || user.email || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="text-white fw-bold m-0" style={{ fontSize: '0.92rem' }}>
                        {user.displayName || 'Administrador'}
                      </h6>
                      <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Autorizado</span>
                    </div>
                    <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>{user.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                  onClick={handleAuthLogout}
                  disabled={isLoading}
                  title="Cerrar sesión"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                  <span>Salir</span>
                </button>
              </div>

              {/* Cloud Database Actions */}
              <div className="p-3 bg-dark bg-opacity-30 rounded-3 border border-secondary border-opacity-15 d-flex flex-column gap-2">
                <h6 className="text-white fw-semibold mb-1 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                  <span className="material-symbols-outlined text-warning" style={{ fontSize: '18px' }}>database</span>
                  <span>Operaciones de Base de Datos Cloud (portfolio/bdData)</span>
                </h6>
                <p className="text-muted m-0 mb-2" style={{ fontSize: '0.78rem' }}>
                  Sincroniza la información del CV cargado en pantalla directamente con tu nodo de Firebase Realtime Database.
                </p>

                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button
                    type="button"
                    className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                    onClick={handleSaveToCloud}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_upload</span>
                    )}
                    <span>Actualizar BD Cloud</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2"
                    onClick={handleFetchFromCloud}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cloud_download</span>
                    )}
                    <span>Cargar desde la BD Cloud</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
