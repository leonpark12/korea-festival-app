# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르며,
[Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### Added
- 프로젝트 규칙 문서 (`CLAUDE.md`) 생성
- 변경 이력 관리 (`CHANGELOG.md`) 도입
- 프로젝트 README (`README.md`) 생성

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
