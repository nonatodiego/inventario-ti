#!/bin/bash

# Quick Deploy Script
# Executa o setup e inicia a aplicação

set -e

APP_DIR="/opt/inventario-ti"
APP_USER="inventario"

echo "🚀 Iniciando deploy rápido..."

# Verificar se arquivo .env.production existe
if [ ! -f "$APP_DIR/.env.production" ]; then
    echo "❌ Erro: Arquivo .env.production não encontrado em $APP_DIR"
    echo "Execute primeiro: sudo ./setup-production.sh"
    exit 1
fi

echo "📦 Construindo aplicação..."
cd $APP_DIR
sudo -u $APP_USER pnpm build

echo "🔄 Reiniciando serviço..."
sudo systemctl restart inventario-ti

echo "⏳ Aguardando aplicação iniciar..."
sleep 3

echo "✅ Deploy concluído!"
echo ""
echo "Status do serviço:"
sudo systemctl status inventario-ti --no-pager

echo ""
echo "Logs da aplicação:"
sudo tail -20 $APP_DIR/logs/app.log

echo ""
echo "Acesse a aplicação em: http://localhost:4000"
