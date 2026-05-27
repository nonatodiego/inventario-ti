#!/bin/bash

# Setup script for inventario-ti on VM
# This script initializes the database and prepares the application

set -e

echo "🚀 Iniciando setup do Inventário de TI..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Install dependencies
echo "📦 Instalando dependências..."
pnpm install

# Run database migrations
echo "🗄️  Inicializando banco de dados..."
pnpm db:push

# Build the project
echo "🔨 Fazendo build do projeto..."
pnpm build

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Inicie o servidor: npm start"
echo "2. Acesse em: http://seu-ip:4000"
echo ""
echo "💾 Banco de dados: /opt/inventario-ti/sqlite.db"
echo ""
