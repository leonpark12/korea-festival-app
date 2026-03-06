# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Added
- **hreflang alternates**: spot 상세 페이지에 ko/en 언어 교차 링크 추가 (Google 다국어 페이지 연결)
- **Twitter Card 메타데이터**: 레이아웃 + 상세 페이지에 `summary_large_image` Twitter Card 추가
- **Gallery alt 텍스트**: 빈 alt → `{POI명} {번호}` 형식으로 접근성 및 이미지 SEO 개선
- **description 폴백 개선**: HTML 스트립 + intro 필드(이용시간 등) 활용으로 더 풍부한 메타 설명 생성
- **JSON-LD 보강**: `inLanguage`, `keywords`(tags) 필드 추가
- **홈페이지 sr-only h1**: 스크린리더/크롤러용 숨겨진 메인 헤딩 추가
- **Sitemap spot alternates**: spot 페이지에 ko/en alternates 추가

### Changed
- **맵 나침반 버튼**: `dragRotate` 활성화 + NavigationControl `showCompass` 활성화 — 맵 회전 후 북쪽 리셋 가능
- **마커/라벨 단계적 전환**: `CLUSTER_MAX_ZOOM` 14→12, `CLUSTER_RADIUS` 50→40, 라벨 `minzoom` 14→13 — zoom 12에서 개별 마커, zoom 13에서 라벨 시작

### Added
- **브랜딩 색상 팔레트**: Lemon Meringue + Prussian Blue 5색 팔레트 적용 (primary, accent, warm, danger, surface 토큰)
- **SVG 로고**: 이모지 → Prussian Blue 원 + Gold 지도핀 인라인 SVG
- **Favicon**: `icon.tsx` (32x32) + `apple-icon.tsx` (180x180) — ImageResponse 프로그래매틱 생성
- **OG 이미지**: `opengraph-image.tsx` (1200x630) — Prussian Blue 배경 + 로고 + 앱 이름
- **Web Manifest**: `manifest.ts` — PWA 지원 (theme_color, background_color, icons)
- **Google Analytics 4**: GA4 트래킹 스크립트 적용 (`G-HCLFZ3XDK6`, `kr-tour.com` 도메인)

### Changed
- **사이트 이름 변경**: "Korea Travel Map" / "한국 관광 지도" → "Tour Korea" (전체 통일)
- **클러스터 색상**: 기본 3색 → Gold(`#fcbf49`), Orange(`#f77f00`), Red(`#d62828`)
- **theme-color**: viewport에 `themeColor: "#003049"` 추가
- **프록시 매처**: `/icon`, `/apple-icon`, `/opengraph-image`, `/manifest` 경로 i18n 제외

### Removed
- **favicon.ico**: 프로그래매틱 `icon.tsx`로 대체

### Fixed
- **CSP GA4 차단 수정**: `script-src`에 `googletagmanager.com`, `connect-src`에 `google-analytics.com` 도메인 허용
- **선택 POI 펄스 마커**: 검색/클릭으로 POI 선택 시 해당 위치에 파란색 펄스 애니메이션 표시 (모바일/데스크탑 모두)
- **상세 페이지 이미지 갤러리**: SpotGallery 컴포넌트 — 가로 스크롤 snap, lazy loading, 에러 핸들링
- **상세 페이지 반려동물 동반 정보**: pet 데이터(동반 유형, 기타 정보, 캠핑, 필요 자재, 위험 자재) 표시
- **POIPetInfo 타입**: `src/types/poi.ts`에 반려동물 정보 인터페이스 추가
- **regions.json center/bbox**: 17개 시도별 중심 좌표 및 bbox 추가 (region 클러스터 고정 좌표용)
- **i18n pet/gallery 키**: ko/en 번역 파일에 반려동물·갤러리 관련 7개 키 추가

### Changed
- **Region 클러스터 좌표**: POI 평균 좌표 → regions.json 고정 center 좌표 사용 (안정적 표시)
- **data-loader**: FULL_PROJECTION에 pet/detailPetUpdated 필드 추가, docToPOI 매핑 추가
- **db-setup**: `category_1_region_1` 인덱스 제거 → `region_1` 단일 인덱스로 교체

