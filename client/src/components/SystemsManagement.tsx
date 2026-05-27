import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function SystemsManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });

  const { data: systems, refetch } = trpc.systems.listSystems.useQuery();
  const createMutation = trpc.systems.createSystem.useMutation();
  const updateMutation = trpc.systems.updateSystem.useMutation();
  const deleteMutation = trpc.systems.deleteSystem.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome do sistema é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name || undefined,
          description: formData.description || undefined,
          category: formData.category || undefined,
        });
        toast.success('Sistema atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category || undefined,
        });
        toast.success('Sistema criado com sucesso!');
      }

      setFormData({ name: '', description: '', category: '' });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error(editingId ? 'Erro ao atualizar sistema' : 'Erro ao criar sistema');
      console.error(error);
    }
  };

  const handleEdit = (system: any) => {
    setFormData({
      name: system.name,
      description: system.description || '',
      category: system.category || '',
    });
    setEditingId(system.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este sistema? Todos os perfis e acessos também serão removidos.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Sistema deletado com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao deletar sistema');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', category: '' });
    setEditingId(null);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Gerenciar Sistemas</h2>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Sistema
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Sistema' : 'Novo Sistema'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Atualize as informações do sistema'
                  : 'Adicione um novo sistema à sua organização'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Sistema *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Microsoft 365, Salesforce, Jira"
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
                  placeholder="Ex: Plataforma de produtividade"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  placeholder="Ex: Produtividade, CRM, Desenvolvimento"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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

      {systems && systems.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systems.map((system) => (
              <TableRow key={system.id}>
                <TableCell className="font-medium">{system.name}</TableCell>
                <TableCell>{system.description || '-'}</TableCell>
                <TableCell>{system.category || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(system)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(system.id)}
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
          Nenhum sistema cadastrado. Clique em "Novo Sistema" para começar.
        </div>
      )}
    </Card>
  );
}
