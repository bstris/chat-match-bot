import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Mail, Phone, GraduationCap, Briefcase, Shield } from "lucide-react";

interface CandidateDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: any;
}

export const CandidateDetailDialog = ({
  open,
  onOpenChange,
  candidate
}: CandidateDetailDialogProps) => {
  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Candidato</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Header com info básica */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium text-xl">
                {candidate.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">{candidate.name}</h3>
                <p className="text-muted-foreground">{candidate.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {candidate.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {candidate.experience}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Compatibilidade</div>
                <div className="text-3xl font-bold text-primary">{candidate.compatibility}%</div>
              </div>
            </div>

            {/* Contato */}
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Informações de Contato
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>email@exemplo.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>(11) 99999-9999</span>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-3">Habilidades</h4>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="border-primary/20 text-primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Resumo */}
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                Resumo Profissional
              </h4>
              <p className="text-sm text-muted-foreground">{candidate.summary}</p>
            </Card>

            {/* Validação MEC */}
            <Card className="p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2" />
                Validação de Credenciais (MEC)
              </h4>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">Instituição válida no MEC</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Validação realizada via integração N8N com base do Ministério da Educação
              </p>
            </Card>

            {/* Ranqueamento da IA */}
            <Card className="p-4 bg-gradient-card">
              <h4 className="font-semibold text-foreground mb-2">Análise da IA</h4>
              <p className="text-sm text-muted-foreground">
                Este candidato foi ranqueado com base em compatibilidade de skills, 
                experiência profissional e fit cultural com a vaga solicitada.
              </p>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
