import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Vaga {
  id: string;
  titulo: string;
}

interface FavoriteVagaSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVagaSelected: (vagaId: string) => void;
}

export const FavoriteVagaSelector = ({
  open,
  onOpenChange,
  onVagaSelected,
}: FavoriteVagaSelectorProps) => {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [selectedVaga, setSelectedVaga] = useState<string>("");
  const [showNewVaga, setShowNewVaga] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
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
        .from('vagas' as any)
        .select('id, titulo')
        .eq('recrutador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVagas((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    }
  };

  const handleCreateVaga = async () => {
    if (!novoTitulo.trim()) {
      toast.error("Digite um título para a vaga");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vagas' as any)
        .insert({
          titulo: novoTitulo,
          recrutador_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Vaga criada com sucesso!");
      setNovoTitulo("");
      setShowNewVaga(false);
      loadVagas();
      setSelectedVaga((data as any).id);
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      toast.error("Erro ao criar vaga");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedVaga) {
      toast.error("Selecione uma vaga");
      return;
    }
    onVagaSelected(selectedVaga);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar em Meus Favoritos</DialogTitle>
          <DialogDescription>
            Para salvar este candidato em "Meus Favoritos", selecione uma vaga
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showNewVaga ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vaga</label>
                <Select value={selectedVaga} onValueChange={setSelectedVaga}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {vagas.map((vaga) => (
                      <SelectItem key={vaga.id} value={vaga.id}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {vaga.titulo}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowNewVaga(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Nova Vaga
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título da Nova Vaga</label>
                <Input
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewVaga(false);
                    setNovoTitulo("");
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateVaga}
                  disabled={loading}
                  className="flex-1"
                >
                  Criar Vaga
                </Button>
              </div>
            </div>
          )}

          {!showNewVaga && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedVaga}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
