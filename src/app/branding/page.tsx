"use client";

import { useState, useEffect } from 'react';
import { Upload, Palette, Save, RefreshCw, Eye, Download } from 'lucide-react';

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [branding, setBranding] = useState({
    // Colors
    primaryColor: '#8B5CF6', // purple-600
    secondaryColor: '#3B82F6', // blue-600
    accentColor: '#F59E0B', // amber-500
    backgroundColor: '#F3F4F6', // gray-100

    // Institution Details
    institutionName: 'National Polytechnic Institute',
    institutionShort: 'NPIAMS',
    address: 'Port Moresby, Papua New Guinea',
    phone: '+675 XXX XXXX',
    email: 'info@npi.edu.pg',
    website: 'www.npi.edu.pg',

    // Logo
    logoUrl: '',
    logoText: 'P',

    // Theme
    sidebarStyle: 'gradient', // gradient, solid
    headerStyle: 'transparent', // transparent, solid
    cornerRadius: 'rounded', // rounded, square
  });

  const colorPresets = [
    { name: 'PNG Purple', primary: '#8B5CF6', secondary: '#3B82F6', accent: '#F59E0B' },
    { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#1E40AF', accent: '#F97316' },
    { name: 'Forest Green', primary: '#059669', secondary: '#047857', accent: '#DC2626' },
    { name: 'Sunset Orange', primary: '#EA580C', secondary: '#DC2626', accent: '#7C2D12' },
    { name: 'Professional Gray', primary: '#4B5563', secondary: '#6B7280', accent: '#3B82F6' },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage for demo
      localStorage.setItem('npi_branding', JSON.stringify(branding));

      // Apply CSS custom properties
      const root = document.documentElement;
      root.style.setProperty('--primary-color', branding.primaryColor);
      root.style.setProperty('--secondary-color', branding.secondaryColor);
      root.style.setProperty('--accent-color', branding.accentColor);
      root.style.setProperty('--background-color', branding.backgroundColor);

      setMessage('Branding settings saved successfully!');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBranding({ ...branding, logoUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setBranding({
      ...branding,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
  };

  const generateCSS = () => {
    return `/* Custom Branding CSS for ${branding.institutionName} */
:root {
  --primary-color: ${branding.primaryColor};
  --secondary-color: ${branding.secondaryColor};
  --accent-color: ${branding.accentColor};
  --background-color: ${branding.backgroundColor};
}

/* Sidebar gradient */
.sidebar-gradient {
  background: linear-gradient(to bottom, ${branding.primaryColor}, ${branding.secondaryColor});
}

/* Primary buttons */
.btn-primary {
  background-color: ${branding.primaryColor};
  border-color: ${branding.primaryColor};
}

.btn-primary:hover {
  background-color: ${branding.secondaryColor};
  border-color: ${branding.secondaryColor};
}

/* Accent elements */
.accent-color {
  color: ${branding.accentColor};
}

.bg-accent {
  background-color: ${branding.accentColor};
}`;
  };

  const downloadCSS = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'npi-custom-branding.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load saved branding on component mount
  useEffect(() => {
    const saved = localStorage.getItem('npi_branding');
    if (saved) {
      setBranding(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Branding & Customization</h1>
          <p className="text-gray-600">Customize your institution's branding, colors, and visual identity</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'colors', name: 'Colors & Theme', icon: Palette },
              { id: 'logo', name: 'Logo & Identity', icon: Upload },
              { id: 'institution', name: 'Institution Details', icon: RefreshCw },
              { id: 'preview', name: 'Preview & Export', icon: Eye }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Colors & Theme Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            {/* Color Presets */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Color Presets</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyColorPreset(preset)}
                    className="p-4 border rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="flex space-x-1 mb-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.accent }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { key: 'primaryColor', label: 'Primary Color', description: 'Main brand color' },
                  { key: 'secondaryColor', label: 'Secondary Color', description: 'Accent and highlights' },
                  { key: 'accentColor', label: 'Accent Color', description: 'Buttons and CTAs' },
                  { key: 'backgroundColor', label: 'Background Color', description: 'Page background' }
                ].map((color) => (
                  <div key={color.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {color.label}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={branding[color.key as keyof typeof branding] as string}
                        onChange={(e) => setBranding({ ...branding, [color.key]: e.target.value })}
                        className="w-12 h-12 border border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <input
                          type="text"
                          value={branding[color.key as keyof typeof branding] as string}
                          onChange={(e) => setBranding({ ...branding, [color.key]: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1">{color.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Options */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Style Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Style</label>
                  <select
                    value={branding.sidebarStyle}
                    onChange={(e) => setBranding({ ...branding, sidebarStyle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gradient">Gradient</option>
                    <option value="solid">Solid Color</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                  <select
                    value={branding.headerStyle}
                    onChange={(e) => setBranding({ ...branding, headerStyle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="transparent">Transparent</option>
                    <option value="solid">Solid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Corner Radius</label>
                  <select
                    value={branding.cornerRadius}
                    onChange={(e) => setBranding({ ...branding, cornerRadius: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logo & Identity Tab */}
        {activeTab === 'logo' && (
          <div className="space-y-8">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Institution Logo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {branding.logoUrl ? (
                      <div>
                        <img src={branding.logoUrl} alt="Logo" className="mx-auto h-20 mb-4" />
                        <button
                          onClick={() => setBranding({ ...branding, logoUrl: '' })}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Logo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-800">Upload a logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo Text Fallback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo Text</label>
                  <input
                    type="text"
                    value={branding.logoText}
                    onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="P"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used when no logo is uploaded</p>

                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      {branding.logoText}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Institution Details Tab */}
        {activeTab === 'institution' && (
          <div className="space-y-8">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Institution Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
                  <input
                    type="text"
                    value={branding.institutionName}
                    onChange={(e) => setBranding({ ...branding, institutionName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Name/Acronym</label>
                  <input
                    type="text"
                    value={branding.institutionShort}
                    onChange={(e) => setBranding({ ...branding, institutionShort: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={branding.address}
                    onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={branding.email}
                    onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={branding.website}
                    onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview & Export Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-8">
            {/* Preview */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>

              {/* Sidebar Preview */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <div
                  className="p-4 text-white"
                  style={{
                    background: branding.sidebarStyle === 'gradient'
                      ? `linear-gradient(to bottom, ${branding.primaryColor}, ${branding.secondaryColor})`
                      : branding.primaryColor
                  }}
                >
                  <div className="flex items-center gap-3">
                    {branding.logoUrl ? (
                      <img src={branding.logoUrl} alt="Logo" className="w-8 h-8" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: branding.accentColor }}
                      >
                        {branding.logoText}
                      </div>
                    )}
                    <div className="text-sm">
                      <div>({branding.institutionShort}) {branding.institutionName}</div>
                      <div className="text-xs opacity-90">Academic Management System</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Sample Menu Items</div>
                    <div className="text-sm text-gray-600 pl-4">• Academic Setup</div>
                    <div className="text-sm text-gray-600 pl-4">• Student Management</div>
                    <div className="text-sm text-gray-600 pl-4">• Fee Management</div>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="flex gap-4">
                <button
                  onClick={downloadCSS}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Download CSS
                </button>
              </div>
            </div>

            {/* CSS Preview */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated CSS</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{generateCSS()}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
