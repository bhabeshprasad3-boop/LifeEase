import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile.service';
import InputField from '../components/common/InputField';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';
import styles from './ProfileSettingsPage.module.css';

const TABS = [
  { key: 'profile',     icon: 'personal',  label: 'Personal Info'  },
  { key: 'security',    icon: 'shield',     label: 'Security'       },
  { key: 'preferences', icon: 'bell',       label: 'Preferences'    },
];

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'' });
  const [prefs, setPrefs] = useState({
    email: user?.reminderPreferences?.email ?? true,
    inApp: user?.reminderPreferences?.inApp ?? true,
    daysBefore: user?.reminderPreferences?.daysBefore || [30, 7, 1],
  });
  const [status, setStatus] = useState({ loading:false, success:'', error:'' });

  const flash = (msg) => {
    setStatus(p => ({ ...p, ...msg }));
    setTimeout(() => setStatus(p => ({ ...p, success:'', error:'' })), 3500);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setStatus({ loading:true, success:'', error:'' });
    try {
      const res = await profileService.updateProfile({ name: profile.name });
      updateUser(res.data.user);
      flash({ loading:false, success:'Profile updated successfully.' });
    } catch (err) {
      flash({ loading:false, error: err.response?.data?.message || 'Update failed.' });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) { flash({ loading:false, error:'New password must be at least 6 characters.' }); return; }
    setStatus({ loading:true, success:'', error:'' });
    try {
      await profileService.changePassword(passwords);
      setPasswords({ currentPassword:'', newPassword:'' });
      flash({ loading:false, success:'Password changed successfully.' });
    } catch (err) {
      flash({ loading:false, error: err.response?.data?.message || 'Change failed.' });
    }
  };

  const handlePrefsSave = async (e) => {
    e.preventDefault();
    setStatus({ loading:true, success:'', error:'' });
    try {
      const res = await profileService.updateReminderPreferences(prefs);
      updateUser(res.data.user);
      flash({ loading:false, success:'Preferences saved.' });
    } catch (err) {
      flash({ loading:false, error: err.response?.data?.message || 'Save failed.' });
    }
  };

  const toggleDay = d => setPrefs(p => ({
    ...p,
    daysBefore: p.daysBefore.includes(d) ? p.daysBefore.filter(x => x !== d) : [...p.daysBefore, d],
  }));

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your profile, security, and preferences.</p>
      </div>

      {/* User card */}
      <div className={styles.userCard}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.name}</p>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
      </div>

      {/* Messages */}
      {status.success && (
        <div className={styles.msgSuccess}>
          <Icon name="checkCircle" size={16} /> {status.success}
        </div>
      )}
      {status.error && (
        <div className={styles.msgError}>
          <Icon name="alertCircle" size={16} /> {status.error}
        </div>
      )}

      {/* Tabs + Panel */}
      <div className={styles.layout}>
        <nav className={styles.tabNav}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`${styles.tabBtn} ${activeTab === t.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.panel}>
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className={styles.form}>
              <h2 className={styles.panelTitle}>Personal Information</h2>
              <InputField label="Full name" id="name" value={profile.name}
                onChange={e => setProfile({ name: e.target.value })} />
              <InputField label="Email address" id="email" value={user?.email}
                disabled hint="Email cannot be changed" />
              <div className={styles.formActions}>
                <Button type="submit" loading={status.loading}>Save Changes</Button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave} className={styles.form}>
              <h2 className={styles.panelTitle}>Change Password</h2>
              <InputField label="Current password" id="currentPassword" type="password"
                value={passwords.currentPassword}
                onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} />
              <InputField label="New password" id="newPassword" type="password"
                value={passwords.newPassword}
                onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                hint="Minimum 6 characters" />
              <div className={styles.formActions}>
                <Button type="submit" loading={status.loading}>Change Password</Button>
              </div>
            </form>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handlePrefsSave} className={styles.form}>
              <h2 className={styles.panelTitle}>Reminder Preferences</h2>
              <div className={styles.prefList}>
                <div className={styles.prefItem}>
                  <div className={styles.prefText}>
                    <p className={styles.prefLabel}>Email Notifications</p>
                    <p className={styles.prefDesc}>Receive renewal reminders by email</p>
                  </div>
                  <div
                    className={`${styles.toggle} ${prefs.email ? styles.toggleOn : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, email: !p.email }))}
                    role="switch" aria-checked={prefs.email}
                  >
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.prefItem}>
                  <div className={styles.prefText}>
                    <p className={styles.prefLabel}>In-App Notifications</p>
                    <p className={styles.prefDesc}>Show alerts within the application</p>
                  </div>
                  <div
                    className={`${styles.toggle} ${prefs.inApp ? styles.toggleOn : ''}`}
                    onClick={() => setPrefs(p => ({ ...p, inApp: !p.inApp }))}
                    role="switch" aria-checked={prefs.inApp}
                  >
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.daysSection}>
                  <p className={styles.prefLabel}>Remind me before expiry</p>
                  <p className={styles.prefDesc}>Receive alerts this many days in advance</p>
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
    </div>
  );
}
