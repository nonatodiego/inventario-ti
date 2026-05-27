import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export function AccessProfilesManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: '',
  });

  const { data: systems } = trpc.systems.listSystems.useQuery();
  const { data: profiles, refetch } = trpc.systems.getAccessProfiles.useQuery(
    { systemId: parseInt(selectedSystemId) },
    { enabled: !!selectedSystemId }
  );
  const createMutation = trpc.systems.createAccessProfile.useMutation();
  const updateMutation = trpc.systems.updateAccessProfile.useMutation();
  const deleteMutation = trpc.systems.deleteAccessProfile.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSystemId || !formData.name.trim()) {
      toast.error('Sistema e nome do perfil são obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name || undefined,
          description: formData.description || undefined,
          permissions: formData.permissions || undefined,
        });
        toast.success('Perfil atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          systemId: parseInt(selectedSystemId),
          name: formData.name,
          description: formData.description || undefined,
          permissions: formData.permissions || undefined,
        });
        toast.success('Perfil criado com sucesso!');
      }

      setFormData({ name: '', description: '', permissions: '' });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(editingId ? 'Erro ao atualizar perfil' : 'Erro ao criar perfil');
      console.error(error);
    }
  };

  const handleEdit = (profile: any) => {
    setFormData({
      name: profile.name,
      description: profile.description || '',
      permissions: profile.permissions || '',
    });
    setEditingId(profile.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este perfil? Todos os acessos usando este perfil também serão removidos.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Perfil deletado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar perfil');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', permissions: '' });
    setEditingId(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Gerenciar Perfis de Acesso</h2>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button disabled={!selectedSystemId}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Perfil
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar Perfil' : 'Novo Perfil de Acesso'}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'Atualize as informações do perfil'
                    : 'Adicione um novo perfil de acesso para o sistema selecionado'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Perfil *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Admin, Editor, Viewer"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Acesso total ao sistema"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permissions">Permissões</Label>
                  <Textarea
                    id="permissions"
                    placeholder="Ex: criar, editar, deletar, visualizar"
                    value={formData.permissions}
                    onChange={(e) =>
                      setFormData({ ...formData, permissions: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Salvando...'
                      : editingId
                      ? 'Atualizar'
                      : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2">
          <Label htmlFor="system-select">Selecione um Sistema</Label>
          <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
            <SelectTrigger id="system-select">
              <SelectValue placeholder="Escolha um sistema..." />
            </SelectTrigger>
            <SelectContent>
              {systems?.map((system) => (
                <SelectItem key={system.id} value={system.id.toString()}>
                  {system.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSystemId && (
          <>
            {profiles && profiles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead className="w-24">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell>{profile.description || '-'}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {profile.permissions || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(profile)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(profile.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum perfil cadastrado para este sistema. Clique em "Novo Perfil"
                para começar.
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
