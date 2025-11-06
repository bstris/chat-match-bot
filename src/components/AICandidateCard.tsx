import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface AICandidateCardProps {
  content: string;
  candidateIndex: number;
  onFavorite: (index: number, isFavorited: boolean) => void;
  isFavorited?: boolean;
  compatibility?: number;
}

export const AICandidateCard = ({ 
  content, 
  candidateIndex, 
  onFavorite,
  isFavorited = false,
  compatibility 
}: AICandidateCardProps) => {
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavoriteClick = () => {
    const newFavoritedState = !favorited;
    setFavorited(newFavoritedState);
    onFavorite(candidateIndex, newFavoritedState);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: candidateIndex * 0.1 }}
    >
      <Card className="bg-muted/30 shadow-sm p-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 p-1 h-auto hover:bg-transparent"
          onClick={handleFavoriteClick}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              favorited
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground hover:text-yellow-500"
            }`}
          />
        </Button>
        
        <div className="pr-8 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_a]:underline [&_a]:text-primary [&_a:hover]:text-primary/80 [&_strong]:text-foreground">
          <ReactMarkdown>
            {content}
          </ReactMarkdown>
        </div>
      </Card>
    </motion.div>
  );
};
