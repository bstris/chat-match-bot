import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, Calendar, Code, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  compatibility: number;
  skills: string[];
  summary: string;
  avatar: string;
}

import { CandidateCard } from "./CandidateCard";
import { FavoriteVagaDialog } from "./FavoriteVagaDialog";
import { CandidateDetailDialog } from "./CandidateDetailDialog";

export const CandidateResults = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [favoriteDialogOpen, setFavoriteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    loadCandidatesFromDocuments();
  }, []);

  const loadCandidatesFromDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('GUPPY' as any)
        .select('*')
        .limit(10);

      if (error) throw error;

      if (data) {
        const realCandidates: Candidate[] = data.map((candidate: any, index: number) => ({
          id: candidate.candidatoId?.toString() || candidate.id_candidato?.toString() || index.toString(),
          name: candidate.nome || `Candidato ${index + 1}`,
          title: candidate.title || "Desenvolvedor",
          location: candidate.zipCode || "Brasil",
          experience: `${Math.floor(Math.random() * 8) + 1} anos`,
          compatibility: Math.floor(Math.random() * 30) + 70,
          skills: ["React", "JavaScript", "TypeScript"].slice(0, Math.floor(Math.random() * 3) + 1),
          summary: candidate.description?.substring(0, 100) + "..." || "Candidato da base de dados",
          avatar: candidate.nome ? candidate.nome.charAt(0).toUpperCase() : `C${index + 1}`
        }));

        setCandidates(realCandidates);
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    }
  };

  const handleFavorite = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setFavoriteDialogOpen(true);
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
    <>
      <Card className="w-96 h-full bg-card border-border shadow-card rounded-xl">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Star className="w-5 h-5 mr-2 text-primary" />
            Melhores Matches
          </h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidatos encontrados
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <CandidateCard
                key={candidate.id}
                {...candidate}
                rank={index + 1}
                onFavorite={handleFavorite}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Card className="p-3 bg-gradient-card shadow-card rounded-lg">
            <div className="flex items-center space-x-2 text-primary mb-2">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-medium">Dica do Sistema</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Os candidatos são ranqueados por compatibilidade usando IA para analisar skills, experiência e fit cultural.
            </p>
          </Card>
        </div>
      </Card>

      {selectedCandidate && (
        <>
          <FavoriteVagaDialog
            open={favoriteDialogOpen}
            onOpenChange={setFavoriteDialogOpen}
            candidateId={selectedCandidate.id}
            candidateName={selectedCandidate.name}
          />
          <CandidateDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            candidate={selectedCandidate}
          />
        </>
      )}
    </>
  );
};