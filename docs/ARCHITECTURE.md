# Korea Festival App - Architecture Document

## 개요

한국 관광지를 인터랙티브 지도에서 탐색할 수 있는 웹 앱.
MapLibre GL JS 기반의 클러스터링 맵과 카테고리/지역 필터, Fuse.js 퍼지 검색, 다국어(ko/en) 지원을 제공한다.

---

## 기술 스택

| 영역 | 기술 | 버전 | 비고 |
|------|------|------|------|
| Framework | Next.js (App Router) | 16.x | Turbopack 개발 서버 |
| Language | TypeScript | 5.x | strict mode |
| Styling | Tailwind CSS | 4.x | `@theme inline` 커스텀 토큰 |
| Map | react-map-gl + MapLibre GL JS | 8.x / 5.x | `react-map-gl/maplibre` 임포트 |
| Tile Server | OpenFreeMap (positron) | - | API 키 불필요, 무료 |
| i18n | next-intl | 4.x | ko/en, `localePrefix: "always"` |
| Search | Fuse.js | 7.x | 클라이언트 퍼지 검색 |
| Command Palette | cmdk | 1.x | SearchBar 내부 사용 |
| Test | Vitest + Testing Library | 4.x | jsdom 환경 |

---

## 디렉토리 구조

```
korea-festival-app/
├── messages/                    # i18n 번역 파일
│   ├── ko.json
│   └── en.json
├── public/images/               # 정적 이미지
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # 루트 레이아웃 (children passthrough)
│   │   ├── globals.css          # Tailwind + MapLibre CSS
│   │   ├── robots.ts            # robots.txt 생성
│   │   ├── sitemap.ts           # sitemap.xml 생성
│   │   ├── global-error.tsx     # 전역 에러 바운더리
│   │   └── [locale]/            # 로케일 동적 세그먼트
│   │       ├── layout.tsx       # 로케일별 레이아웃 (NextIntlClientProvider)
│   │       ├── page.tsx         # 메인 맵 페이지
│   │       ├── loading.tsx      # 스트리밍 로딩 UI
│   │       ├── error.tsx        # 에러 바운더리
│   │       ├── not-found.tsx    # 404 페이지
│   │       └── spots/[slug]/    # POI 상세 페이지
│   │           ├── page.tsx     # SSG 상세 페이지
│   │           ├── loading.tsx
│   │           └── error.tsx
│   ├── components/
│   │   ├── layout/              # 헤더, 로고, 언어 전환
│   │   ├── map/                 # 지도 관련 컴포넌트
│   │   ├── panel/               # 사이드패널, 바텀시트, 검색, 필터
│   │   └── spot/                # 상세 페이지 컴포넌트
│   ├── hooks/                   # 커스텀 React hooks
│   ├── i18n/                    # next-intl 설정
│   ├── lib/                     # 유틸리티, 상수, 데이터 로더
│   ├── data/                    # 정적 JSON 데이터
│   ├── types/                   # TypeScript 타입 정의
│   ├── test/                    # 테스트 설정
│   └── proxy.ts                 # Next.js 16 프록시 (구 middleware.ts)
├── next.config.ts
├── vitest.config.ts
└── tsconfig.json
```

---

## 핵심 아키텍처 결정

### 1. Static-First 데이터 전략

런타임 API 없이 JSON 파일로 모든 POI 데이터를 관리한다.

```
src/data/
├── pois.json        # 25개 POI의 전체 메타데이터 (이름, 주소, 좌표, 연락처 등)
├── pois.geo.json    # GeoJSON FeatureCollection (맵 렌더링용, 경량)
└── regions.json     # 17개 행정구역 (중심점, bbox)
```

- **이유**: 빌드 타임에 모든 데이터가 번들에 포함되어 Zero-API로 작동
- **제약**: Turbopack이 `.geojson` 확장자를 처리하지 못함 → `.geo.json` 사용
- **SSG**: `generateStaticParams()`로 2 locales × 25 POIs = 50개 상세 페이지 정적 생성

### 2. URL Search Params as Single Source of Truth

별도의 전역 상태 관리 라이브러리 없이 URL 쿼리 파라미터로 필터 상태를 관리한다.

```
/?cat=nature,culture&region=seoul&q=한라산&poi=hallasan
```

| 파라미터 | 키 | 예시 |
|---------|-----|------|
| 카테고리 필터 | `cat` | `nature,culture` (쉼표 구분) |
| 지역 필터 | `region` | `seoul` |
| 검색어 | `q` | `한라산` |
| 선택된 POI | `poi` | `hallasan` |

- `useQueryParams` hook이 `useSearchParams()`를 래핑하여 `FilterState` 객체를 제공
- 북마크, 공유 가능한 URL 상태
- React 상태 라이브러리 의존성 제거

### 3. Server Component → Client Boundary 패턴

```
[locale]/page.tsx (Server Component)
  └─ MapShellLoader.tsx ("use client" + dynamic import)
       └─ MapShell.tsx (ssr: false, 실제 클라이언트 경계)
            ├─ MapView.tsx (react-map-gl)
            ├─ SidePanel.tsx (데스크톱)
            └─ BottomSheet.tsx (모바일)
```

