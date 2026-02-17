# Korea Festival App - Project Rules

> 이 문서는 모든 Claude Code 세션에서 **반드시** 준수해야 하는 프로젝트 규칙입니다.

---

## Project Spec

- **이름**: Korea Travel Map (한국 관광 정보 지도 앱)
- **목적**: 한국 관광지를 인터랙티브 지도에서 탐색하는 반응형 웹앱
- **배포**: Vercel (https://korea-travel-map.vercel.app)
- **최우선 가치**: **Performance** (LCP < 2.5s, 60fps 지도 인터랙션)

### Tech Stack

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS (`@theme inline`) | 4.x |
| Map | react-map-gl + MapLibre GL JS | 8.x / 5.x |
| Tile Server | OpenFreeMap positron | - (API 키 불필요) |
| i18n | next-intl | 4.x |
| Search | Fuse.js + cmdk | 7.x / 1.x |
| Test | Vitest + Testing Library | 4.x |
| Deploy | Vercel | - |

### Architecture

- **Static-First**: `src/data/` 하위 JSON 파일로 모든 데이터 관리 (Zero-API)
- **URL as State**: URL search params가 필터 상태의 single source of truth
- **SSR: false 패턴**: Server Component → MapShellLoader (client) → MapShell (dynamic, ssr: false)
- **i18n**: `localePrefix: "always"`, ko/en 2개 로케일

---

## 필수 규칙 (Mandatory Rules)

### 1. Git 워크플로우 - CHANGELOG & README 업데이트

> `/jm-git`을 통해 git push/PR/merge를 요청할 때 **반드시** 아래 순서를 따른다.

1. **CHANGELOG.md 업데이트**: 변경사항을 `CHANGELOG.md`에 기록
   - `[Unreleased]` 섹션에 변경사항 추가
   - 카테고리: `Added`, `Changed`, `Fixed`, `Removed`, `Performance`, `Security`
   - 형식: [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 준수
2. **README.md 업데이트**: CHANGELOG에 기록된 변경사항이 README에 영향을 미치는 경우 반드시 반영
   - 새 기능 추가 → Features 섹션 업데이트
   - 기술 스택 변경 → Tech Stack 섹션 업데이트
   - 환경변수 추가 → Getting Started 섹션 업데이트
   - API 변경 → API Routes 섹션 업데이트
3. **Git 커밋 & PR**: 그 다음에 `/jm-git` 실행

### 2. Performance First

모든 코드 변경에서 성능을 최우선으로 고려한다.

- **번들 크기**: 불필요한 패키지 추가 금지. 새 의존성 추가 시 번들 사이즈 영향 확인
- **렌더링 최적화**: `useMemo`, `useCallback`을 적절히 사용하되 과도한 최적화 금지
- **이미지 최적화**: `next/image` 사용, WebP/AVIF 포맷 우선
- **코드 분할**: 지도 컴포넌트는 반드시 `dynamic import + ssr: false`
- **Core Web Vitals 목표**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - INP < 200ms

### 3. Vercel 배포 고려사항

- **빌드 성공 확인**: `npm run build`가 에러 없이 완료되는지 확인
- **정적 페이지**: `generateStaticParams()`로 모든 동적 라우트 정적 생성
- **Edge 호환**: `src/proxy.ts`는 Edge Runtime에서 실행됨
- **환경변수**: `NEXT_PUBLIC_` prefix가 없는 변수는 서버에서만 접근 가능
- **Vercel Body Limit**: API Route 응답 크기 4.5MB 제한 주의

### 4. 코드 컨벤션

- **임포트 경로**: `@/*` alias 사용 (`./src/*`로 매핑)
- **react-map-gl**: 반드시 `react-map-gl/maplibre`에서 import
- **CSS**: `.maplibregl-*` prefix 사용 (`.mapboxgl-*` 아님)
- **파일 확장자**: GeoJSON은 `.geo.json` 사용 (Turbopack 호환)
- **프록시**: `src/proxy.ts` 사용 (`middleware.ts` 사용 금지 - HMR 루프 발생)
- **데이터 파일**: `src/data/` 하위에 locale별 분리 (`pois_kr.json`, `pois_en.json`)
- **컴포넌트 구조**: Server Component → Client Component 경계를 명확히 분리
- **타입**: `src/types/` 하위에 도메인별 타입 정의

### 5. 테스트

- `npm run test` (Vitest)로 테스트 실행
- 새 유틸리티/훅 추가 시 테스트 작성 권장
- 테스트 파일: `src/**/*.test.{ts,tsx}`

---

## 금지 사항 (Do NOT)

- **`.env*` 파일 읽기/접근 절대 금지**: `.env`, `.env.local`, `.env.production` 등 `.env`로 시작하는 모든 파일을 Read, Bash(cat), 또는 어떤 방법으로든 읽거나 내용을 확인하지 않는다. 환경변수가 필요한 경우 변수 **이름**만 참조하고, **값**은 절대 읽지 않는다.
- `middleware.ts` 파일 생성/수정 금지 (Turbopack HMR 루프)
- `react-map-gl` 또는 `react-map-gl/mapbox`에서 직접 import 금지
- `.geojson` 확장자 파일 생성 금지
- `NEXT_PUBLIC_MAPBOX_TOKEN` 환경변수 사용 금지 (MapLibre 사용 중)
- 글로벌 상태 관리 라이브러리 (Redux, Zustand 등) 도입 금지 (URL params 사용)
- `window`/`document` 직접 접근하는 코드를 Server Component에 작성 금지

---

## 주요 파일 경로

| 역할 | 경로 |
|------|------|
| 메인 페이지 | `src/app/[locale]/page.tsx` |
| 상세 페이지 | `src/app/[locale]/spots/[slug]/page.tsx` |
| 맵 셸 | `src/components/map/MapShell.tsx` |
| 맵 로더 | `src/components/map/MapShellLoader.tsx` |
| 프록시 | `src/proxy.ts` |
| i18n 라우팅 | `src/i18n/routing.ts` |
| 데이터 (KR) | `src/data/pois_kr.json`, `src/data/pois_geo_kr.json` |
| 데이터 (EN) | `src/data/pois_en.json`, `src/data/pois_geo_en.json` |
| 번역 파일 | `messages/ko.json`, `messages/en.json` |
| 지역 데이터 | `src/data/regions.json` |
