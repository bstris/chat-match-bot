import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Star, MapPin, Calendar, Code, Briefcase } from "lucide-react";

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

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "Ana Silva",
    title: "Frontend Developer",
    location: "São Paulo, SP",
    experience: "4 anos",
    compatibility: 95,
    skills: ["React", "TypeScript", "Next.js", "Tailwind"],
    summary: "Desenvolvedora especializada em React com forte experiência em e-commerce",
    avatar: "AS"
  },
  {
    id: "2", 
    name: "Carlos Oliveira",
    title: "Full Stack Developer",
    location: "Rio de Janeiro, RJ",
    experience: "6 anos",
    compatibility: 88,
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    summary: "Desenvolvedor full stack com experiência em projetos de grande escala",
    avatar: "CO"
  },
  {
    id: "3",
    name: "Mariana Costa",
    title: "Frontend Developer",
    location: "Belo Horizonte, MG", 
    experience: "3 anos",
    compatibility: 82,
    skills: ["React", "Vue.js", "JavaScript", "CSS"],
    summary: "Desenvolvedora frontend focada em UX e performance",
    avatar: "MC"
  }
];

export const CandidateResults = () => {
  return (
    <Card className="w-96 h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Star className="w-5 h-5 mr-2 text-primary" />
          Melhores Matches
        </h3>
        <p className="text-sm text-muted-foreground">
          {mockCandidates.length} candidatos encontrados
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockCandidates.map((candidate, index) => (
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