### Fixed
- **상세 페이지 intro 필드 매핑**: contentTypeId별 intro 필드명 대응 — 문화시설(14), 축제(15), 숙박(32), 쇼핑(38), 음식점(39), 레포츠(28) 카테고리에서 영업시간/휴무일/주차 정보 표시
- **상세 페이지 safe-area 대응**: `h-screen` → `h-dvh`, NearbySpots 하단 `safe-area-inset-bottom` 패딩 추가
- **viewport-fit cover 설정**: 노치/다이나믹 아일랜드 기기에서 전체 화면 활용

### Security
- **CSP img-src**: `http://tong.visitkorea.or.kr` 추가 (HTTP 이미지 허용)

## [0.4.0] - 2026-03-06

### Added
- **Noto Sans KR 한글 폰트**: `next/font/google`로 self-host, font-sans 우선순위 적용
- **이미지 최적화 설정**: `next.config.ts`에 `images.remotePatterns` 추가 (`tong.visitkorea.or.kr`)
- **NearbySpots 스켈레톤**: Suspense fallback용 로딩 UI 컴포넌트
- **POIs API 페이지네이션**: `page`, `limit` 파라미터 지원 (기본 200, 최대 500)

### Changed
- **`getPOIBySlug` React `cache()` 래핑**: `generateMetadata` + `SpotPage`에서 동일 요청 내 DB 쿼리 dedupe
- **NearbySpots Suspense 스트리밍**: `NearbySection` 분리 + `<Suspense>`로 메인 콘텐츠 즉시 렌더링
- **`getNearbyPOIs` 경량화**: `FULL_PROJECTION` → `NEARBY_PROJECTION` 사용, 반환 타입 `POI[]` → `POISummary[]`
- **`useMediaQuery` lazy initializer**: `useState(false)` → 클라이언트 초기값 즉시 설정으로 CLS 해소

### Removed
- 루트 `layout.tsx`의 불필요한 Geist 폰트 정의 제거 (locale 레이아웃에서만 관리)

### Performance
- 상세 페이지 DB 쿼리: 2회 → 1회 (React `cache()` dedupe)
- NearbyPOIs 전송 데이터: intro/info/images/description 필드 제거 (NEARBY_PROJECTION)
- NearbySpots 스트리밍: 메인 콘텐츠(SpotHero, SpotInfo) 즉시 렌더링, NearbySpots 비동기 도착
- CLS 개선: 데스크탑에서 모바일→데스크탑 레이아웃 전환 제거

## [0.3.0] - 2026-03-06

### Added
- **보안 헤더**: CSP, HSTS, X-Frame-Options 등 종합 보안 헤더 적용 (`next.config.ts`)
- **API Rate Limiting**: 모든 API 엔드포인트에 인메모리 rate limiter 적용 (60~120 req/min)
- **API 입력 검증**: locale 화이트리스트, bbox `isFinite()` 체크, limit/per_category 범위 제한
- **db-setup 인증**: Bearer 토큰 인증 + rate limit (3 req/min)
- **검색 디바운스**: 300ms 디바운스로 불필요한 API 호출 방지
- **검색 stale 응답 무시**: 요청 카운터로 이전 요청 응답이 최신 결과를 덮어쓰는 것 방지
- **검색 좌표 전달**: viewport 밖 POI 검색 클릭 시에도 `flyTo` 동작
- **모바일 하단 패딩**: BottomSheet 높이만큼 맵 하단 여백 추가 (제주도 가려짐 해결)
- `src/lib/rate-limit.ts`: TTL 기반 인메모리 rate limiter
- `src/lib/api-utils.ts`: `parseLocale()`, `getClientIP()`, `checkRateLimit()` 유틸리티

### Changed
- `searchPOIs`: MongoDB `$text` 결과가 비어도 regex fallback으로 부분 매칭 지원
- `BottomSheet`: 매직넘버 → `BOTTOM_SHEET_HEIGHT` / `BOTTOM_SHEET_SELECTED_HEIGHT` 상수 사용

