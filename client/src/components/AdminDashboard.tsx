import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader } from 'lucide-react';

export function AdminDashboard() {
  const { data: stats, isLoading } = trpc.systems.getStatistics.useQuery();

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Carregando estatísticas...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total de Sistemas */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total de Sistemas</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.totalSystems || 0}
            </p>
          </div>
          <div className="text-4xl">🖥️</div>
        </div>
      </Card>

      {/* Total de Perfis */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total de Perfis</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.totalProfiles || 0}
            </p>
          </div>
          <div className="text-4xl">👤</div>
        </div>
      </Card>

      {/* Colaboradores com Acesso */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Colaboradores com Acesso</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.totalCollaboratorsWithAccess || 0}
            </p>
          </div>
          <div className="text-4xl">👥</div>
        </div>
      </Card>

      {/* Taxa de Utilização */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Taxa de Utilização</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.totalSystems && stats?.totalCollaboratorsWithAccess
                ? Math.round((stats.totalCollaboratorsWithAccess / (stats.totalSystems * 5)) * 100)
                : 0}
              %
            </p>
          </div>
          <div className="text-4xl">📈</div>
        </div>
      </Card>

      {/* Sistemas Mais Utilizados */}
      <Card className="p-6 md:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistemas Mais Utilizados</h3>
        {stats?.systemsWithMostAccess && stats.systemsWithMostAccess.length > 0 ? (
          <div className="space-y-3">
            {stats.systemsWithMostAccess.map((system, index) => (
              <div key={system.systemId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium">{system.systemName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${Math.min(
                          (system.accessCount /
                            (stats.systemsWithMostAccess[0]?.accessCount || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-600 text-sm font-medium w-12 text-right">
                    {system.accessCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Nenhum sistema com acessos registrados
          </p>
        )}
      </Card>
    </div>
  );
}
