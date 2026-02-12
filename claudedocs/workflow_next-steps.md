# Korea Travel Map - Next Steps Workflow

> Generated: 2026-02-12
> Strategy: Systematic
> Base: MVP Complete (44 files, ~3,500 LOC, 25 POIs)

---

## Current State Summary

| Metric | Value |
|--------|-------|
| MVP Features | 25/25 완료 (100%) |
| Files | 44개 |
| Static Pages | 57개 (2 locales × 25 POIs + extras) |
| Build Status | ✅ Pass (TypeScript strict) |
| Unused Code | 3 files (search.ts, geo-utils.ts, useMapInteraction.ts) |
| Test Coverage | 0% (테스트 없음) |
| Error Boundaries | 없음 |
| Lighthouse Score | 미측정 |

---

## Phase 1: Code Cleanup & Quality (Priority: High)

> 목표: 프로덕션 코드 품질 확보

### 1.1 불필요 코드 제거
- **Task**: `src/lib/search.ts` 삭제 (usePOISearch 훅과 중복)
- **Task**: `src/hooks/useMapInteraction.ts` 삭제 (MapView에 로직 통합됨)
- **Task**: `src/lib/geo-utils.ts`를 `data-loader.ts`의 `getNearbyPOIs`에 통합하거나 삭제
- **Task**: `src/components/ui/` 빈 디렉토리 삭제
- **Checkpoint**: `npm run build` 성공 확인

### 1.2 에러 바운더리 추가
- **Task**: `src/app/[locale]/error.tsx` 생성 (클라이언트 에러 바운더리)
- **Task**: `src/app/[locale]/spots/[slug]/error.tsx` 생성
- **Task**: `src/app/global-error.tsx` 생성 (루트 에러 처리)
- **Dependency**: 1.1 완료 후

### 1.3 로딩 상태 개선
- **Task**: `src/app/[locale]/loading.tsx` 생성 (스켈레톤 UI)
- **Task**: `src/app/[locale]/spots/[slug]/loading.tsx` 생성
- **Task**: POICardList에 스켈레톤 카드 추가
- **Dependency**: 없음 (병렬 가능)

### 1.4 접근성(A11y) 강화
- **Task**: 필터 칩에 `role="group"`, `aria-label` 추가
- **Task**: BottomSheet에 `role="dialog"`, `aria-modal` 추가
- **Task**: POICard에 `aria-selected` 반영
- **Task**: 지도 영역에 `aria-label="Interactive map"` 추가
- **Task**: 키보드 네비게이션 (Escape 키로 팝업/검색 닫기)
- **Dependency**: 없음 (병렬 가능)

---

## Phase 2: Performance & UX Polish (Priority: High)

> 목표: Lighthouse 90+ 달성, 모바일 UX 개선

### 2.1 성능 최적화
- **Task**: 지도 페이지 코드 분할 확인 (dynamic import 검증)
- **Task**: 상세 페이지에서 mapbox-gl 미로딩 확인 (Static Map 이미지만 사용)
- **Task**: pois.json → tree-shaking 가능하도록 import 최적화
- **Task**: `next/image` 적용 (SpotHero 정적 맵 이미지)
- **Checkpoint**: Lighthouse LCP < 2.5s, CLS < 0.1

### 2.2 모바일 UX 세부 조정
- **Task**: BottomSheet 드래그 감도 개선 (touch-action, passive listeners)
- **Task**: 검색바 모바일에서 다이얼로그 형태로 전환 (전체 화면 오버레이)
- **Task**: 필터 칩 가로 스크롤 (모바일에서 `overflow-x-auto`)
- **Task**: 카드 클릭 시 BottomSheet를 peek으로 축소 + 지도 flyTo
- **Dependency**: 1.3 완료 후

### 2.3 지도 인터랙션 개선
- **Task**: 호버 시 마커 하이라이트 (feature-state 사용)
- **Task**: 카드 클릭 시 해당 마커로 flyTo + 팝업 표시 연동
- **Task**: 클러스터 클릭 시 확대 애니메이션 개선
- **Task**: 줌 레벨에 따른 마커 크기 조정
- **Dependency**: 없음

---

## Phase 3: Testing & CI (Priority: Medium)

> 목표: 핵심 로직 테스트 커버리지 확보

### 3.1 테스트 환경 설정
- **Task**: Vitest + React Testing Library 설치
- **Task**: `vitest.config.ts` 설정 (path aliases, jsdom)
- **Task**: `package.json`에 test 스크립트 추가

### 3.2 단위 테스트
- **Task**: `useFilteredPOIs` 훅 테스트 (필터 조합)
- **Task**: `usePOISearch` 훅 테스트 (퍼지 검색 결과)
- **Task**: `useQueryParams` 훅 테스트 (URL ↔ state 동기화)
- **Task**: `data-loader.ts` 테스트 (getPOIBySlug, getNearbyPOIs)
- **Task**: `categories.ts`, `regions.ts` 데이터 무결성 테스트
- **Dependency**: 3.1 완료 후

### 3.3 E2E 테스트 (선택적)
- **Task**: Playwright 설정
- **Task**: 메인 페이지 로드 → 필터 클릭 → 카드 표시 시나리오
- **Task**: 상세 페이지 네비게이션 시나리오
- **Task**: 언어 전환 시나리오
- **Dependency**: 3.1 완료 후

---

## Phase 4: Deployment (Priority: High)

> 목표: Vercel 프로덕션 배포

### 4.1 배포 준비
- **Task**: Git 초기화 + `.gitignore` 확인
- **Task**: `.env.local`이 `.gitignore`에 포함 확인
- **Task**: `NEXT_PUBLIC_MAPBOX_TOKEN` 실제 토큰 설정
- **Task**: `NEXT_PUBLIC_SITE_URL` 환경 변수 설정
- **Task**: README.md 작성 (설정 가이드, 스크린샷)

