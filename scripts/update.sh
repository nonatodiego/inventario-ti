#!/bin/bash

# Inventário de TI - Update Script
# Este script atualiza a aplicação já deployada

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
PROJECT_PATH="/opt/inventario-ti"
BACKUP_PATH="/opt/inventario-ti-backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}=== Inventário de TI - Update Script ===${NC}\n"

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se o projeto existe
if [ ! -d "$PROJECT_PATH" ]; then
  log_error "Projeto não encontrado em $PROJECT_PATH"
  exit 1
fi

log_info "Projeto encontrado em $PROJECT_PATH"

# 2. Fazer backup
log_info "Criando backup..."

sudo cp -r "$PROJECT_PATH" "$BACKUP_PATH"
log_info "Backup criado em $BACKUP_PATH"

# 3. Parar o serviço
log_info "Parando o serviço..."

sudo systemctl stop inventario-ti.service
log_info "Serviço parado"

# 4. Copiar novos arquivos
log_info "Atualizando arquivos..."

sudo cp package.json "$PROJECT_PATH/"
sudo cp pnpm-lock.yaml "$PROJECT_PATH/" 2>/dev/null || true
sudo cp -r dist "$PROJECT_PATH/" 2>/dev/null || true
sudo cp -r drizzle "$PROJECT_PATH/" 2>/dev/null || true

# 5. Instalar dependências
log_info "Instalando dependências..."

cd "$PROJECT_PATH"
sudo pnpm install --prod --frozen-lockfile 2>/dev/null || {
  log_warn "Instalação com pnpm falhou, tentando npm..."
  sudo npm ci --production
}

# 6. Reiniciar o serviço
log_info "Reiniciando o serviço..."

sudo systemctl start inventario-ti.service

# Aguardar um pouco para o serviço iniciar
sleep 2

# 7. Verificar status
if sudo systemctl is-active --quiet inventario-ti.service; then
  log_info "Serviço reiniciado com sucesso!"
  echo ""
  log_info "=== Update Concluído com Sucesso ==="
  echo ""
  echo "Backup anterior salvo em: $BACKUP_PATH"
  echo "Para reverter, execute: sudo cp -r $BACKUP_PATH/* $PROJECT_PATH/"
  echo ""
else
  log_error "Serviço não reiniciou corretamente"
  log_error "Revertendo para backup anterior..."
  
  sudo systemctl stop inventario-ti.service 2>/dev/null || true
  sudo rm -rf "$PROJECT_PATH"
  sudo cp -r "$BACKUP_PATH" "$PROJECT_PATH"
  sudo systemctl start inventario-ti.service
  
  log_error "Revertido para versão anterior"
  exit 1
fi
