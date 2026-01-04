# Shorter · Next.js 简易短链

单一服务（Next.js）+ React UI，使用本地 JSON 存储短链映射，并提供单一密钥认证的 CRUD 界面。

## 准备

1) 安装依赖

```bash
npm install
```

2) 配置密钥：复制 `.env.example` 为 `.env.local` 并修改值

```bash
cp .env.example .env.local
# 编辑 AUTH_KEY=your-secret
```

3) 运行

```bash
npm run dev   # 开发
# 或
npm run build && npm start  # 生产
```

打开 <http://localhost:3000>，在页面顶部填入同样的 API Key 即可进行操作。

### Docker 运行

```bash
# 构建镜像
docker build -t shorter .

# 直接运行（挂载数据目录）
docker run -p 3000:3000 -e AUTH_KEY=your-secret -v $(pwd)/data:/app/data shorter

# 或使用 compose
AUTH_KEY=your-secret docker compose up --build
```

## 功能

- 创建短链（可选自定义 slug）。
- 更新指定 slug 的目标链接。
- 删除指定 slug。
- 列表展示与一键复制短链。
- 访问 `/{slug}` 即可重定向到原始链接（无需密钥）。

## API（需 `x-api-key` = `AUTH_KEY`）

- `GET /api/links` — 列表
- `POST /api/links` — 创建，body: `{ url, slug? }`
- `PUT /api/links` — 更新，body: `{ slug, url }`
- `DELETE /api/links` — 删除，body: `{ slug }`

## 数据存储

- 文件：`data/links.json`
- 服务启动时自动创建/加载，无需外部数据库。