### 4.2 Vercel 배포
- **Task**: GitHub 리포지토리 생성 + push
- **Task**: Vercel 프로젝트 연결
- **Task**: 환경 변수 설정 (NEXT_PUBLIC_MAPBOX_TOKEN)
- **Task**: Preview 배포 → 전체 플로우 테스트
- **Task**: 커스텀 도메인 설정 (선택)
- **Dependency**: 4.1 완료 후

### 4.3 배포 후 검증
- **Task**: `/ko`, `/en` 라우팅 확인
- **Task**: 지도 마커/클러스터링 동작 확인
- **Task**: 상세 페이지 SSG HTML 확인
- **Task**: sitemap.xml, robots.txt 접근 확인
- **Task**: Lighthouse 점수 측정
- **Task**: 모바일 디바이스 실기기 테스트
- **Checkpoint**: Lighthouse Performance 90+, SEO 100

---

## Phase 5: Post-MVP Features (Priority: Low)

> 목표: 사용자 경험 확장

### 5.1 즐겨찾기 (로컬스토리지)
- **Task**: `useFavorites` 훅 생성 (localStorage 기반)
- **Task**: POICard에 하트 아이콘 토글 추가
- **Task**: 즐겨찾기 필터 옵션 추가
- **Dependency**: Phase 1-2 완료

### 5.2 다크모드
- **Task**: Tailwind CSS dark 모드 설정
- **Task**: `useTheme` 훅 생성
- **Task**: 헤더에 테마 토글 추가
- **Task**: Mapbox 지도 스타일 전환 (dark-v11)
- **Dependency**: 없음

### 5.3 추가 언어 (중국어/일본어)
- **Task**: `messages/zh.json`, `messages/ja.json` 생성
- **Task**: `routing.ts`에 locales 추가
- **Task**: POI 데이터에 zh, ja 필드 추가
- **Task**: LocaleSwitcher 드롭다운으로 확장
- **Dependency**: 없음

### 5.4 실제 데이터 파이프라인
- **Task**: `scripts/process-data.ts` 구현 (관광공사 API → JSON/GeoJSON)
- **Task**: 100+ POI 데이터 가공
- **Task**: 이미지 다운로드 + 최적화 파이프라인
- **Dependency**: Phase 4 배포 후

### 5.5 PWA 지원
- **Task**: `next-pwa` 설정
- **Task**: Service Worker + 오프라인 캐시
- **Task**: manifest.json + 아이콘 세트
- **Dependency**: Phase 4 배포 후

---

## Dependency Graph

```
Phase 1 (Cleanup & Quality)
  ├── 1.1 코드 정리 ─────────────┐
  ├── 1.2 에러 바운더리 ←── 1.1   │
  ├── 1.3 로딩 상태 (병렬) ──────┤
  └── 1.4 접근성 (병렬) ─────────┘
                                  │
Phase 2 (Performance & UX)  ←────┘
  ├── 2.1 성능 최적화 (병렬)
  ├── 2.2 모바일 UX ←── 1.3
  └── 2.3 지도 인터랙션 (병렬)
                                  │
Phase 3 (Testing)  ←──────────────┘  (병렬 가능)
  ├── 3.1 환경 설정
  ├── 3.2 단위 테스트 ←── 3.1
  └── 3.3 E2E 테스트 ←── 3.1
                                  │
Phase 4 (Deployment)  ←───────────┘
  ├── 4.1 배포 준비
  ├── 4.2 Vercel 배포 ←── 4.1
  └── 4.3 배포 후 검증 ←── 4.2
                                  │
Phase 5 (Post-MVP)  ←─────────────┘
  ├── 5.1 즐겨찾기
  ├── 5.2 다크모드 (독립)
  ├── 5.3 추가 언어 (독립)
  ├── 5.4 데이터 파이프라인
  └── 5.5 PWA
```

---

## Execution Priority Matrix

| Phase | Priority | Effort | Impact | Parallelizable |
|-------|----------|--------|--------|----------------|
| 1.1 코드 정리 | 🔴 High | S | Medium | No (선행) |
| 1.2 에러 바운더리 | 🔴 High | S | High | After 1.1 |
| 1.3 로딩 상태 | 🟡 Medium | S | Medium | Yes |
| 1.4 접근성 | 🟡 Medium | M | High | Yes |
| 2.1 성능 최적화 | 🔴 High | M | High | Yes |
| 2.2 모바일 UX | 🟡 Medium | M | High | After 1.3 |
| 2.3 지도 인터랙션 | 🟡 Medium | M | Medium | Yes |
| 3.1-3.2 테스트 | 🟡 Medium | L | High | After Phase 1 |
| 4.1-4.2 배포 | 🔴 High | S | Critical | Sequential |
| 5.x Post-MVP | 🟢 Low | L | Medium | Independent |

**S** = Small (< 1시간), **M** = Medium (1-3시간), **L** = Large (3시간+)

---

## Quick Win Recommendations

즉시 실행 가능한 고효율 작업:

1. **코드 정리** (1.1) — 10분, 빌드 안정성 향상
2. **에러 바운더리** (1.2) — 20분, 프로덕션 안정성
3. **Vercel 배포** (4.1-4.2) — 30분, 실제 환경 검증
4. **Lighthouse 측정** (4.3) — 5분, 현재 성능 기준선

---

## Next Step

이 워크플로우를 실행하려면:
```
/sc:implement claudedocs/workflow_next-steps.md --phase 1
```
