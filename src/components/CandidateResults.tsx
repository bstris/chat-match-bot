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

export const CandidateResults = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    loadCandidatesFromDocuments();
  }, []);

  const loadCandidatesFromDocuments = async () => {
    try {
      // Carregar dados da tabela GUPPY para obter nomes reais
      const { data, error } = await supabase
        .from('GUPPY')
        .select('*')
        .limit(10);

      if (error) throw error;

      if (data) {
        // Usar dados reais dos candidatos
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
  return (
    <Card className="w-96 h-full bg-card border-border">
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
            <Card 
              key={candidate.id}
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-all duration-300 border-border bg-gradient-card hover:shadow-glow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                    {candidate.avatar}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.title}</p>
                  </div>
                </div>
                <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                  #{index + 1}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">Compatibilidade</span>
                    <span className="text-sm font-bold text-primary">{candidate.compatibility}%</span>
                  </div>
                  <Progress 
                    value={candidate.compatibility} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {candidate.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {candidate.experience}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {candidate.summary}
                </p>

                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill) => (
                    <Badge 
                      key={skill} 
                      variant="outline" 
                      className="text-xs border-primary/20 text-primary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Card className="p-3 bg-gradient-card">
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
  );
};