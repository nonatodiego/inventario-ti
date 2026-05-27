import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface InventoryRecord {
  id: number;
  userName: string;
  userRole: string;
  location: string;
  manager: string;
  emailLicense: 'E1' | 'E3';
  hasPhone: boolean;
  hasMonitor: boolean;
  hasMouse: boolean;
  hasKeyboard: boolean;
  hasHeadset: boolean;
  hasNotebookStand: boolean;
  hasNotebook: boolean;
  hasDesktop: boolean;
  resourceDetails: any;
  termAttached: boolean;
  termFileName: string;
  termFileData: string | null;
  regDate: string;
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [stats, setStats] = useState({
    totalNotebooks: 0,
    totalPhones: 0,
    totalHeadsets: 0,
    licenseE1: 0,
    licenseE3: 0,
  });

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('it_inventory');
    if (saved) {
      const data = JSON.parse(saved);
      setInventory(data);
      calculateStats(data);
    }
  }, []);

  const calculateStats = (data: InventoryRecord[]) => {
    const stats = {
      totalNotebooks: data.filter(item => item.hasNotebook).length,
      totalPhones: data.filter(item => item.hasPhone).length,
      totalHeadsets: data.filter(item => item.hasHeadset).length,
      licenseE1: data.filter(item => item.emailLicense === 'E1').length,
      licenseE3: data.filter(item => item.emailLicense === 'E3').length,
    };
    setStats(stats);
  };

  const licenseData = [
    { name: 'E1', value: stats.licenseE1, fill: '#3b82f6' },
    { name: 'E3', value: stats.licenseE3, fill: '#8b5cf6' },
  ];

  const resourceData = [
    { name: 'Notebooks', quantidade: stats.totalNotebooks, fill: '#10b981' },
    { name: 'Celulares', quantidade: stats.totalPhones, fill: '#f59e0b' },
    { name: 'Headsets', quantidade: stats.totalHeadsets, fill: '#ef4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 Dashboard de Estatísticas</h1>
              <p className="text-slate-600">Resumo de recursos e licenças</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="bg-blue-600 hover:bg-blue-700">
              ← Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Notebooks</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalNotebooks}</p>
              </div>
              <span className="text-6xl">💻</span>
            </div>
          </Card>

          <Card className="p-6 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Celulares</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.totalPhones}</p>
              </div>
              <span className="text-6xl">📱</span>
            </div>
          </Card>

          <Card className="p-6 shadow-md bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total de Headsets</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.totalHeadsets}</p>
              </div>
              <span className="text-6xl">🎧</span>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* License Pie Chart */}
          <Card className="p-6 shadow-md">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Distribuição de Licenças</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={licenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {licenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Summary */}
        <Card className="p-6 shadow-md bg-blue-50">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">📋 Resumo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
            <div>
              <p className="font-medium">Total de Usuários: <span className="text-blue-600 font-bold">{inventory.length}</span></p>
            </div>
            <div>
              <p className="font-medium">Licenças E1: <span className="text-blue-600 font-bold">{stats.licenseE1}</span> | Licenças E3: <span className="text-blue-600 font-bold">{stats.licenseE3}</span></p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
