#!/bin/bash

# Inventário de TI - Deployment Script
# Este script prepara e deploya a aplicação em uma VM Ubuntu

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
PROJECT_NAME="inventario-ti"
PROJECT_PATH="/opt/inventario-ti"
APP_PORT="${APP_PORT:-3000}"
NODE_ENV="production"

echo -e "${GREEN}=== Inventário de TI - Deployment Script ===${NC}\n"

# Função para exibir mensagens
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar pré-requisitos
log_info "Verificando pré-requisitos..."

if ! command -v node &> /dev/null; then
  log_error "Node.js não está instalado"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  log_error "pnpm não está instalado"
  exit 1
fi

log_info "Node.js: $(node --version)"
log_info "pnpm: $(pnpm --version)"

# 2. Criar diretório de aplicação se não existir
log_info "Preparando diretório de aplicação..."

if [ ! -d "$PROJECT_PATH" ]; then
  sudo mkdir -p "$PROJECT_PATH"
  log_info "Diretório criado: $PROJECT_PATH"
fi

# 3. Copiar arquivos
log_info "Copiando arquivos da aplicação..."

# Copiar package.json e pnpm-lock.yaml
sudo cp package.json "$PROJECT_PATH/"
sudo cp pnpm-lock.yaml "$PROJECT_PATH/" 2>/dev/null || log_warn "pnpm-lock.yaml não encontrado"

# Copiar diretórios necessários
sudo cp -r dist "$PROJECT_PATH/" 2>/dev/null || log_warn "Diretório dist não encontrado"
sudo cp -r drizzle "$PROJECT_PATH/" 2>/dev/null || log_warn "Diretório drizzle não encontrado"
sudo cp -r public "$PROJECT_PATH/" 2>/dev/null || log_warn "Diretório public não encontrado"

# Copiar arquivo .env se existir
if [ -f ".env.production" ]; then
  sudo cp .env.production "$PROJECT_PATH/.env"
  log_info "Arquivo .env copiado"
else
  log_warn ".env.production não encontrado - você precisará configurar as variáveis de ambiente"
fi

# 4. Instalar dependências
log_info "Instalando dependências..."

cd "$PROJECT_PATH"

# Instalar apenas dependências de produção
sudo pnpm install --prod --frozen-lockfile 2>/dev/null || {
  log_warn "Instalação com pnpm falhou, tentando npm..."
  sudo npm ci --production
}

# 5. Aplicar migrations do banco de dados
log_info "Aplicando migrations do banco de dados..."

if [ -f "dist/index.js" ]; then
  # As migrations serão aplicadas automaticamente na primeira execução
  log_info "Migrations serão aplicadas na primeira execução"
else
  log_warn "Arquivo dist/index.js não encontrado"
fi

# 6. Definir permissões
log_info "Definindo permissões..."

sudo chown -R nobody:nogroup "$PROJECT_PATH"
sudo chmod -R 755 "$PROJECT_PATH"

# 7. Criar arquivo de configuração do systemd
log_info "Criando serviço systemd..."

sudo tee /etc/systemd/system/inventario-ti.service > /dev/null <<EOF
[Unit]
Description=Inventário de TI - Aplicação Node.js
After=network.target

[Service]
Type=simple
User=nobody
WorkingDirectory=$PROJECT_PATH
Environment="NODE_ENV=$NODE_ENV"
Environment="PORT=$APP_PORT"
ExecStart=$(which node) dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

log_info "Serviço criado: /etc/systemd/system/inventario-ti.service"

# 8. Recarregar systemd e iniciar serviço
log_info "Iniciando serviço..."

sudo systemctl daemon-reload
sudo systemctl enable inventario-ti.service
sudo systemctl start inventario-ti.service

# Aguardar um pouco para o serviço iniciar
sleep 2

# 9. Verificar status
log_info "Verificando status do serviço..."

if sudo systemctl is-active --quiet inventario-ti.service; then
  log_info "Serviço iniciado com sucesso!"
  log_info "Status: $(sudo systemctl status inventario-ti.service --no-pager | grep Active)"
else
  log_error "Serviço não iniciou corretamente"
  log_error "Logs: $(sudo journalctl -u inventario-ti.service -n 20 --no-pager)"
  exit 1
fi

# 10. Exibir informações finais
echo ""
log_info "=== Deployment Concluído com Sucesso ==="
echo ""
echo "Aplicação: $PROJECT_NAME"
echo "Diretório: $PROJECT_PATH"
echo "Porta: $APP_PORT"
echo "Ambiente: $NODE_ENV"
echo ""
echo "Comandos úteis:"
echo "  Ver logs:     sudo journalctl -u inventario-ti.service -f"
echo "  Status:       sudo systemctl status inventario-ti.service"
echo "  Reiniciar:    sudo systemctl restart inventario-ti.service"
echo "  Parar:        sudo systemctl stop inventario-ti.service"
echo ""