- **MapShellLoader**: `next/dynamic`의 `ssr: false`를 Client Component 내에서 사용 (Next.js 16 필수 패턴)
- **이유**: MapLibre GL JS는 `window`/`document`를 필요로 하므로 SSR 불가
- **Loading State**: 스피너 + "Loading map..." 텍스트로 CLS 방지

### 4. Next.js 16 프록시 마이그레이션

```
middleware.ts (deprecated) → src/proxy.ts
```

- Next.js 16에서 `middleware.ts`가 deprecated되어 `proxy.ts`로 변경
- `middleware.ts`를 Turbopack에서 사용하면 HMR 무한 리빌드 루프 발생
- next-intl의 `createMiddleware` 패턴은 동일하게 사용

### 5. MapLibre GL JS (Mapbox 대체)

```typescript
// 반드시 이 경로에서 임포트
import Map from "react-map-gl/maplibre";
```

- **Mapbox GL JS** → **MapLibre GL JS** (BSD-3, 완전 무료)
- 타일 서버: `https://tiles.openfreemap.org/styles/positron` (API 키 불필요)
- CSS 클래스 접두사: `.maplibregl-*` (`.mapboxgl-*` 아님)
- `getClusterExpansionZoom()`: Promise 기반 (Mapbox는 callback)

---

## 컴포넌트 아키텍처

### 메인 맵 페이지

```
┌──────────────────────────────────────────────────┐
│ Header (Logo + LocaleSwitcher)                   │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ SidePanel│         MapView                       │
│ (lg+)    │  ┌─────────────────────┐              │
│          │  │  ClusterSource      │              │
│ SearchBar│  │  ├── clusterLayer   │              │
│ Filter   │  │  ├── countLayer     │              │
│ Chips    │  │  └── pointLayer     │              │
│ POICard  │  │                     │              │
│ List     │  │  MapControls        │              │
│          │  │  (Geolocate + Nav)  │              │
│          │  │                     │              │
│          │  │  POIPopup (선택 시) │              │
│          │  └─────────────────────┘              │
│          │                                       │
├──────────┴───────────────────────────────────────┤
│ BottomSheet (모바일, snap: peek/half/full)        │
└──────────────────────────────────────────────────┘
```

#### 데스크톱 (≥1024px)
- 좌측 384px 고정 `SidePanel` + 우측 `MapView`
- SidePanel: SearchBar → FilterChips → POICardList

#### 모바일 (<1024px)
- 전체화면 `MapView` + 하단 `BottomSheet`
- BottomSheet: 3단계 snap (peek: 120px, half: 50vh, full: 100vh-56px)
- 터치 드래그로 스냅 전환

### 상세 페이지 (`/spots/[slug]`)

```
┌──────────────────────────┐
│ ← Back                   │
├──────────────────────────┤
│ SpotMiniMap (비대화형)    │
│ ┌──────────────────────┐ │
│ │  카테고리 배지        │ │
│ │  제목 (ko + en)       │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ SpotInfo                 │
│ - 설명                   │
│ - 주소 / 연락처 / 웹사이트│
│ - Google Maps 링크       │
│ - 태그                   │
├──────────────────────────┤
│ NearbySpots (4개)        │
│ - 유클리드 거리 기반 추천 │
├──────────────────────────┤
│ SpotJsonLd (SEO)         │
└──────────────────────────┘
```

- **SpotHero**: 미니맵 + 오버레이 제목 (dynamic import로 SpotMiniMap 로드)
- **SpotJsonLd**: `TouristAttraction` 스키마 JSON-LD 삽입
- **NearbySpots**: 유클리드 거리 기반 가장 가까운 4개 POI 추천

---

## 데이터 흐름

### 필터링 흐름

```
사용자 인터랙션 (카테고리 클릭 / 지역 선택 / 검색 / POI 클릭)
  │
  ▼
useQueryParams.setFilter()
  │
  ▼
router.replace(새 URL 쿼리 파라미터)
  │
  ▼
useSearchParams() 업데이트 → filters 객체 재생성
  │
  ├─▶ useFilteredGeoJSON(geojson, filters) → ClusterSource → 맵 마커 업데이트
  │     (useMemo: categories + region 필터 적용)
  │
  └─▶ useFilteredPOIs(pois, filters) → POICardList → 목록 업데이트
        (useMemo: categories + region 필터 적용)
```

### 검색 흐름

```
SearchBar (cmdk) → query 상태 변경
  │
  ▼
useEffect([query]) → onSearch(query)
  │
  ▼
MapShell.handleSearch()
  ├─ setFilter("query", query)     → URL 업데이트
  └─ search(query)                 → Fuse.js 검색
       └─ setSearchResults(results) → SearchBar 드롭다운 표시
```

### POI 선택 흐름

```
POI 클릭 (맵 마커 or 카드)
  │
  ▼
handleSelectPOI(slug)
  ├─ setFilter("selectedPOI", slug) → URL에 poi= 파라미터 추가
  └─ mapRef.flyTo(좌표, zoom≥13)   → 맵 애니메이션
  │
  ▼
selectedPOI = allPois.find(slug)
  └─ POIPopup 렌더링 (Popup 컴포넌트)
       └─ "상세보기" 링크 → /spots/[slug]
```

