import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, ExternalLink, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { motion, AnimatePresence } from "framer-motion";

export const BestMatchesPanel = () => {
  const { favorites, removeFavorite } = useFavorites();

  const handleRemoveFavorite = (sessionId: string, candidateIndex: number) => {
    removeFavorite(sessionId, candidateIndex);
  };

  return (
    <div className="w-80 h-full bg-card border border-border rounded-2xl flex flex-col overflow-hidden"
         style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="font-semibold text-foreground">Melhores Matches</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? 'candidato favoritado' : 'candidatos favoritados'}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Star className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Nenhum candidato favoritado ainda
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Clique na estrela dos cards para adicionar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((candidate, index) => (
                <motion.div
                  key={`${candidate.sessionId}_${candidate.candidateIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 bg-muted/30 hover:bg-muted/50 transition-colors group relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFavorite(candidate.sessionId, candidate.candidateIndex)}
                    >
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    </Button>

                    <div className="pr-6">
                      <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-1">
                        {candidate.nome}
                      </h4>
                      
                      {candidate.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                      )}
                      
                      {candidate.telefone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Phone className="w-3 h-3" />
                          <span>{candidate.telefone}</span>
                        </div>
                      )}
                      
                      {candidate.resumo && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {candidate.resumo}
                        </p>
                      )}
                      
                      {candidate.link && (
                        <a
                          href={candidate.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver perfil
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};
