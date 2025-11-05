import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Vaga {
  id: string;
  titulo: string;
}

interface ChatFavoriteVagaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVagaSelected: (vagaId: string) => void;
}

export const ChatFavoriteVagaDialog = ({
  open,
  onOpenChange,
  onVagaSelected
}: ChatFavoriteVagaDialogProps) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [showNewVaga, setShowNewVaga] = useState(false);
  const [newVagaTitulo, setNewVagaTitulo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadVagas();
    }
  }, [open]);

  const loadVagas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vagas')
        .select('id, titulo')
        .eq('recrutador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVagas(data || []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      toast.error('Erro ao carregar vagas');
    }
  };

  const createVaga = async () => {
    if (!newVagaTitulo.trim()) {
      toast.error('Digite um título para a vaga');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('vagas')
        .insert({
          titulo: newVagaTitulo,
          recrutador_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      onVagaSelected(data.id);
      setNewVagaTitulo("");
      setShowNewVaga(false);
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      toast.error('Erro ao criar vaga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Favoritar para qual vaga?</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {vagas.map((vaga) => (
                <Button
                  key={vaga.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onVagaSelected(vaga.id)}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {vaga.titulo}
                </Button>
              ))}
              {vagas.length === 0 && !showNewVaga && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma vaga cadastrada ainda
                </p>
              )}
            </div>
          </ScrollArea>

          {!showNewVaga ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowNewVaga(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Nova Vaga
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="titulo">Título da Vaga</Label>
                <Input
                  id="titulo"
                  value={newVagaTitulo}
                  onChange={(e) => setNewVagaTitulo(e.target.value)}
                  placeholder="Ex: Engenheiro Civil"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewVaga(false);
                    setNewVagaTitulo("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={createVaga}
                  disabled={loading}
                >
                  Criar e Favoritar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
