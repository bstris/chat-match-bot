import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

interface ChatHistory {
  session_id: string;
  title: string;
  timestamp: string;
  rawTimestamp: string | number;
  preview: string;
}

interface ChatSidebarProps {
  onSelectChat?: (sessionId?: string) => void;
  currentSessionId?: string;
}

export const ChatSidebar = ({ onSelectChat, currentSessionId }: ChatSidebarProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('session_id, message, id')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        // Agrupar por session_id e pegar a PRIMEIRA mensagem de cada sessão (mais antiga)
        const sessions = new Map();
        
        // Processar em ordem reversa para pegar a primeira mensagem
        const reversedData = [...data].reverse();
        
        reversedData.forEach((record: any) => {
          if (!sessions.has(record.session_id)) {
            const content = record.message?.content || '';
            const messageTimestamp = record.message?.timestamp;
            const sessionNumber = record.session_id.split('_')[1] || Math.floor(Math.random() * 1000);
            
            // Criar timestamp fixo baseado na primeira mensagem da sessão
            const fixedTimestamp = messageTimestamp 
              ? new Date(messageTimestamp).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
              : new Date().toLocaleString('pt-BR');
            
            sessions.set(record.session_id, {
              session_id: record.session_id,
              title: content.length > 30 ? content.substring(0, 30) + '...' : (content || `Consulta #${sessionNumber}`),
              timestamp: fixedTimestamp,
              rawTimestamp: messageTimestamp || Date.now(),
              preview: content.length > 50 ? content.substring(0, 50) + '...' : (content || 'Nova consulta iniciada')
            });
          }
        });

        // Ordenar por rawTimestamp mais recente
        const sortedSessions = Array.from(sessions.values())
          .sort((a, b) => {
            const timeA = typeof a.rawTimestamp === 'string' ? new Date(a.rawTimestamp).getTime() : a.rawTimestamp;
            const timeB = typeof b.rawTimestamp === 'string' ? new Date(b.rawTimestamp).getTime() : b.rawTimestamp;
            return timeB - timeA;
          })
          .slice(0, 15); // Mostrar últimas 15 conversas

        // Atualizar apenas se houver mudanças reais
        setChatHistory(prev => {
          const prevJson = JSON.stringify(prev);
          const newJson = JSON.stringify(sortedSessions);
          return prevJson === newJson ? prev : sortedSessions;
        });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const deleteChat = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .eq('session_id', sessionId);

      if (error) throw error;
      
      // Atualizar o estado local removendo a conversa
      setChatHistory(prev => prev.filter(chat => chat.session_id !== sessionId));
      
      // Se a conversa deletada era a atual, limpar seleção
      if (currentSessionId === sessionId) {
        onSelectChat?.(undefined);
      }

      toast({
        title: "Histórico apagado",
        description: "A conversa foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      toast({
        title: "Erro ao apagar",
        description: "Não foi possível remover a conversa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const clearAllHistory = async () => {
    try {
      const { error } = await supabase
        .from('n8n_chat_histories')
        .delete()
        .neq('id', 0); // Deletar todos os registros

      if (error) throw error;
      
      setChatHistory([]);
      onSelectChat?.(undefined);

      toast({
        title: "Histórico limpo",
        description: "Todas as conversas foram removidas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast({
        title: "Erro ao limpar",
        description: "Não foi possível limpar o histórico. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  // Função para recarregar o histórico (chamada quando uma nova sessão é criada)
  const refreshHistory = () => {
    loadChatHistory();
  };

  // Atualizar histórico periodicamente apenas se houver sessão ativa
  useEffect(() => {
    const interval = setInterval(() => {
      loadChatHistory();
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-80 h-full bg-card border border-border rounded-2xl flex flex-col overflow-hidden"
         style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="p-6 border-b border-border">
        <Button
          onClick={() => {
            onSelectChat?.(undefined); // Sinaliza para criar nova sessão
          }}
          className="w-full bg-primary hover:bg-primary/90 rounded-2xl mb-4 transition-all duration-200"
          style={{ boxShadow: 'var(--shadow-minimal)' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">Histórico</h3>
          {chatHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Limpar todo o histórico
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir todas as conversas? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearAllHistory}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {chatHistory.map((chat) => (
            <div
              key={chat.session_id}
              className={`group relative p-4 cursor-pointer transition-all duration-300 rounded-2xl animate-in fade-in slide-in-from-top-2 ${
                currentSessionId === chat.session_id
                  ? 'bg-primary/5 ring-1 ring-primary/20'
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
              style={{ boxShadow: 'var(--shadow-minimal)' }}
              onClick={() => onSelectChat?.(chat.session_id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      {chat.timestamp}
                    </p>
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteChat(chat.session_id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};