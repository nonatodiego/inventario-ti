#!/bin/bash

# Setup Production Environment Script
# Este script configura o ambiente de produção na VM Ubuntu

set -e

echo "=========================================="
echo "🚀 Setup de Produção - Inventário de TI"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Este script deve ser executado como root (use sudo)${NC}"
   exit 1
fi

# Definir variáveis
APP_DIR="/opt/inventario-ti"
APP_USER="inventario"
APP_PORT="4000"
NODE_ENV="production"

echo -e "${YELLOW}Passo 1: Atualizando sistema...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}Passo 2: Instalando dependências do sistema...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    npm

echo -e "${YELLOW}Passo 3: Instalando Node.js (v22)...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    apt-get install -y nodejs
else
    echo "Node.js já está instalado: $(node --version)"
fi

echo -e "${YELLOW}Passo 4: Instalando pnpm...${NC}"
npm install -g pnpm

echo -e "${YELLOW}Passo 5: Criando usuário de aplicação...${NC}"
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    echo "Usuário $APP_USER criado"
else
    echo "Usuário $APP_USER já existe"
fi

echo -e "${YELLOW}Passo 6: Criando diretório de aplicação...${NC}"
mkdir -p $APP_DIR
chown -R $APP_USER:$APP_USER $APP_DIR

echo -e "${YELLOW}Passo 7: Extraindo arquivos da aplicação...${NC}"
# Os arquivos devem estar em um arquivo .tar.gz
# Descomente a linha abaixo quando tiver o arquivo
# tar -xzf inventario-ti.tar.gz -C $APP_DIR

echo -e "${YELLOW}Passo 8: Instalando dependências da aplicação...${NC}"
cd $APP_DIR
sudo -u $APP_USER pnpm install --frozen-lockfile

echo -e "${YELLOW}Passo 9: Configurando variáveis de ambiente...${NC}"
if [ ! -f "$APP_DIR/.env.production" ]; then
    cat > "$APP_DIR/.env.production" << EOF
# Variáveis de Ambiente - Produção
NODE_ENV=production
PORT=$APP_PORT

# Banco de dados (configure com suas credenciais)
DATABASE_URL=mysql://user:password@localhost:3306/inventario_ti

# OAuth (configure com suas credenciais Manus)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT Secret (gere um novo com: openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Owner Info
OWNER_NAME=Administrator
OWNER_OPEN_ID=admin

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# App Info
VITE_APP_TITLE=Inventário de TI
VITE_APP_LOGO=https://example.com/logo.png
EOF
    echo -e "${GREEN}✓ Arquivo .env.production criado${NC}"
    echo -e "${RED}⚠️  IMPORTANTE: Edite $APP_DIR/.env.production com suas credenciais${NC}"
else
    echo "Arquivo .env.production já existe"
fi

echo -e "${YELLOW}Passo 10: Criando diretório de logs...${NC}"
mkdir -p $APP_DIR/logs
chown -R $APP_USER:$APP_USER $APP_DIR/logs

echo -e "${YELLOW}Passo 11: Configurando systemd service...${NC}"
cat > "/etc/systemd/system/inventario-ti.service" << EOF
[Unit]
Description=Inventário de TI - Application
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment="NODE_ENV=$NODE_ENV"
Environment="PORT=$APP_PORT"
EnvironmentFile=$APP_DIR/.env.production
ExecStart=/usr/bin/node $APP_DIR/dist/index.js
Restart=always
RestartSec=10
StandardOutput=append:$APP_DIR/logs/app.log
StandardError=append:$APP_DIR/logs/error.log
SyslogIdentifier=inventario-ti

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo -e "${GREEN}✓ Systemd service configurado${NC}"

echo -e "${YELLOW}Passo 12: Configurando Nginx como reverse proxy...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

cat > "/etc/nginx/sites-available/inventario-ti" << EOF
upstream inventario_ti {
    server 127.0.0.1:$APP_PORT;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 50M;

    location / {
        proxy_pass http://inventario_ti;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/inventario-ti /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
echo -e "${GREEN}✓ Nginx configurado${NC}"

echo -e "${YELLOW}Passo 13: Configurando firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${GREEN}✓ Firewall configurado${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Setup de produção concluído!"
echo "==========================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Edite as variáveis de ambiente:"
echo "   sudo nano $APP_DIR/.env.production"
echo ""
echo "2. Inicie o serviço:"
echo "   sudo systemctl start inventario-ti"
echo ""
echo "3. Ative o serviço para iniciar com o sistema:"
echo "   sudo systemctl enable inventario-ti"
echo ""
echo "4. Verifique o status:"
echo "   sudo systemctl status inventario-ti"
echo ""
echo "5. Visualize os logs:"
echo "   sudo tail -f $APP_DIR/logs/app.log"
echo ""
echo "A aplicação estará disponível em: http://seu-ip-ou-dominio"
echo ""