---

## 맵 레이어 구성

GeoJSON Source (`id: "pois"`) + 3개 레이어:

| 레이어 | ID | 타입 | 설명 |
|--------|-----|------|------|
| 클러스터 원 | `clusters` | circle | point_count에 따라 색상/크기 변화 |
| 클러스터 수 | `cluster-count` | symbol | 클러스터 내 POI 수 텍스트 |
| 개별 마커 | `unclustered-point` | circle | 카테고리별 색상, 줌 레벨에 따라 크기 보간 |

```
클러스터 색상:  <10 → #51bbd6, 10~30 → #f1f075, >30 → #f28cb1
클러스터 반경:  50px
최대 줌:        14
```

개별 마커는 `CATEGORY_COLORS` 매핑으로 카테고리별 고유 색상 표시:
- 관광지: `#FF6B6B`, 맛집: `#FFA94D`, 숙박: `#69DB7C`, 쇼핑: `#9775FA`
- 축제: `#FF8787`, 문화: `#748FFC`, 자연: `#38D9A9`, 레저: `#F783AC`

---

## i18n 구조

### 라우팅

```
/ko          → 메인 맵 (한국어)
/en          → 메인 맵 (영어)
/ko/spots/x  → 상세 페이지 (한국어)
/en/spots/x  → 상세 페이지 (영어)
```

- `localePrefix: "always"` → 항상 URL에 로케일 포함
- `src/proxy.ts`에서 next-intl의 `createMiddleware`가 리다이렉트 처리
- `/` 접속 시 → `/ko`로 리다이렉트 (defaultLocale)

### 번역 키 구조

```json
{
  "header": { ... },
  "search": { "placeholder", "noResults", "results" },
  "filter": { "category", "region", "all" },
  "poi": { "viewDetail", "description", "address", "contact", "website", "openInMaps" },
  "spot": { "nearbyTitle", "noDescription" }
}
```

### 데이터 다국어

POI 데이터는 `{ ko: string, en: string }` 형태로 이름/주소/설명을 동시에 저장:

```typescript
interface POI {
  name: { ko: string; en: string };
  address: { ko: string; en: string };
  description?: { ko: string; en: string };
}
```

---

## Custom Hooks

### `useQueryParams()`
URL 검색 파라미터를 `FilterState`로 래핑. `searchParams`를 ref로 관리하여 `setFilter` 콜백의 안정성을 보장 (무한 리렌더링 방지).

### `useFilteredGeoJSON(geojson, filters)`
GeoJSON FeatureCollection에서 카테고리/지역 필터를 적용한 새 FeatureCollection 반환. `useMemo`로 메모이제이션.

### `useFilteredPOIs(pois, filters)`
POI 배열에서 카테고리/지역 필터 적용. `useMemo`로 메모이제이션.

### `usePOISearch(pois)`
Fuse.js 인덱스를 생성하고 `search(query, limit)` 함수를 반환. 인덱스를 `useMemo`로 캐싱.

### `useMediaQuery(query)` / `useIsDesktop()` / `useIsMobile()`
`window.matchMedia`를 래핑한 반응형 hook. SidePanel/BottomSheet 전환에 사용.

---

## SEO 전략

| 항목 | 구현 |
|------|------|
| Sitemap | `src/app/sitemap.ts` - 모든 로케일 × POI 조합 |
| Robots | `src/app/robots.ts` - 전체 허용 |
| JSON-LD | `SpotJsonLd` - TouristAttraction 스키마 |
| Open Graph | `generateMetadata()` - 각 페이지별 OG 태그 |
| Alternate | `hreflang` ko/en 교차 링크 |
| Canonical | 각 로케일별 정규 URL |

---

## 빌드 & 배포

### 정적 페이지 생성

```
총 정적 페이지: 57개
= 2 locales × 25 POIs (상세)
+ 2 메인 페이지
+ sitemap.xml + robots.txt
+ error/not-found 페이지
```

### 개발 서버

```bash
npm run dev      # Next.js 16 + Turbopack (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run test     # Vitest 실행
```

### 환경 변수

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_URL` | sitemap/robots에 사용되는 베이스 URL | `https://korea-travel-map.vercel.app` |

- MapLibre + OpenFreeMap 사용으로 **API 키 불필요**

---

## 알려진 제약 사항

1. **OpenFreeMap 폰트**: positron 스타일이 `Noto Sans Bold,Noto Sans Regular` 합성 폰트를 요청하지만 404 → MapLibre가 로컬 폴백으로 렌더링 (기능 영향 없음)
2. **Turbopack + .geojson**: `.geojson` 확장자 미지원 → `.geo.json` 사용
3. **Turbopack + middleware.ts**: HMR 무한 리빌드 루프 발생 → `src/proxy.ts` 사용
4. **MapLibre GeolocateControl**: `showUserHeading` prop 미지원
5. **POI 데이터**: 현재 25개 정적 데이터, 확장 시 API 또는 CMS 도입 필요
