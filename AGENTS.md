<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project info

- **What**: NBA 팀/팬 사이트 "NBA NIGHT NIGHT" (package name: `nba-teams`)
- **Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Turso(libSQL) via `@libsql/client`, bcryptjs + jose(인증)
- **Live site**: https://nbanightnight.onrender.com/ (Render 배포, 무료 플랜)
- **GitHub repo**: https://github.com/kgwabc/NBA.git (branch: master) — Render는 이 repo에 연결되어 GitHub push 시 자동 배포되는 것으로 추정됨 (Render 대시보드에서 연결 확인 필요)
- **Env vars** (로컬 `.env.local`에 있으며 Render 서비스 환경변수에도 동일하게 설정되어 있어야 함): `AUTH_SECRET`, `BALLDONTLIE_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- **DB 이력**: 원래 `better-sqlite3`로 `data/app.db`(로컬 디스크)에 저장했으나, Render 무료 플랜은 15분 유휴 시 슬립 후 재시작하면서 로컬 디스크가 초기화되어 로그인/회원가입/채팅 기록이 전부 사라지는 문제가 있었음. 이를 해결하기 위해 외부 영속 스토리지인 Turso(SQLite 호환)로 이전함(`lib/db.ts`). `TURSO_DATABASE_URL`이 없으면 로컬 개발 편의를 위해 `data/app.db` 파일로 폴백하지만, 이 폴백은 Render에서는 영속되지 않으므로 프로덕션에는 반드시 Turso 환경변수가 설정되어 있어야 함.
