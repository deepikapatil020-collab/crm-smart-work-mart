import React, { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import {
  FileSpreadsheet,
  Upload,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Database
} from 'lucide-react';

export default function ImportExport() {
  const { user, isAdmin, isHR } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('import'); // 'import' | 'export'
  const [selectedEntity, setSelectedEntity] = useState('leads');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      error('Please select a CSV or Excel file to upload');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.importData(selectedEntity, formData);
      success(res.message);
      setImportResult(res);
      setFile(null);
    } catch (err) {
      error(err.message || 'Import failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = (entity, format = 'csv') => {
    const url = api.getExportUrl(entity, format);
    window.open(url, '_blank');
  };

  const handleDownloadTemplate = (entity) => {
    const url = api.getTemplateUrl(entity);
    window.open(url, '_blank');
  };

  const entities = [
    {
      id: 'leads',
      name: 'Sales Leads & Prospects',
      description: 'Contact names, company, phone, email, expected value, stage, source, and notes.',
      allowed: true
    },
    {
      id: 'deals',
      name: 'Deals & Contracts',
      description: 'Deal titles, customer names, deal value, stage, probability, and closing dates.',
      allowed: true
    },
    {
      id: 'customers',
      name: 'Customer Accounts',
      description: 'Company accounts, primary contacts, total billing history, and office addresses.',
      allowed: true
    },
    {
      id: 'users',
      name: 'Staff & Team Accounts',
      description: 'Employee and HR accounts, passwords, department, job title, and system roles.',
      allowed: isAdmin || isHR
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="w-3.5 h-3.5 text-amber-600" />
            Data Operations Hub
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Import & Export Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bulk upload CSV/Excel records or generate downloadable reports for Smart Work Mart
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'import' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Import Data</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'export' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-sky-500" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {activeTab === 'import' ? (
        
        /* IMPORT SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form & Uploader (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                Upload Spreadsheet (CSV or Excel)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select the target entity type, choose your spreadsheet file, and upload directly into the CRM database.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-5 text-xs font-medium">
              
              {/* Entity Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  1. Select Target CRM Entity:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {entities.filter(e => e.allowed).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelectedEntity(e.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedEntity === e.id
                          ? 'border-amber-500 bg-amber-500/10 text-slate-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs">{e.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{e.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-slate-700 font-bold mb-2">
                  2. Choose File (.csv, .xlsx, .xls):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/20 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {file ? file.name : 'Drag & drop your file here, or click to browse'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Supports CSV, Excel (.xlsx, .xls) up to 10MB
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(selectedEntity)}
                  className="text-amber-600 hover:text-amber-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Download Sample {selectedEntity.toUpperCase()} Template (.CSV)
                </button>

                <button
                  type="submit"
                  disabled={!file || isUploading}
                  className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 transition flex items-center gap-2"
                >
                  {isUploading ? 'Importing...' : 'Start Data Import'}
                </button>
              </div>

            </form>

            {/* Import Status Alert */}
            {importResult && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{importResult.message}</span>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="text-red-700 mt-2 space-y-1">
                    <div className="font-bold">Row warnings:</div>
                    {importResult.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Templates & Instructions (1 Col) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                Templates & Column Mappings
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Download ready-to-use spreadsheet templates with properly formatted headers.
              </p>
            </div>

            <div className="space-y-3">
              {entities.filter(e => e.allowed).map((e) => (
                <div key={e.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{e.name}</span>
                    <button
                      onClick={() => handleDownloadTemplate(e.id)}
                      className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Template
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {e.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Role-Based Guardrails
              </div>
              <p className="leading-relaxed">
                Admins can import HR and Employee records. HR accounts can only import Employee records.
              </p>
            </div>

          </div>

        </div>

      ) : (

        /* EXPORT SECTION */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entities.filter(e => e.allowed).map((entity) => (
            <div
              key={entity.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">{entity.name}</h3>
                  <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {entity.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => handleExport(entity.id, 'csv')}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  Download CSV
                </button>
                <button
                  onClick={() => handleExport(entity.id, 'xlsx')}
                  className="flex-1 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  Download Excel (.XLSX)
                </button>
              </div>
            </div>
          ))}
        </div>

      )}

    </div>
  );
}
