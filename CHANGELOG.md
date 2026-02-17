# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Added
- 프로젝트 규칙 문서 (`CLAUDE.md`) 생성
- 변경 이력 관리 (`CHANGELOG.md`) 도입
- 프로젝트 README (`README.md`) 생성

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
