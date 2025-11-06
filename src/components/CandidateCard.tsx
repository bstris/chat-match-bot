import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Heart, ExternalLink, LucideIcon } from "lucide-react";
import { useState } from "react";

interface CandidateCardProps {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  compatibility: number;
  skills: string[];
  summary: string;
  avatar: string;
  rank?: number;
  link?: string;
  onFavorite: (candidateId: string) => void;
  onViewDetails: (candidateId: string) => void;
  favoriteIcon?: LucideIcon;
  favoriteIconActive?: LucideIcon;
}

export const CandidateCard = ({
  id,
  name,
  title,
  location,
  experience,
  compatibility,
  skills,
  summary,
  avatar,
  rank,
  link,
  onFavorite,
  onViewDetails,
  favoriteIcon: FavoriteIcon = Heart,
  favoriteIconActive: FavoriteIconActive = Heart
}: CandidateCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite(id);
  };

  const IconComponent = isFavorited ? FavoriteIconActive : FavoriteIcon;

  return (
    <Card 
      className="p-4 cursor-pointer hover:bg-secondary/50 transition-all duration-300 border-border bg-gradient-card hover:shadow-glow shadow-card rounded-lg w-full max-w-[320px]"
      onClick={() => onViewDetails(id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium flex-shrink-0">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground truncate">{name}</h4>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                  title="Ver perfil completo"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {rank && (
            <Badge variant={rank === 1 ? "default" : "secondary"} className="text-xs">
              #{rank}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavoriteClick}
            className="h-8 w-8 p-0"
          >
            <IconComponent 
              className={`w-4 h-4 ${isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`}
            />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">Compatibilidade</span>
            <span className="text-sm font-bold text-primary whitespace-nowrap">{compatibility}%</span>
          </div>
          <Progress 
            value={compatibility} 
            className="h-2"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{experience}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-3">
          {summary}
        </p>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill) => (
              <Badge 
                key={skill} 
                variant="outline" 
                className="text-xs border-primary/20 text-primary"
              >
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
