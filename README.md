# X-Transcriber

シンプルな文字起こしツール

## Frontend

### Dev



```bash
sudo apt-get install -y nodejs
sudo apt install -y npm
```

Node.jssが20系以外で既に動いている場合、nvmを使用 (20系の場合はこの手順スキップ)
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash# 
source ~/.bashrc
nvm --version
cd frontend
nvm install 20
echo "20" > .nvmrc
nvm use
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```