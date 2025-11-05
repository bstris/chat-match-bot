import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { AICandidateCard } from "@/components/AICandidateCard";

export default function ChatFavorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, loading } = useFavorites();

  const handleRemoveFavorite = (sessionId: string, candidateIndex: number) => {
    removeFavorite(sessionId, candidateIndex);
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
                  Favoritos do Chat
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidatos favoritados das conversas com a IA
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
        <ScrollArea className="h-[calc(100vh-180px)]">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Carregando favoritos...</p>
            </Card>
          ) : favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhum favorito encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Comece favoritando candidatos nas conversas do chat
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite, index) => (
                <Card key={`${favorite.sessionId}-${favorite.candidateIndex}`} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveFavorite(favorite.sessionId, favorite.candidateIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="p-4 pr-12">
                    <AICandidateCard
                      content={`**${favorite.nome}**\n\n${favorite.resumo}\n\n${favorite.email ? `📧 ${favorite.email}` : ''}${favorite.telefone ? `\n📱 ${favorite.telefone}` : ''}${favorite.link ? `\n🔗 [LinkedIn](${favorite.link})` : ''}`}
                      candidateIndex={index}
                      onFavorite={() => {}}
                      isFavorited={true}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </div>
  );
}
