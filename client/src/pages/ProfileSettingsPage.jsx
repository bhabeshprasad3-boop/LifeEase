import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile.service';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import styles from './ProfileSettingsPage.module.css';

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [prefs, setPrefs] = useState({
    email: user?.reminderPreferences?.email ?? true,
    inApp: user?.reminderPreferences?.inApp ?? true,
    daysBefore: user?.reminderPreferences?.daysBefore || [30, 7, 1],
  });
  const [status, setStatus] = useState({ loading: false, success: '', error: '' });

  const setMsg = (s) => {
    setStatus(p => ({ ...p, ...s }));
    setTimeout(() => setStatus(p => ({ ...p, success: '', error: '' })), 3000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      const res = await profileService.updateProfile({ name: profile.name });
      updateUser(res.data.user);
      setMsg({ loading: false, success: 'Profile updated successfully.' });
    } catch (err) {
      setMsg({ loading: false, error: err.response?.data?.message || 'Update failed.' });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      setMsg({ loading: false, error: 'New password must be at least 6 characters.' }); return;
    }
    setStatus({ loading: true, success: '', error: '' });
    try {
      await profileService.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMsg({ loading: false, success: 'Password changed successfully.' });
    } catch (err) {
      setMsg({ loading: false, error: err.response?.data?.message || 'Change failed.' });
    }
  };

  const handlePrefsSave = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: '', error: '' });
    try {
      const res = await profileService.updateReminderPreferences(prefs);
      updateUser(res.data.user);
      setMsg({ loading: false, success: 'Preferences saved.' });
    } catch (err) {
      setMsg({ loading: false, error: err.response?.data?.message || 'Save failed.' });
    }
  };

  const toggleDay = (day) => {
    setPrefs(p => ({
      ...p,
      daysBefore: p.daysBefore.includes(day)
        ? p.daysBefore.filter(d => d !== day)
        : [...p.daysBefore, day],
    }));
  };

  const tabs = [
    { key: 'profile', label: '👤 Personal Info' },
    { key: 'security', label: '🔒 Security' },
    { key: 'preferences', label: '🔔 Preferences' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile & Settings</h1>
        <p className={styles.subtitle}>Manage your personal information and preferences.</p>
      </div>

      {/* Avatar block */}
      <div className={styles.avatarBlock}>
        <div className={styles.avatarCircle}>
          {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className={styles.avatarName}>{user?.name}</p>
          <p className={styles.avatarEmail}>{user?.email}</p>
        </div>
      </div>

      {/* Status messages */}
      {status.success && <div className={styles.success}>{status.success}</div>}
      {status.error && <div className={styles.error}>{status.error}</div>}

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button key={t.key} className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.card}>
        {/* Personal Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className={styles.form}>
            <h2 className={styles.cardTitle}>Personal Information</h2>
            <InputField label="Full Name" id="name" value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            <InputField label="Email Address" id="email" value={user?.email} disabled
              hint="Email cannot be changed" />
            <div className={styles.formActions}>
              <Button type="submit" loading={status.loading}>Save Changes</Button>
            </div>
          </form>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSave} className={styles.form}>
            <h2 className={styles.cardTitle}>Change Password</h2>
            <InputField label="Current Password" id="currentPassword" type="password"
              value={passwords.currentPassword}
              onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
            <InputField label="New Password" id="newPassword" type="password"
              value={passwords.newPassword}
              onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
              hint="Minimum 6 characters" />
            <div className={styles.formActions}>
              <Button type="submit" loading={status.loading}>Change Password</Button>
            </div>
          </form>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <form onSubmit={handlePrefsSave} className={styles.form}>
            <h2 className={styles.cardTitle}>Reminder Preferences</h2>
            <div className={styles.prefsList}>
              <label className={styles.prefRow}>
                <div>
                  <p className={styles.prefLabel}>Email Notifications</p>
                  <p className={styles.prefDesc}>Receive renewal reminders via email</p>
                </div>
                <div className={`${styles.toggle} ${prefs.email ? styles.toggleOn : ''}`}
                  onClick={() => setPrefs(p => ({ ...p, email: !p.email }))}>
                  <div className={styles.toggleKnob} />
                </div>
              </label>
              <label className={styles.prefRow}>
                <div>
                  <p className={styles.prefLabel}>In-App Notifications</p>
                  <p className={styles.prefDesc}>Show notifications inside the app</p>
                </div>
                <div className={`${styles.toggle} ${prefs.inApp ? styles.toggleOn : ''}`}
                  onClick={() => setPrefs(p => ({ ...p, inApp: !p.inApp }))}>
                  <div className={styles.toggleKnob} />
                </div>
              </label>

              <div className={styles.daysSection}>
                <p className={styles.prefLabel}>Remind me before expiry</p>
                <div className={styles.dayChips}>
                  {[30, 7, 1].map(d => (
                    <button key={d} type="button"
                      className={`${styles.dayChip} ${prefs.daysBefore.includes(d) ? styles.dayChipActive : ''}`}
                      onClick={() => toggleDay(d)}>
                      {d} {d === 1 ? 'day' : 'days'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.formActions}>
              <Button type="submit" loading={status.loading}>Save Preferences</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
