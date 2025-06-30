import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { Save, User, Bell, Shield, Globe } from 'lucide-react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import ErrorMessage from '../components/UI/ErrorMessage';
import { authService } from '../services/auth.service';

export default function Settings() {
  const { user } = useAuth();
  const { profile, preferences, updatePreferences } = useProfile();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [accountForm, setAccountForm] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferencesForm, setPreferencesForm] = useState({
    language: preferences?.language || 'en',
    autoplay: preferences?.autoplay ?? true,
    notifications: preferences?.notifications ?? true,
    showMatureContent: preferences?.showMatureContent ?? true
  });

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      if (accountForm.newPassword) {
        await authService.updatePassword(accountForm.newPassword);
        setSuccess('Password updated successfully');
        setAccountForm(prev => ({ 
          ...prev, 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }));
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    setLoading(true);
    try {
      await updatePreferences(preferencesForm);
      setSuccess('Preferences updated successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "account", label: "Account", icon: User },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Safety", icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <nav className="md:w-64">
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-slate-800 text-gray-300"
                  }`}>
                  <section.icon size={20} />
                  <span>{section.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-slate-800 rounded-2xl p-6">
            {error && (
              <ErrorMessage message={error} onClose={() => setError("")} />
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-400">
                {success}
              </div>
            )}

            {/* Account Section */}
            {activeSection === "account" && (
              <form onSubmit={handleAccountUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

                <Input
                  label="Email Address"
                  type="email"
                  value={accountForm.email}
                  disabled
                  helperText="Email cannot be changed"
                />

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>

                  <Input
                    label="Current Password"
                    type="password"
                    value={accountForm.currentPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter current password"
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                    helperText="At least 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={accountForm.confirmPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  loading={loading}
                  disabled={loading}>
                  Save Changes
                </Button>
              </form>
            )}

            {/* Preferences Section */}
            {activeSection === "preferences" && (
              <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={preferencesForm.language}
                    onChange={(e) =>
                      setPreferencesForm((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferencesForm.autoplay}
                      onChange={(e) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          autoplay: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-600 bg-slate-700 text-indigo-600"
                    />
                    <div>
                      <span className="font-medium">Autoplay trailers</span>
                      <p className="text-sm text-gray-400">
                        Automatically play trailers when browsing
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferencesForm.showMatureContent}
                      onChange={(e) =>
                        setPreferencesForm((prev) => ({
                          ...prev,
                          showMatureContent: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded border-gray-600 bg-slate-700 text-indigo-600"
                    />
                    <div>
                      <span className="font-medium">Show mature content</span>
                      <p className="text-sm text-gray-400">
                        Include R-rated and mature content in results
                      </p>
                    </div>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  loading={loading}
                  disabled={loading}>
                  Save Preferences
                </Button>
              </form>
            )}

            {/* Other sections... */}
          </div>
        </div>
      </div>
    </div>
  );
}