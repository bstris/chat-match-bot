import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  preview: string;
}

interface ChatSidebarProps {
  onSelectChat?: (sessionId?: string) => void;
  currentSessionId?: string;
}

export const ChatSidebar = ({ onSelectChat, currentSessionId }: ChatSidebarProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('session_id, message')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        // Agrupar por session_id e pegar a primeira mensagem de cada sessão
        const sessions = new Map();
        data.forEach((record: any) => {
          if (!sessions.has(record.session_id)) {
            const content = record.message?.content || '';
            sessions.set(record.session_id, {
              session_id: record.session_id,
              title: content.length > 30 ? content.substring(0, 30) + '...' : content,
              timestamp: new Date(record.message?.timestamp || Date.now()).toLocaleString('pt-BR'),
              preview: content.length > 50 ? content.substring(0, 50) + '...' : content
            });
          }
        });

        setChatHistory(Array.from(sessions.values()).slice(0, 10));
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
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
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
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };
  return (
    <div className="w-80 h-full bg-card border border-border rounded-2xl flex flex-col overflow-hidden"
         style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="p-6 border-b border-border">
        <Button
          onClick={() => onSelectChat?.(undefined)}
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
              className={`group relative p-4 cursor-pointer transition-all duration-200 rounded-2xl ${
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