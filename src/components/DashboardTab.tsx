import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, Star, Users, Award } from "lucide-react";
import { useEffect, useState } from "react";

interface Candidate {
  id: string;
  name: string;
  compatibility: number;
  skills?: string[];
}

interface Favorite {
  id: string;
  nome: string;
  compatibilidade: number;
}

interface DashboardTabProps {
  candidates: Candidate[];
  favorites: Favorite[];
}

export const DashboardTab = ({ candidates, favorites }: DashboardTabProps) => {
  const [metrics, setMetrics] = useState({
    totalCandidates: 0,
    totalFavorites: 0,
    avgCompatibility: 0,
    topCompatibility: 0,
  });

  const [compatibilityData, setCompatibilityData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    // Calcular métricas
    const totalCandidates = candidates.length;
    const totalFavorites = favorites.length;
    
    const allCompatibilities = [
      ...candidates.map(c => c.compatibility),
      ...favorites.map(f => f.compatibilidade || 0)
    ].filter(c => c > 0);

    const avgCompatibility = allCompatibilities.length > 0
      ? Math.round(allCompatibilities.reduce((a, b) => a + b, 0) / allCompatibilities.length)
      : 0;

    const topCompatibility = allCompatibilities.length > 0
      ? Math.max(...allCompatibilities)
      : 0;

    setMetrics({
      totalCandidates,
      totalFavorites,
      avgCompatibility,
      topCompatibility,
    });

    // Dados para gráfico de barras (top 5 candidatos por compatibilidade)
    const topCandidates = [...candidates]
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5)
      .map(c => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        compatibilidade: c.compatibility,
      }));

    setCompatibilityData(topCandidates);

    // Dados para gráfico de pizza (distribuição de compatibilidade)
    const ranges = [
      { name: '0-20%', count: 0, color: 'hsl(var(--destructive))' },
      { name: '21-40%', count: 0, color: 'hsl(var(--chart-1))' },
      { name: '41-60%', count: 0, color: 'hsl(var(--chart-2))' },
      { name: '61-80%', count: 0, color: 'hsl(var(--chart-3))' },
      { name: '81-100%', count: 0, color: 'hsl(var(--primary))' },
    ];

    allCompatibilities.forEach(comp => {
      if (comp <= 20) ranges[0].count++;
      else if (comp <= 40) ranges[1].count++;
      else if (comp <= 60) ranges[2].count++;
      else if (comp <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    setDistributionData(ranges.filter(r => r.count > 0));
  }, [candidates, favorites]);

  if (candidates.length === 0 && favorites.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível ainda</h3>
            <p className="text-sm text-muted-foreground">
              Realize buscas de candidatos para visualizar as métricas e gráficos aqui.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">📊 Dashboard de Favoritos</h2>
          <p className="text-sm text-muted-foreground">
            Análise e métricas dos candidatos encontrados
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalCandidates}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Candidatos encontrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalFavorites}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Candidatos favoritados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compatibilidade Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgCompatibility}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Média geral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Melhor Match</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.topCompatibility}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Maior compatibilidade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras - Top Candidatos */}
          {compatibilityData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Candidatos por Compatibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={compatibilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="compatibilidade" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Pizza - Distribuição */}
          {distributionData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição de Compatibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Linha do Tempo - Se houver dados suficientes */}
        {candidates.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de Candidatos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart 
                  data={candidates.slice(-10).map((c, idx) => ({
                    index: idx + 1,
                    compatibilidade: c.compatibility
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="index" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Ordem de busca', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compatibilidade" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
