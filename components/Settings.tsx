
import React, { useState, useEffect } from 'react';
import { SchoolConfig } from '../types';

interface Props {
    config: SchoolConfig;
    onSave: (config: SchoolConfig) => void;
}

export const Settings: React.FC<Props> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState<SchoolConfig>(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleSave = () => {
        onSave(localConfig);
        alert('Pengaturan berhasil disimpan!');
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow border border-gray-200 mt-8">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4 text-blue-900">Pengaturan Umum</h2>
            
            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-2">Nama Kepala Sekolah (Lengkap dengan Gelar)</label>
                <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={localConfig.principalName}
                    onChange={(e) => setLocalConfig({...localConfig, principalName: e.target.value})}
                    placeholder="Contoh: DIDIK SULISTYO, M.M.Pd."
                />
            </div>

            <div className="mb-8">
                <label className="block text-gray-700 font-bold mb-2">NIP Kepala Sekolah</label>
                <input 
                    type="text" 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={localConfig.principalNip}
                    onChange={(e) => setLocalConfig({...localConfig, principalNip: e.target.value})}
                    placeholder="Contoh: 196605181989011002"
                />
            </div>

            <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700 font-bold w-full md:w-auto flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
                Simpan Pengaturan
            </button>
        </div>
    );
};