### Fixed
- **검색 클릭 무응답**: geojson viewport 밖 POI 클릭 시 좌표 fallback으로 `flyTo` 실행
- **모바일 팝업 중복**: 모바일에서 POIPopup + BottomSheet 동시 표시 → BottomSheet만 표시
- **검색 경합 조건**: `setFilter` 2회 호출로 URL params 덮어쓰기 → `skipSearchRef` 패턴 적용
- **부분 검색 미작동**: "성산일출" → "성산일출봉" 검색 가능 (regex fallback 개선)
- **검색 응답 순서 경합**: 느린 이전 응답이 최신 결과 덮어쓰기 → 디바운스 + requestId 적용

### Security
- XSS 방지: `SpotJsonLd`에서 `<` → `\u003c` 이스케이프
- URL 프로토콜 검증: `safeHref()`에서 `javascript:`, `data:`, `vbscript:` 차단
- API 에러 메시지 제네릭화: DB 에러 상세 노출 방지

## [0.2.0] - 2026-03-04

### Added
- **`appCategory` 필드**: MongoDB에 앱 카테고리 코드를 직접 저장하여 역매핑 로직 제거
- **`thumbnail` 필드**: POI 첫 번째 이미지를 별도 필드로 저장 (카드뷰 최적화)
- **상세 페이지 방문 정보**: `intro` 데이터 활용 — 이용시간, 휴무일, 주차 정보 표시
- **상세 페이지 시설 안내**: `info` 데이터 활용 — 입장료, 화장실 등 시설 정보 표시
- **`appCategory_1_region_1` 인덱스**: 카테고리+지역 필터 쿼리 성능 향상
- **마이그레이션 스크립트** (`scripts/migrate-all.mjs`): 전체 MongoDB 문서 일괄 스키마 변환
- POI 타입 확장: `POIInfoItem`, `POIIntroItem` 인터페이스 추가

### Changed
- `data-loader.ts`: `CATEGORY_MAP_*`, `reverseMapCategories()`, `$switch` aggregation 제거 → `appCategory` 직접 쿼리로 단순화
- `SUMMARY_PROJECTION`에 `thumbnail` 추가, `FULL_PROJECTION`에 `mlevel`/`intro`/`info` 추가
- `db-setup.ts`: location 필드 전체 동기화 (기존: 미존재 시에만 생성), mlevel 타입 변환 추가
- 텍스트 검색 인덱스에 `description` 필드 추가 (가중치 3)
- 상세 페이지 HTML 태그(`<br>`) 줄바꿈 렌더링 처리
- website URL 파싱 안전 처리 (`safeHostname`/`safeHref`)

### Fixed
- **좌표 동기화 버그**: `coordinates`와 `location` 필드 불일치 수정 (전체 문서 재동기화)
- **이미지 URL HTTPS**: `http://` → `https://` 정규화 (mixed content 경고 제거)
- **mlevel 타입**: `"6"` (string) → `6` (number) 변환

### Performance
- `getCardsByCategory`: `$addFields + $switch` 단계 제거 → `appCategory` 직접 그룹핑
- `getGeoJSONByBBox`/`getRegionClusters`: 역매핑 연산 제거로 쿼리 단순화

## [0.1.0] - 2026-02-17

### Added
- **MongoDB 백엔드 마이그레이션**: JSON 파일 기반에서 MongoDB로 데이터 레이어 전환
  - `src/lib/mongodb.ts` 커넥션 싱글톤, `src/lib/db-setup.ts` 인덱스 셋업
  - `pois_kr`, `pois_en` 컬렉션 (locale별 분리)
  - 2dsphere, slug, category+region, text search 인덱스
- **Viewport 기반 데이터 로딩**: bbox + zoom 파라미터로 보이는 영역만 서버에서 로드
  - SWR 캐싱 + `keepPreviousData`로 깜빡임 방지
  - 디바운스된 viewport 업데이트 (300ms)
