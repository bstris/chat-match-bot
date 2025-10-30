import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Filter, Briefcase, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CandidateCard } from "@/components/CandidateCard";
import { CandidateDetailDialog } from "@/components/CandidateDetailDialog";
import { CustomFiltersDialog } from "@/components/CustomFiltersDialog";
import { toast } from "sonner";

interface Vaga {
  id: string;
  titulo: string;
}

interface FavoriteCandidato {
  id: string;
  candidato_id: number;
  vaga: {
    id: string;
    titulo: string;
  };
}

export default function Favorites() {
  const navigate = useNavigate();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [selectedVaga, setSelectedVaga] = useState<string>("all");
  const [favoritos, setFavoritos] = useState<FavoriteCandidato[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [customFilterDialogOpen, setCustomFilterDialogOpen] = useState(false);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);

  useEffect(() => {
    loadVagas();
    loadFavoritos();
    loadSavedFilters();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [selectedVaga, favoritos]);

  const loadSavedFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('filtros_personalizados' as any)
        .select('*')
        .eq('recrutador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setSavedFilters(data);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

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

  const loadFavoritos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favoritos' as any)
        .select(`
          id,
          candidato_id,
          vaga:vagas(id, titulo)
        `)
        .eq('recrutador_id', user.id);

      if (error) throw error;
      setFavoritos((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const filterCandidates = async () => {
    try {
      let filteredFavoritos = favoritos;
      if (selectedVaga !== "all") {
        filteredFavoritos = favoritos.filter(f => f.vaga.id === selectedVaga);
      }

      const candidateIds = filteredFavoritos.map(f => f.candidato_id);
      
      if (candidateIds.length === 0) {
        setCandidates([]);
        return;
      }

      const { data, error } = await supabase
        .from('GUPPY')
        .select('*')
        .in('candidatoId', candidateIds);

      if (error) throw error;

      const mappedCandidates = (data || []).map((candidate: any, index: number) => ({
        id: candidate.candidatoId?.toString() || candidate.id_candidato?.toString() || index.toString(),
        name: candidate.nome || `Candidato ${index + 1}`,
        title: candidate.title || "Desenvolvedor",
        location: candidate.zipCode || "Brasil",
        experience: `${Math.floor(Math.random() * 8) + 1} anos`,
        compatibility: Math.floor(Math.random() * 30) + 70,
        skills: ["React", "JavaScript", "TypeScript"],
        summary: candidate.description?.substring(0, 100) + "..." || "Candidato da base de dados",
        avatar: candidate.nome ? candidate.nome.charAt(0).toUpperCase() : `C${index + 1}`
      }));

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error('Erro ao filtrar candidatos:', error);
    }
  };

  const handleRemoveFavorite = async (candidateId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('favoritos' as any)
        .delete()
        .eq('candidato_id', parseInt(candidateId))
        .eq('recrutador_id', user.id);

      if (error) throw error;

      toast.success('Candidato removido dos favoritos');
      loadFavoritos();
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const handleViewDetails = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setDetailDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Meus Favoritos
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie seus candidatos favoritados por vaga
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                onClick={() => setCustomFilterDialogOpen(true)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Criar Filtro Personalizado
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedVaga} onValueChange={setSelectedVaga}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Filtrar por vaga" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as vagas</SelectItem>
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
        </div>

        <ScrollArea className="h-[calc(100vh-250px)]">
          {candidates.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum favorito encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Comece favoritando candidatos na área de busca
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  {...candidate}
                  onFavorite={handleRemoveFavorite}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </main>

      <CandidateDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        candidate={selectedCandidate}
      />

      <CustomFiltersDialog
        open={customFilterDialogOpen}
        onOpenChange={setCustomFilterDialogOpen}
        onFilterSaved={loadSavedFilters}
      />
    </div>
  );
}
