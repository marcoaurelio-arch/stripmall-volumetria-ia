/**
 * Painel de Cenários Salvos
 * 
 * Lista e gerencia cenários financeiros salvos
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, TrendingUp, DollarSign, Calendar, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface SavedScenariosPanelProps {
  projectId: number;
  onLoadScenario?: (scenario: any) => void;
}

export default function SavedScenariosPanel({
  projectId,
  onLoadScenario,
}: SavedScenariosPanelProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Query para listar cenários
  const { data: scenarios, isLoading, refetch } = trpc.financialProjection.list.useQuery({
    projectId,
  });

  // Mutation para deletar
  const deleteMutation = trpc.financialProjection.delete.useMutation({
    onSuccess: () => {
      toast.success('Cenário deletado com sucesso!');
      setDeleteDialogOpen(false);
      setSelectedScenario(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao deletar cenário: ' + error.message);
    },
  });

  // Mutation para atualizar
  const updateMutation = trpc.financialProjection.update.useMutation({
    onSuccess: () => {
      toast.success('Cenário atualizado com sucesso!');
      setEditDialogOpen(false);
      setSelectedScenario(null);
      refetch();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cenário: ' + error.message);
    },
  });

  /**
   * Formata valor monetário
   */
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  /**
   * Formata percentual
   */
  const formatarPercentual = (valor: number) => {
    return `${(valor / 100).toFixed(2)}%`;
  };

  /**
   * Formata data
   */
  const formatarData = (data: Date | string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Abrir dialog de deletar
   */
  const handleDelete = (scenario: any) => {
    setSelectedScenario(scenario);
    setDeleteDialogOpen(true);
  };

  /**
   * Confirmar deleção
   */
  const confirmDelete = () => {
    if (selectedScenario) {
      deleteMutation.mutate({ id: selectedScenario.id });
    }
  };

  /**
   * Abrir dialog de editar
   */
  const handleEdit = (scenario: any) => {
    setSelectedScenario(scenario);
    setEditName(scenario.nome || '');
    setEditNotes(scenario.notas || '');
    setEditDialogOpen(true);
  };

  /**
   * Confirmar edição
   */
  const confirmEdit = () => {
    if (selectedScenario) {
      updateMutation.mutate({
        id: selectedScenario.id,
        nome: editName,
        notas: editNotes,
      });
    }
  };

  /**
   * Carregar cenário
   */
  const handleLoad = (scenario: any) => {
    if (onLoadScenario) {
      onLoadScenario(scenario);
      toast.success(`Cenário "${scenario.nome}" carregado!`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenários Salvos</CardTitle>
          <CardDescription>Carregando cenários...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenários Salvos</CardTitle>
          <CardDescription>
            Nenhum cenário salvo ainda. Salve um cenário para comparar diferentes análises.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Cenários Salvos ({scenarios.length})</CardTitle>
          <CardDescription>
            Gerencie e compare seus cenários financeiros salvos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Card key={scenario.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{scenario.nome}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {formatarData(scenario.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Indicadores principais */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        TIR:
                      </span>
                      <Badge variant={scenario.tir && scenario.tir > 1000 ? 'default' : 'secondary'}>
                        {scenario.tir ? formatarPercentual(scenario.tir) : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        VPL:
                      </span>
                      <Badge variant={scenario.vpl && scenario.vpl > 0 ? 'default' : 'destructive'}>
                        {scenario.vpl ? formatarMoeda(scenario.vpl) : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Financiamento:</span>
                      <span className="font-medium capitalize">{scenario.tipoFinanciamento}</span>
                    </div>
                  </div>

                  {/* Notas */}
                  {scenario.notas && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <FileText className="inline h-3 w-3 mr-1" />
                      {scenario.notas.length > 80
                        ? scenario.notas.substring(0, 80) + '...'
                        : scenario.notas}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(scenario)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(scenario)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Deletar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o cenário "{selectedScenario?.nome}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Editar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cenário</DialogTitle>
            <DialogDescription>
              Atualize o nome e as notas do cenário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Cenário *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas</Label>
              <Textarea
                id="edit-notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updateMutation.isPending || !editName.trim()}
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