- **서버사이드 Region 클러스터**: zoom < 10에서 MongoDB aggregation으로 지역별 클러스터 생성
- **카테고리별 카드뷰 API** (`GET /api/pois/cards`): MongoDB aggregation으로 카테고리별 5개씩 반환
  - 사이드패널/드로어에 카테고리 그룹 UI (아이콘 + 라벨 + 총 개수)
  - viewport 연동: zoom >= 10이면 bbox 내 POI에서 그룹핑
- **DB 셋업 API** (`POST /api/db-setup`): location 필드 변환 + 인덱스 생성 (1회 실행)
- **주변 관광지**: `$geoNear` aggregation 기반 근접 POI 조회

### Changed
- `data-loader.ts`: 모든 데이터 함수 async (MongoDB 쿼리)
- `usePOIData` 훅: summaries 전체 로드 제거 → cards SWR 추가 (페이로드 ~2MB → ~5KB)
- `POICardList`: flat 리스트 → 카테고리 그룹 렌더링 (최대 40개 DOM)
- `SidePanel`, `FilterDrawer`: `pois` prop → `cardGroups` + `totalVisible` prop
- `MapShell`: 좌표 조회를 summaries 대신 geojson features에서 slug 검색
- GeoJSON API: viewport bbox + zoom 기반 분기 (region clusters / bbox query / 전체)

### Removed
- `useFilteredPOIs` 훅 삭제 (서버사이드 필터링으로 대체)
- 전체 POI summaries 로드 (`/api/pois` 호출) 제거

### Performance
- 초기 카드 페이로드: ~2MB (21,673개 summaries) → ~5KB (최대 40개 cards)
- DOM 노드: 수천 개 카드 → 최대 40개 (카테고리별 5개 × 8)
- 카테고리/지역 필터: 클라이언트 사이드 → 서버사이드 MongoDB

## [0.0.9] - 2026-02-16

### Fixed
- 모바일 상세 페이지에서 전체 페이지 스크롤이 되지 않던 문제 수정 (#9)

## [0.0.8] - 2026-02-15

### Changed
- 지도 UX 및 성능 개선 (#8)

## [0.0.7] - 2026-02-14

### Fixed
- Vercel 75MB 배포 용량 제한 해결을 위해 상세 페이지 SSG → ISR 전환 (#7)

## [0.0.6] - 2026-02-13

### Changed
- 단일언어(monolingual) per-locale 데이터 아키텍처로 리팩토링 (#6)
- API Routes 추가 (`/api/pois`, `/api/geojson`, `/api/pois/search`)

## [0.0.5] - 2026-02-12

### Changed
- 모바일 바텀시트에 snap points + drag gestures 리팩토링 (#5)
- v1 모바일 UX로 revert 후 v2 기능 병합

## [0.0.4] - 2026-02-12

### Added
- 모바일 UX 개선: Geolocation 마커, 헤더 필터, 광고 플레이스홀더 (#4)

## [0.0.3] - 2026-02-11

### Performance
- 맵 컴포넌트 메모이제이션 및 렌더 콜백 최적화 (#3)

## [0.0.2] - 2026-02-11

### Changed
- Mapbox GL → MapLibre GL JS 마이그레이션 (완전 무료, API 키 불필요) (#2)
- OpenFreeMap positron 타일 서버 적용

## [0.0.1] - 2026-02-10

### Added
- 초기 MVP 구현: 한국 관광 지도 앱 (#1)
- MapLibre GL JS 기반 인터랙티브 지도
- 25개 POI 데이터 (관광지, 맛집, 숙박, 쇼핑, 축제 등)
- 카테고리/지역 필터링
- Fuse.js 퍼지 검색 + cmdk 커맨드 팔레트
- 반응형 레이아웃 (데스크톱 사이드패널 / 모바일 바텀시트)
- 한국어/영어 다국어 지원 (next-intl)
- 상세 페이지 SSG + SEO (JSON-LD, OG 태그, sitemap)
- 마커 클러스터링
- Vercel 배포
