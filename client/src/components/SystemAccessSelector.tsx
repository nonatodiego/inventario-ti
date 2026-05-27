import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SystemAccess {
  id: number;
  system: {
    id: number;
    name: string;
    category: string | null;
  } | null;
  profile: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  notes: string | null;
  grantedAt: Date;
}

interface SystemAccessSelectorProps {
  inventoryRecordId: number;
  userName: string;
}

export function SystemAccessSelector({
  inventoryRecordId,
  userName,
}: SystemAccessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [editingAccessId, setEditingAccessId] = useState<number | null>(null);

  // Queries
  const { data: systems = [], isLoading: isLoadingSystems } =
    trpc.systems.listSystems.useQuery();
  const { data: accessProfiles = [], isLoading: isLoadingProfiles } =
    trpc.systems.getAccessProfiles.useQuery(
      { systemId: selectedSystemId || 0 },
      { enabled: !!selectedSystemId }
    );
  const { data: collaboratorAccess = [], isLoading: isLoadingAccess } =
    trpc.systems.getCollaboratorAccess.useQuery({
      inventoryRecordId,
    });

  // Mutations
  const utils = trpc.useUtils();
  const addAccessMutation = trpc.systems.addSystemAccess.useMutation({
    onSuccess: () => {
      toast.success("Acesso adicionado com sucesso!");
      resetForm();
      utils.systems.getCollaboratorAccess.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar acesso: ${error.message}`);
    },
  });

  const updateAccessMutation = trpc.systems.updateSystemAccess.useMutation({
    onSuccess: () => {
      toast.success("Acesso atualizado com sucesso!");
      resetForm();
      utils.systems.getCollaboratorAccess.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar acesso: ${error.message}`);
    },
  });

  const removeAccessMutation = trpc.systems.removeSystemAccess.useMutation({
    onSuccess: () => {
      toast.success("Acesso removido com sucesso!");
      utils.systems.getCollaboratorAccess.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao remover acesso: ${error.message}`);
    },
  });

  const resetForm = () => {
    setSelectedSystemId(null);
    setSelectedProfileId(null);
    setNotes("");
    setEditingAccessId(null);
    setIsOpen(false);
  };

  const handleAddOrUpdate = async () => {
    if (!selectedSystemId || !selectedProfileId) {
      toast.error("Por favor, selecione um sistema e um perfil de acesso");
      return;
    }

    if (editingAccessId) {
      await updateAccessMutation.mutateAsync({
        accessId: editingAccessId,
        accessProfileId: selectedProfileId,
        notes: notes || undefined,
      });
    } else {
      await addAccessMutation.mutateAsync({
        inventoryRecordId,
        systemId: selectedSystemId,
        accessProfileId: selectedProfileId,
        notes: notes || undefined,
      });
    }
  };

  const handleEdit = (access: SystemAccess) => {
    setEditingAccessId(access.id);
    setSelectedSystemId(access.system?.id || null);
    setSelectedProfileId(access.profile?.id || null);
    setNotes(access.notes || "");
    setIsOpen(true);
  };

  const handleRemove = async (accessId: number) => {
    if (
      confirm(
        "Tem certeza que deseja remover este acesso? Esta ação não pode ser desfeita."
      )
    ) {
      await removeAccessMutation.mutateAsync({ accessId });
    }
  };

  const isLoading =
    isLoadingSystems ||
    isLoadingProfiles ||
    isLoadingAccess ||
    addAccessMutation.isPending ||
    updateAccessMutation.isPending ||
    removeAccessMutation.isPending;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          🔐 Acessos a Sistemas
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Acesso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAccessId ? "Editar Acesso" : "Adicionar Acesso a Sistema"}
              </DialogTitle>
              <DialogDescription>
                Usuário: <strong>{userName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="system">Sistema</Label>
                <Select
                  value={selectedSystemId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedSystemId(parseInt(value));
                    setSelectedProfileId(null);
                  }}
                  disabled={editingAccessId !== null || isLoadingSystems}
                >
                  <SelectTrigger id="system">
                    <SelectValue placeholder="Selecione um sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems.map((sys) => (
                      <SelectItem key={sys.id} value={sys.id.toString()}>
                        {sys.name}
                        {sys.category && ` (${sys.category})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="profile">Perfil de Acesso</Label>
                <Select
                  value={selectedProfileId?.toString() || ""}
                  onValueChange={(value) =>
                    setSelectedProfileId(parseInt(value))
                  }
                  disabled={!selectedSystemId || isLoadingProfiles}
                >
                  <SelectTrigger id="profile">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                        {profile.description && ` - ${profile.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  placeholder="Ex: Acesso temporário até 31/12/2024"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAddOrUpdate}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? "Processando..."
                  : editingAccessId
                  ? "Atualizar Acesso"
                  : "Adicionar Acesso"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingAccess ? (
        <div className="text-center py-8 text-slate-500">
          Carregando acessos...
        </div>
      ) : collaboratorAccess.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p>Nenhum acesso a sistemas configurado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {collaboratorAccess.map((access) => (
            <div
              key={access.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {access.system?.name || "Sistema desconhecido"}
                  </span>
                  {access.system?.category && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {access.system.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-600">
                    Perfil: <strong>{access.profile?.name || "Desconhecido"}</strong>
                  </span>
                  {access.profile?.description && (
                    <span className="text-xs text-slate-500">
                      ({access.profile.description})
                    </span>
                  )}
                </div>
                {access.notes && (
                  <div className="text-xs text-slate-500 mt-1">
                    📝 {access.notes}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  Concedido em: {new Date(access.grantedAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(access)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(access.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
