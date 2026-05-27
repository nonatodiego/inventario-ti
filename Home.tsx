import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Trash2, Edit2, AlertCircle, FileText, X, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';


interface ResourceDetails {
  notebookSerialNumber?: string;
  notebookHostname?: string;
  desktopSerialNumber?: string;
  desktopHostname?: string;
  phoneChip?: string;
  phoneIMEI?: string;
  phonePulsusID?: string;
}

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
  resourceDetails: ResourceDetails;
  termAttached: boolean;
  termFileName: string;
  termFileData: string | null;
  regDate: string;
}

export default function Home() {
  // tRPC queries and mutations
  const { data: inventoryData, isLoading: isLoadingInventory, refetch: refetchInventory } = trpc.inventory.list.useQuery();
  const createMutation = trpc.inventory.create.useMutation();
  const updateMutation = trpc.inventory.update.useMutation();
  const deleteMutation = trpc.inventory.delete.useMutation();

  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLicense, setFilterLicense] = useState('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    userRole: '',
    location: '',
    manager: '',
    emailLicense: 'E1' as 'E1' | 'E3',
    hasPhone: false,
    hasMonitor: false,
    hasMouse: false,
    hasKeyboard: false,
    hasHeadset: false,
    hasNotebookStand: false,
    hasNotebook: false,
    hasDesktop: false,
    resourceDetails: {} as ResourceDetails,
    regDate: new Date().toISOString().split('T')[0],
  });

  const [termFileData, setTermFileData] = useState<string | undefined>(undefined);
  const [termFileName, setTermFileName] = useState('');

  // Load data from API on mount
  useEffect(() => {
    if (inventoryData) {
      const formattedData = inventoryData.map((item: any) => ({
        id: item.id,
        userName: item.userName,
        userRole: item.userRole,
        location: item.location,
        manager: item.manager,
        emailLicense: item.emailLicense,
        hasPhone: item.hasPhone,
        hasMonitor: item.hasMonitor,
        hasMouse: item.hasMouse,
        hasKeyboard: item.hasKeyboard,
        hasHeadset: item.hasHeadset,
        hasNotebookStand: item.hasNotebookStand,
        hasNotebook: item.hasNotebook,
        hasDesktop: item.hasDesktop,
        termAttached: item.termAttached,
        termFileName: item.termFileName || '',
        termFileData: item.termFileData,
        regDate: item.regDate,
        resourceDetails: {
          phoneChip: item.phoneChip,
          phoneIMEI: item.phoneIMEI,
          phonePulsusID: item.phonePulsusID,
          notebookSerialNumber: item.notebookSerialNumber,
          notebookHostname: item.notebookHostname,
          desktopSerialNumber: item.desktopSerialNumber,
          desktopHostname: item.desktopHostname,
        },
      }));
      setInventory(formattedData);
    }
  }, [inventoryData]);

  const handleTermFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecione apenas arquivos PDF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setTermFileData(base64);
        setTermFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        userName: formData.userName,
        userRole: formData.userRole,
        location: formData.location,
        manager: formData.manager,
        emailLicense: formData.emailLicense,
        hasPhone: formData.hasPhone,
        hasMonitor: formData.hasMonitor,
        hasMouse: formData.hasMouse,
        hasKeyboard: formData.hasKeyboard,
        hasHeadset: formData.hasHeadset,
        hasNotebookStand: formData.hasNotebookStand,
        hasNotebook: formData.hasNotebook,
        hasDesktop: formData.hasDesktop,
        termAttached: termFileData ? true : false,
        termFileName: termFileName,
        termFileData: termFileData,
        regDate: formData.regDate,
        phoneChip: formData.resourceDetails.phoneChip,
        phoneIMEI: formData.resourceDetails.phoneIMEI,
        phonePulsusID: formData.resourceDetails.phonePulsusID,
        notebookSerialNumber: formData.resourceDetails.notebookSerialNumber,
        notebookHostname: formData.resourceDetails.notebookHostname,
        desktopSerialNumber: formData.resourceDetails.desktopSerialNumber,
        desktopHostname: formData.resourceDetails.desktopHostname,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }

      resetForm();
      await refetchInventory();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      userRole: '',
      location: '',
      manager: '',
      emailLicense: 'E1',
      hasPhone: false,
      hasMonitor: false,
      hasMouse: false,
      hasKeyboard: false,
      hasHeadset: false,
      hasNotebookStand: false,
      hasNotebook: false,
      hasDesktop: false,
      resourceDetails: {},
      regDate: new Date().toISOString().split('T')[0],
    });
    setTermFileData(undefined);
    setTermFileName('');
    setEditingId(null);
  };

  const handleEdit = (record: InventoryRecord) => {
    setFormData({
      userName: record.userName,
      userRole: record.userRole,
      location: record.location,
      manager: record.manager,
      emailLicense: record.emailLicense,
      hasPhone: record.hasPhone,
      hasMonitor: record.hasMonitor,
      hasMouse: record.hasMouse,
      hasKeyboard: record.hasKeyboard,
      hasHeadset: record.hasHeadset,
      hasNotebookStand: record.hasNotebookStand,
      hasNotebook: record.hasNotebook,
      hasDesktop: record.hasDesktop,
      resourceDetails: record.resourceDetails || {},
      regDate: record.regDate,
    });
    setTermFileData(record.termFileData || undefined);
    setTermFileName(record.termFileName);
    setEditingId(record.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      try {
        await deleteMutation.mutateAsync({ id });
        await refetchInventory();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar registro');
      }
    }
  };

  const downloadTerm = (termFile: string | undefined) => {
    if (!termFile) return;
    const link = document.createElement('a');
    link.href = termFile;
    link.download = 'termo_assinado.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (inventory.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }

    let csv = 'Nome,Cargo,Localizacao,Gestor,Licenca,Celular,Monitor,Mouse,Teclado,Headset,Suporte,Notebook,Desktop,Termo,Data\n';
    inventory.forEach(i => {
      const hasHeadsetStr = i.hasHeadset ? 'Sim' : 'Não';
      const hasNotebookStandStr = i.hasNotebookStand ? 'Sim' : 'Não';
      const hasPhoneStr = i.hasPhone ? 'Sim' : 'Não';
      const hasMonitorStr = i.hasMonitor ? 'Sim' : 'Não';
      const hasMouseStr = i.hasMouse ? 'Sim' : 'Não';
      const hasKeyboardStr = i.hasKeyboard ? 'Sim' : 'Não';
      const hasNotebookStr = i.hasNotebook ? 'Sim' : 'Não';
      const hasDesktopStr = i.hasDesktop ? 'Sim' : 'Não';
      const hasTermStr = i.termAttached ? 'Sim' : 'Não';
      csv += `"${i.userName}","${i.userRole}","${i.location}","${i.manager}","${i.emailLicense}","${hasPhoneStr}","${hasMonitorStr}","${hasMouseStr}","${hasKeyboardStr}","${hasHeadsetStr}","${hasNotebookStandStr}","${hasNotebookStr}","${hasDesktopStr}","${hasTermStr}","${i.regDate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventario_ti.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLicense = filterLicense === 'all' || item.emailLicense === filterLicense;
    return matchesSearch && matchesLicense;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Inventário de TI</h1>
          <p className="text-slate-600">Controle centralizado de ativos e recursos por usuário</p>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Form Card */}
        <Card className="p-8 shadow-md">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <span>📝</span> Cadastro de Usuário / Equipamento
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="userName">Nome do Usuário *</Label>
                <Input
                  id="userName"
                  placeholder="Ex: joao.silva"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userRole">Cargo do Usuário *</Label>
                <Input
                  id="userRole"
                  placeholder="Ex: Analista de Sistemas"
                  value={formData.userRole}
                  onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  placeholder="Ex: DEPOT"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Nome do Gestor *</Label>
                <Input
                  id="manager"
                  placeholder="Ex: maria.costa"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailLicense">Licença de E-mail *</Label>
                <Select value={formData.emailLicense} onValueChange={(value) => setFormData({ ...formData, emailLicense: value as 'E1' | 'E3' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="E1">E1</SelectItem>
                    <SelectItem value="E3">E3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regDate">Data de Cadastro</Label>
                <Input
                  id="regDate"
                  type="date"
                  value={formData.regDate}
                  onChange={(e) => setFormData({ ...formData, regDate: e.target.value })}
                />
              </div>
            </div>

            {/* Checkboxes - Basic Resources */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <Label className="block text-sm font-semibold text-slate-900 mb-4">Recursos Entregues</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPhone"
                    checked={formData.hasPhone}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasPhone: checked as boolean })}
                  />
                  <Label htmlFor="hasPhone" className="font-normal cursor-pointer">📱 Celular Corp.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMonitor"
                    checked={formData.hasMonitor}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMonitor: checked as boolean })}
                  />
                  <Label htmlFor="hasMonitor" className="font-normal cursor-pointer">🖥️ Monitor Extra</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasMouse"
                    checked={formData.hasMouse}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMouse: checked as boolean })}
                  />
                  <Label htmlFor="hasMouse" className="font-normal cursor-pointer">🖱️ Mouse s/ Fio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasKeyboard"
                    checked={formData.hasKeyboard}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasKeyboard: checked as boolean })}
                  />
                  <Label htmlFor="hasKeyboard" className="font-normal cursor-pointer">⌨️ Teclado s/ Fio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasHeadset"
                    checked={formData.hasHeadset}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasHeadset: checked as boolean })}
                  />
                  <Label htmlFor="hasHeadset" className="font-normal cursor-pointer">🎧 Headset</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNotebook"
                    checked={formData.hasNotebook}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasNotebook: checked as boolean })}
                  />
                  <Label htmlFor="hasNotebook" className="font-normal cursor-pointer">💻 Notebook</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNotebookStand"
                    checked={formData.hasNotebookStand}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasNotebookStand: checked as boolean })}
                  />
                  <Label htmlFor="hasNotebookStand" className="font-normal cursor-pointer">📚 Suporte Notebook</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDesktop"
                    checked={formData.hasDesktop}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasDesktop: checked as boolean })}
                  />
                  <Label htmlFor="hasDesktop" className="font-normal cursor-pointer">🖥️ Desktop</Label>
                </div>
              </div>
            </div>

            {/* Detailed Resource Fields */}
            {(formData.hasPhone || formData.hasNotebook || formData.hasDesktop) && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <Label className="block text-sm font-semibold text-slate-900 mb-4">Detalhes dos Recursos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.hasPhone && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phoneChip">Número do Chip (Celular)</Label>
                        <Input
                          id="phoneChip"
                          placeholder="Ex: 11987654321"
                          value={formData.resourceDetails.phoneChip || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, phoneChip: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneIMEI">IMEI (Celular)</Label>
                        <Input
                          id="phoneIMEI"
                          placeholder="Ex: 356938035643809"
                          value={formData.resourceDetails.phoneIMEI || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, phoneIMEI: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phonePulsusID">ID Pulsus (Celular)</Label>
                        <Input
                          id="phonePulsusID"
                          placeholder="Ex: PLS123456"
                          value={formData.resourceDetails.phonePulsusID || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, phonePulsusID: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {formData.hasNotebook && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="notebookSerialNumber">Número de Série (Notebook)</Label>
                        <Input
                          id="notebookSerialNumber"
                          placeholder="Ex: SN123456789"
                          value={formData.resourceDetails.notebookSerialNumber || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, notebookSerialNumber: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notebookHostname">Hostname (Notebook)</Label>
                        <Input
                          id="notebookHostname"
                          placeholder="Ex: JOAO-NB-001"
                          value={formData.resourceDetails.notebookHostname || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, notebookHostname: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}

                  {formData.hasDesktop && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="desktopSerialNumber">Número de Série (Desktop)</Label>
                        <Input
                          id="desktopSerialNumber"
                          placeholder="Ex: SN987654321"
                          value={formData.resourceDetails.desktopSerialNumber || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, desktopSerialNumber: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desktopHostname">Hostname (Desktop)</Label>
                        <Input
                          id="desktopHostname"
                          placeholder="Ex: MARIA-DT-001"
                          value={formData.resourceDetails.desktopHostname || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            resourceDetails: { ...formData.resourceDetails, desktopHostname: e.target.value }
                          })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Term Upload */}
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <Label className="block text-sm font-semibold text-slate-900 mb-4">📄 Termo de Uso Assinado (PDF)</Label>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleTermFileChange}
                  className="cursor-pointer"
                />
                {termFileName && (
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-amber-300">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-slate-700">{termFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTermFileData(undefined);
                        setTermFileName('');
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-600">Máximo 5MB • Apenas arquivos PDF</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    💾 {editingId ? 'Atualizar' : 'Salvar'} Registro
                  </>
                )}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Table Card */}
        <Card className="p-8 shadow-md">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <span>📋</span> Registros Cadastrados
          </h2>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Usuário, localização ou gestor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label>Filtrar Licença</Label>
              <Select value={filterLicense} onValueChange={(value) => setFilterLicense(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="E1">E1</SelectItem>
                  <SelectItem value="E3">E3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={() => window.location.href = '/resources'} className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                📦 Recursos Disponíveis
              </Button>
              <Button onClick={() => window.location.href = '/dashboard'} className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                📊 Dashboard
              </Button>
            </div>
          </div>

          {/* Loading state */}
          {isLoadingInventory && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Table */}
          {!isLoadingInventory && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Usuário</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Cargo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Localização</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Gestor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Licença</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Recursos</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Termo</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-500">
                        Nenhum registro encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => (
                      <React.Fragment key={item.id}>
                        <tr className={`border-b border-slate-200 hover:bg-slate-50 transition cursor-pointer ${!item.termAttached ? 'bg-yellow-50' : ''}`} onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}>
                          <td className="py-3 px-4 font-medium text-slate-900">{item.userName}</td>
                          <td className="py-3 px-4 text-slate-700">{item.userRole}</td>
                          <td className="py-3 px-4 text-slate-700">{item.location}</td>
                          <td className="py-3 px-4 text-slate-700">{item.manager}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block bg-slate-200 text-slate-800 px-2 py-1 rounded text-xs font-semibold">
                              {item.emailLicense}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 text-lg">
                              {item.hasPhone && <span title="Celular">📱</span>}
                              {item.hasMonitor && <span title="Monitor">🖥️</span>}
                              {item.hasMouse && <span title="Mouse">🖱️</span>}
                              {item.hasKeyboard && <span title="Teclado">⌨️</span>}
                              {item.hasHeadset && <span title="Headset">🎧</span>}
                              {item.hasNotebook && <span title="Notebook">💻</span>}
                              {item.hasNotebookStand && <span title="Suporte">📚</span>}
                              {item.hasDesktop && <span title="Desktop">🖥️</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {item.termAttached ? (
                              <button
                                onClick={() => downloadTerm(item.termFileData || undefined)}
                                className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold hover:bg-green-200 transition"
                              >
                                <FileText className="w-3 h-3" />
                                Baixar
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                                <AlertCircle className="w-3 h-3" />
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                className="h-8 px-2"
                              >
                                {expandedRow === item.id ? '▲' : '▼'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRow === item.id && (
                          <tr key={`expanded-${item.id}`} className="bg-slate-100 border-b border-slate-200">
                            <td colSpan={7} className="py-4 px-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {item.hasPhone && (
                                  <div className="bg-white p-3 rounded border border-slate-300">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">📱 CELULAR</p>
                                    <p className="text-sm text-slate-700"><strong>Chip:</strong> {item.resourceDetails.phoneChip || '-'}</p>
                                    <p className="text-sm text-slate-700"><strong>IMEI:</strong> {item.resourceDetails.phoneIMEI || '-'}</p>
                                    <p className="text-sm text-slate-700"><strong>ID Pulsus:</strong> {item.resourceDetails.phonePulsusID || '-'}</p>
                                  </div>
                                )}
                                {item.hasNotebook && (
                                  <div className="bg-white p-3 rounded border border-slate-300">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">💻 NOTEBOOK</p>
                                    <p className="text-sm text-slate-700"><strong>Série:</strong> {item.resourceDetails.notebookSerialNumber || '-'}</p>
                                    <p className="text-sm text-slate-700"><strong>Hostname:</strong> {item.resourceDetails.notebookHostname || '-'}</p>
                                  </div>
                                )}
                                {item.hasDesktop && (
                                  <div className="bg-white p-3 rounded border border-slate-300">
                                    <p className="text-xs font-semibold text-slate-600 mb-2">🖥️ DESKTOP</p>
                                    <p className="text-sm text-slate-700"><strong>Série:</strong> {item.resourceDetails.desktopSerialNumber || '-'}</p>
                                    <p className="text-sm text-slate-700"><strong>Hostname:</strong> {item.resourceDetails.desktopHostname || '-'}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
