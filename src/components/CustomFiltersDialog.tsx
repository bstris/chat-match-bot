import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, X } from "lucide-react";

interface FilterCriterion {
  field: string;
  operator: string;
  value: string;
}

interface CustomFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilterSaved: () => void;
}

export function CustomFiltersDialog({ open, onOpenChange, onFilterSaved }: CustomFiltersDialogProps) {
  const [filterName, setFilterName] = useState("");
  const [criteria, setCriteria] = useState<FilterCriterion[]>([
    { field: "experiencia", operator: ">", value: "" }
  ]);
  const [saving, setSaving] = useState(false);

  const addCriterion = () => {
    setCriteria([...criteria, { field: "experiencia", operator: "=", value: "" }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, updates: Partial<FilterCriterion>) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], ...updates };
    setCriteria(newCriteria);
  };

  const handleSave = async () => {
    if (!filterName.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, dê um nome ao filtro.",
        variant: "destructive",
      });
      return;
    }

    if (criteria.some(c => !c.value.trim())) {
      toast({
        title: "Erro",
        description: "Preencha todos os valores dos critérios.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('filtros_personalizados' as any)
        .insert({
          recrutador_id: user.id,
          nome: filterName,
          criterios: criteria
        });

      if (error) throw error;

      toast({
        title: "Filtro salvo!",
        description: "Seu filtro personalizado foi salvo com sucesso.",
      });

      setFilterName("");
      setCriteria([{ field: "experiencia", operator: ">", value: "" }]);
      onOpenChange(false);
      onFilterSaved();
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o filtro.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Filtro Personalizado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filterName">Nome do Filtro</Label>
            <Input
              id="filterName"
              placeholder="Ex: Sênior SP com MEC"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Critérios</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCriterion}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Critério
              </Button>
            </div>

            {criteria.map((criterion, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Campo</Label>
                  <Select
                    value={criterion.field}
                    onValueChange={(value) => updateCriterion(index, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experiencia">Experiência (anos)</SelectItem>
                      <SelectItem value="localizacao">Localização</SelectItem>
                      <SelectItem value="skills">Skills</SelectItem>
                      <SelectItem value="formacao">Formação</SelectItem>
                      <SelectItem value="mec_valido">Válido no MEC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Operador</Label>
                  <Select
                    value={criterion.operator}
                    onValueChange={(value) => updateCriterion(index, { operator: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value=">">{'>'}</SelectItem>
                      <SelectItem value="<">{'<'}</SelectItem>
                      <SelectItem value="contém">contém</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label>Valor</Label>
                  <Input
                    placeholder="Valor"
                    value={criterion.value}
                    onChange={(e) => updateCriterion(index, { value: e.target.value })}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCriterion(index)}
                  disabled={criteria.length === 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Filtro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
