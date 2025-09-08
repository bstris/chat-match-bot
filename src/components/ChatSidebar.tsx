import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Clock } from "lucide-react";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

const mockHistory: ChatHistory[] = [
  {
    id: "1",
    title: "Desenvolvedor Frontend",
    timestamp: "2 min atrás",
    preview: "Procuro alguém com React e TypeScript..."
  },
  {
    id: "2", 
    title: "Designer UX/UI",
    timestamp: "1 hora atrás",
    preview: "Preciso de um designer com Figma..."
  },
  {
    id: "3",
    title: "Analista de Dados",
    timestamp: "Ontem",
    preview: "Busco profissional com Python..."
  }
];

export const ChatSidebar = () => {
  return (
    <Card className="w-80 h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Histórico
        </h3>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {mockHistory.map((chat) => (
              <Card 
                key={chat.id}
                className="p-3 cursor-pointer hover:bg-secondary/50 transition-colors border-border bg-gradient-card"
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {chat.timestamp}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};