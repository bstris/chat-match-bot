import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface MecInstitution {
  id: string;
  codigo_ies: string;
  nome_ies: string;
  sigla_ies: string;
  uf: string;
  municipio: string;
  categoria_administrativa: string;
  organizacao_academica: string;
  cursos: any[];
}

export default function MecData() {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<MecInstitution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<MecInstitution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'faculdade' | 'curso'>('faculdade');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [searchTerm, searchType, institutions]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mec_instituicoes' as any)
        .select('*')
        .order('nome_ies');

      if (error) throw error;

      if (data) {
        setInstitutions(data as any);
        setFilteredInstitutions(data as any);
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do MEC.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInstitutions = () => {
    if (!searchTerm.trim()) {
      setFilteredInstitutions(institutions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = institutions.filter(inst => {
      if (searchType === 'faculdade') {
        return inst.nome_ies?.toLowerCase().includes(term) ||
               inst.sigla_ies?.toLowerCase().includes(term);
      } else {
        // Buscar em cursos
        return inst.cursos?.some((curso: any) => 
          curso.nome_curso?.toLowerCase().includes(term)
        );
      }
    });

    setFilteredInstitutions(filtered);
  };

  const exportToJson = () => {
    const dataStr = JSON.stringify(filteredInstitutions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `mec_instituicoes_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Exportado!",
      description: `${filteredInstitutions.length} instituições exportadas com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Dados MEC - Instituições de Ensino
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Consulte e exporte informações sobre instituições cadastradas no MEC
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={searchType === 'faculdade' ? "Buscar por nome ou sigla da faculdade..." : "Buscar por nome do curso..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={searchType === 'faculdade' ? 'default' : 'outline'}
                onClick={() => setSearchType('faculdade')}
              >
                Por Faculdade
              </Button>
              <Button
                variant={searchType === 'curso' ? 'default' : 'outline'}
                onClick={() => setSearchType('curso')}
              >
                Por Curso
              </Button>
            </div>

            <Button
              onClick={exportToJson}
              variant="outline"
              className="gap-2"
              disabled={filteredInstitutions.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {loading ? "Carregando..." : `${filteredInstitutions.length} instituições encontradas`}
          </p>
        </Card>

        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid gap-4">
            {filteredInstitutions.map((inst) => (
              <Card key={inst.id} className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {inst.nome_ies}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Código:</span> {inst.codigo_ies}</p>
                      <p><span className="text-muted-foreground">Sigla:</span> {inst.sigla_ies}</p>
                      <p><span className="text-muted-foreground">UF:</span> {inst.uf}</p>
                      <p><span className="text-muted-foreground">Município:</span> {inst.municipio}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Categoria:</span> {inst.categoria_administrativa}</p>
                      <p><span className="text-muted-foreground">Organização:</span> {inst.organizacao_academica}</p>
                      {inst.cursos && inst.cursos.length > 0 && (
                        <p className="mt-2">
                          <span className="text-muted-foreground">Cursos cadastrados:</span> {inst.cursos.length}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
