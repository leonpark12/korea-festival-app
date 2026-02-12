# Developer Onboarding Guide

새 개발자를 위한 프로젝트 셋업, 개발 워크플로우, 코드 컨벤션 안내.

---

## 프로젝트 소개

한국 관광지를 인터랙티브 지도에서 탐색하는 웹 앱.
MapLibre GL JS 기반 클러스터링 맵, 카테고리/지역 필터, 퍼지 검색, 한/영 다국어를 지원한다.

### 핵심 기술

| 기술 | 역할 |
|------|------|
| Next.js 16 (App Router) | 프레임워크, SSG, 라우팅 |
| TypeScript (strict) | 타입 시스템 |
| Tailwind CSS 4 | 스타일링 |
| react-map-gl 8 + MapLibre GL JS 5 | 인터랙티브 지도 |
| next-intl 4 | i18n (ko/en) |
| Fuse.js 7 | 클라이언트 퍼지 검색 |
| Vitest + Testing Library | 테스트 |

---

## 로컬 셋업

### 요구사항

- Node.js 20+
- npm 10+

### 설치 및 실행

```bash
# 저장소 클론
git clone <repo-url>
cd korea-festival-app

# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack)
npm run dev
# → http://localhost:3000 (자동으로 /ko 리다이렉트)
```

### 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Turbopack 개발 서버 (HMR) |
| `npm run build` | 프로덕션 빌드 (SSG) |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | Vitest 테스트 실행 |
| `npm run test:watch` | Vitest 워치 모드 |

### 환경 변수

`.env.local` (선택사항):

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

API 키는 필요하지 않음 (MapLibre + OpenFreeMap은 무료).

---

## 프로젝트 구조 빠른 참조

```
src/
├── app/              # Next.js App Router 페이지
│   └── [locale]/     # 로케일 동적 세그먼트
├── components/       # React 컴포넌트
│   ├── layout/       # Header, Logo, LocaleSwitcher
│   ├── map/          # MapShell, MapView, ClusterSource, POIPopup
│   ├── panel/        # SidePanel, BottomSheet, SearchBar, FilterChips
│   └── spot/         # SpotHero, SpotInfo, NearbySpots, SpotMiniMap
├── hooks/            # useQueryParams, useFilteredPOIs, usePOISearch 등
├── i18n/             # next-intl 설정 (routing, request, navigation)
├── lib/              # 유틸리티 (categories, regions, constants, data-loader)
├── data/             # 정적 JSON 데이터
├── types/            # TypeScript 타입 정의
└── proxy.ts          # Next.js 16 프록시 (i18n 리다이렉트)

messages/             # i18n 번역 파일 (ko.json, en.json)
```

---

## 핵심 개발 패턴

### 1. Server Component vs Client Component

```
Server Component (기본값):
  - app/[locale]/layout.tsx
  - app/[locale]/page.tsx
  - app/[locale]/spots/[slug]/page.tsx

Client Component ("use client"):
  - MapShellLoader.tsx → MapShell.tsx (메인 클라이언트 경계)
  - 모든 hooks
  - SearchBar, FilterChips, POICard 등 인터랙티브 컴포넌트
```

**원칙**: 가능한 한 Server Component로 유지하고, `window`/인터랙션이 필요한 곳만 `"use client"` 사용.

### 2. MapLibre 임포트 규칙

```typescript
// 반드시 이 경로에서 임포트
import Map from "react-map-gl/maplibre";
import { Marker, Popup, Source, Layer } from "react-map-gl/maplibre";

// 절대 하지 말 것
import Map from "react-map-gl";         // Mapbox로 연결됨
import Map from "react-map-gl/mapbox";  // 유료 서비스
```

### 3. URL 상태 관리

전역 상태 라이브러리 대신 URL 파라미터를 사용한다.

```
필터 상태 → URL 쿼리 파라미터
   ↕
useQueryParams() hook으로 읽기/쓰기
```

상태를 추가해야 할 때:
- **필터/선택 같은 공유 가능한 상태** → URL 파라미터에 추가
- **일시적 UI 상태 (드롭다운 열림 등)** → 컴포넌트 로컬 `useState`

### 4. 정적 데이터 패턴

런타임 API 없이 JSON 파일에서 데이터를 로드한다.

