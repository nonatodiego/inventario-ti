#!/bin/bash

# 🚀 Script de Deploy Rápido - Inventário de TI com SQLite
# Uso: bash deploy-sqlite.sh

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🚀 Deploy do Inventário de TI com SQLite             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script no diretório raiz do projeto"
    exit 1
fi

# Passo 1: Instalar dependências
echo -e "${YELLOW}📦 Passo 1: Instalando dependências...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

# Passo 2: Criar banco de dados
echo -e "${YELLOW}🗄️  Passo 2: Criando banco de dados SQLite...${NC}"
pnpm db:push
echo -e "${GREEN}✓ Banco de dados criado${NC}"
echo ""

# Passo 3: Build de produção
echo -e "${YELLOW}🔨 Passo 3: Fazendo build de produção...${NC}"
pnpm build
echo -e "${GREEN}✓ Build concluído${NC}"
echo ""

# Passo 4: Configurar systemd
echo -e "${YELLOW}⚙️  Passo 4: Configurando serviço systemd...${NC}"

SERVICE_FILE="/etc/systemd/system/inventario-ti.service"
CURRENT_DIR=$(pwd)

# Verificar se precisa de sudo
if [ ! -w "/etc/systemd/system" ]; then
    echo "Requer permissões de sudo para criar serviço systemd"
    sudo bash -c "cat > $SERVICE_FILE << 'EOF'
[Unit]
Description=Inventário de TI - Sistema de Gestão de Ativos
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$CURRENT_DIR
Environment=\"NODE_ENV=production\"
Environment=\"PORT=8080\"
ExecStart=$(which pnpm) start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF"
    
    sudo systemctl daemon-reload
    sudo systemctl enable inventario-ti.service
    echo -e "${GREEN}✓ Serviço systemd configurado${NC}"
else
    cat > $SERVICE_FILE << EOF
[Unit]
Description=Inventário de TI - Sistema de Gestão de Ativos
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$CURRENT_DIR
Environment="NODE_ENV=production"
Environment="PORT=8080"
ExecStart=$(which pnpm) start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable inventario-ti.service
    echo -e "${GREEN}✓ Serviço systemd configurado${NC}"
fi
echo ""

# Passo 5: Liberar porta no firewall
echo -e "${YELLOW}🔥 Passo 5: Liberando porta 8080 no firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 8080/tcp
    sudo ufw reload
    echo -e "${GREEN}✓ Porta 8080 liberada${NC}"
else
    echo -e "${YELLOW}⚠️  UFW não encontrado, pulando configuração de firewall${NC}"
fi
echo ""

# Passo 6: Iniciar serviço
echo -e "${YELLOW}🚀 Passo 6: Iniciando serviço...${NC}"
if [ -w "/etc/systemd/system" ]; then
    systemctl start inventario-ti.service
    sleep 2
    systemctl status inventario-ti.service
else
    sudo systemctl start inventario-ti.service
    sleep 2
    sudo systemctl status inventario-ti.service
fi
echo -e "${GREEN}✓ Serviço iniciado${NC}"
echo ""

# Resumo final
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ Deploy Concluído com Sucesso!                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 Informações:${NC}"
echo "  • Banco de dados: $CURRENT_DIR/sqlite.db"
echo "  • Porta: 8080"
echo "  • URL: http://localhost:8080"
echo ""
echo -e "${GREEN}📝 Comandos Úteis:${NC}"
echo "  • Ver status: sudo systemctl status inventario-ti.service"
echo "  • Ver logs: sudo journalctl -u inventario-ti.service -f"
echo "  • Reiniciar: sudo systemctl restart inventario-ti.service"
echo "  • Parar: sudo systemctl stop inventario-ti.service"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo "  1. Abra http://IP_DA_VM:8080 no navegador"
echo "  2. Comece a usar o sistema!"
echo "  3. Configure backup automático do sqlite.db"
echo ""
