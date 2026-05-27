import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface SystemAccess {
  systemId: number;
  systemName: string;
  profileId: number;
  profileName: string;
}

interface SystemsFormSectionProps {
  selectedSystems: SystemAccess[];
  onSystemsChange: (systems: SystemAccess[]) => void;
}

export function SystemsFormSection({ selectedSystems, onSystemsChange }: SystemsFormSectionProps) {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');

  // Load systems using tRPC hook
  const { data: systems = [], isLoading: isLoadingSystems } = trpc.systems.listSystems.useQuery();

  // Load profiles for selected system
  const { data: currentProfiles = [], isLoading: isLoadingProfiles } = trpc.systems.getAccessProfiles.useQuery(
    { systemId: parseInt(selectedSystemId) },
    { enabled: !!selectedSystemId }
  );

  const handleAddSystem = () => {
    if (!selectedSystemId || !selectedProfileId) {
      alert('Selecione um sistema e um perfil de acesso');
      return;
    }

    const systemIdNum = parseInt(selectedSystemId);
    const profileIdNum = parseInt(selectedProfileId);
    
    const system = systems.find(s => s.id === systemIdNum);
    const profile = currentProfiles.find(p => p.id === profileIdNum);

    if (!system || !profile) {
      alert('Sistema ou perfil não encontrado');
      return;
    }

    // Check if already added
    const alreadyExists = selectedSystems.some(
      s => s.systemId === systemIdNum && s.profileId === profileIdNum
    );

    if (alreadyExists) {
      alert('Este sistema com este perfil já foi adicionado');
      return;
    }

    const newAccess: SystemAccess = {
      systemId: systemIdNum,
      systemName: system.name,
      profileId: profileIdNum,
      profileName: profile.name,
    };

    onSystemsChange([...selectedSystems, newAccess]);
    setSelectedSystemId('');
    setSelectedProfileId('');
  };

  const handleRemoveSystem = (systemId: number, profileId: number) => {
    onSystemsChange(
      selectedSystems.filter(
        s => !(s.systemId === systemId && s.profileId === profileId)
      )
    );
  };

  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
      <Label className="block text-sm font-semibold text-slate-900 mb-4">
        🔐 Sistemas e Perfis de Acesso
      </Label>

      {/* Selection Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="system-select" className="text-xs font-medium">
            Selecione o Sistema
          </Label>
          <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
            <SelectTrigger id="system-select" disabled={isLoadingSystems}>
              <SelectValue placeholder={isLoadingSystems ? "Carregando..." : "Escolha um sistema..."} />
            </SelectTrigger>
            <SelectContent>
              {systems.map(system => (
                <SelectItem key={system.id} value={system.id.toString()}>
                  {system.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-select" className="text-xs font-medium">
            Perfil de Acesso
          </Label>
          <Select 
            value={selectedProfileId} 
            onValueChange={setSelectedProfileId}
            disabled={!selectedSystemId || currentProfiles.length === 0 || isLoadingProfiles}
          >
            <SelectTrigger id="profile-select">
              <SelectValue placeholder={
                isLoadingProfiles ? "Carregando..." : 
                !selectedSystemId ? "Escolha um sistema primeiro..." :
                currentProfiles.length === 0 ? "Sem perfis disponíveis" :
                "Escolha um perfil..."
              } />
            </SelectTrigger>
            <SelectContent>
              {currentProfiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id.toString()}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleAddSystem}
            disabled={!selectedSystemId || !selectedProfileId || isLoadingProfiles}
            className="w-full"
          >
            {isLoadingProfiles ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            + Adicionar
          </Button>
        </div>
      </div>

      {/* Selected Systems Display */}
      {selectedSystems.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">Sistemas Selecionados:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedSystems.map((access, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded border border-slate-300 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{access.systemName}</p>
                  <p className="text-xs text-slate-600">{access.profileName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSystem(access.systemId, access.profileId)}
                  className="ml-2 text-slate-400 hover:text-red-600 transition"
                  title="Remover"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSystems.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          Nenhum sistema adicionado ainda. Selecione um sistema e perfil acima.
        </p>
      )}
    </div>
  );
}