```typescript
// Server Component에서
import { getPOIBySlug } from "@/lib/data-loader";

// Client Component에서
import poisJson from "@/data/pois.json";
const allPois = poisJson as POI[];
```

### 5. 동적 임포트 패턴 (맵 컴포넌트)

MapLibre는 `window` 객체를 필요로 하므로 SSR을 비활성화해야 한다.

```typescript
// 반드시 "use client" 파일 내에서
"use client";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
```

---

## i18n 작업 가이드

### 번역 키 추가

1. `messages/ko.json`에 키 추가
2. `messages/en.json`에 동일 키 추가
3. 컴포넌트에서 사용:

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("namespace");
  return <p>{t("key")}</p>;
}
```

### 네비게이션 링크

```tsx
// next-intl의 Link 사용 (로케일 자동 포함)
import { Link } from "@/i18n/navigation";

<Link href="/spots/namsan-tower">상세보기</Link>
// → /ko/spots/namsan-tower (현재 로케일이 ko일 때)
```

### 로케일 접근

```tsx
import { useLocale } from "next-intl";
const locale = useLocale() as "ko" | "en";
```

---

## 테스트 가이드

### 테스트 파일 위치

```
src/lib/__tests__/
├── categories.test.ts    # 카테고리 데이터 검증
├── data-loader.test.ts   # 데이터 로더 함수 테스트
├── regions.test.ts       # 지역 데이터 검증
└── url.test.ts           # URL 유틸리티 테스트
```

### 테스트 실행

```bash
npm run test              # 전체 실행
npm run test:watch        # 워치 모드
```

### 테스트 작성 규칙

- 파일명: `*.test.ts` 또는 `*.test.tsx`
- 위치: `src/**/__tests__/` 디렉토리
- 환경: jsdom (Vitest + @testing-library/react)

---

## 자주 하는 작업

### 새 POI 추가

1. `src/data/pois.json`에 POI 객체 추가
2. `src/data/pois.geo.json`에 GeoJSON Feature 추가
3. `npm run build`로 정적 페이지 생성 확인

자세한 내용: [DATA-SCHEMA.md](./DATA-SCHEMA.md#새-poi-추가-방법)

### 새 컴포넌트 추가

1. 적절한 디렉토리에 `.tsx` 파일 생성
2. 인터랙션이 필요하면 `"use client"` 추가
3. 맵 관련이면 `dynamic(() => import(...), { ssr: false })` 사용
4. 번역이 필요하면 `useTranslations` 사용

### 새 필터 추가

1. `src/types/map.ts`의 `FilterState`에 필드 추가
2. `src/hooks/useQueryParams.ts`에 URL 파라미터 매핑 추가
3. `src/hooks/useFilteredPOIs.ts`에 필터 로직 추가
4. UI 컴포넌트에 필터 인터랙션 추가

---

## 알아야 할 주의사항

### Turbopack 관련

| 문제 | 해결 |
|------|------|
| `.geojson` 파일 미지원 | `.geo.json` 확장자 사용 |
| `middleware.ts` HMR 무한루프 | `src/proxy.ts` 사용 |
| `ssr: false`가 Server Component에서 동작 안함 | Client Component 래퍼 사용 |

### MapLibre 관련

| 문제 | 해결 |
|------|------|
| CSS 클래스 `.mapboxgl-*` 불일치 | `.maplibregl-*` 접두사 사용 |
| `getClusterExpansionZoom()` 타입 | Promise 기반 (`.then()`) |
| `showUserHeading` 미지원 | GeolocateControl에서 해당 prop 제거 |

### React Hook 관련

| 문제 | 해결 |
|------|------|
| `searchParams` 의존성 무한루프 | `useRef` 패턴으로 의존성 안정화 |
| 콜백 prop이 useEffect 의존성 | `useRef`로 감싸서 의존성 제거 |
| `useSearchParams()` Suspense 필요 | 상위에 `<Suspense>` 래핑 |

---

## 관련 문서

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 전체 아키텍처 결정 및 구조
- [COMPONENTS.md](./COMPONENTS.md) — 컴포넌트 API 레퍼런스
- [HOOKS.md](./HOOKS.md) — 커스텀 Hooks 가이드
- [DATA-SCHEMA.md](./DATA-SCHEMA.md) — 데이터 스키마 및 확장 방법
