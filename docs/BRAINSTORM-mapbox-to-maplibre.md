# 요구사항 명세: Mapbox → MapLibre GL JS (OpenStreetMap) 전환

> 작성일: 2026-02-12
> 상태: 요구사항 확정 대기

---

## 1. 사용자 목표

Mapbox의 가입 절차와 잠재적 비용 부담을 제거하기 위해, 현재 Mapbox GL JS 기반 지도를
**MapLibre GL JS + OpenFreeMap(OSM)** 기반으로 전환한다.

### 핵심 원칙
- API 키 / 가입 절차 완전 제거
- 기능 회귀 없음 (클러스터링, flyTo, Popup 등 동일 유지)
- 완전 무료 운영
- 기존 문서를 변경사항에 맞게 갱신
- 철저한 테스트 수행

---

## 2. 기술 결정 사항

| 항목 | 현재 (Mapbox) | 변경 후 (MapLibre) |
|------|--------------|-------------------|
| **렌더링 엔진** | mapbox-gl@^3.18.1 | maplibre-gl (최신) |
| **React 래퍼** | react-map-gl/mapbox | react-map-gl/maplibre |
| **타일 서버** | mapbox://styles/mapbox/light-v11 | OpenFreeMap (positron) |
| **API 키** | NEXT_PUBLIC_MAPBOX_TOKEN | 없음 (불필요) |
| **정적 맵** | Mapbox Static Images API | 미니맵 컴포넌트 (MapLibre) |
| **CSS** | mapbox-gl/dist/mapbox-gl.css | maplibre-gl/dist/maplibre-gl.css |
| **CSS 접두사** | .mapboxgl-* | .maplibregl-* |
| **라이선스** | Mapbox 독점 (v3+) | BSD-3 (오픈소스) |

---

## 3. 기능 요구사항

### FR-1: 패키지 교체
- `mapbox-gl`, `@types/mapbox-gl` 제거
- `maplibre-gl` 설치
- `react-map-gl` 유지 (import 경로만 변경)

### FR-2: Import 경로 변경 (6개 파일)
모든 `react-map-gl/mapbox` → `react-map-gl/maplibre`

| 파일 | 변경 대상 |
|------|----------|
| `src/components/map/MapView.tsx` | Map, MapRef, MapMouseEvent import |
| `src/components/map/ClusterSource.tsx` | Source, Layer import |
| `src/components/map/map-layers.ts` | LayerProps import |
| `src/components/map/MapControls.tsx` | NavigationControl, GeolocateControl import |
| `src/components/map/POIPopup.tsx` | Popup import |
| `src/components/map/MapShell.tsx` | MapRef import |

### FR-3: 맵 스타일 URL 변경
- 현재: `"mapbox://styles/mapbox/light-v11"`
- 변경: `"https://tiles.openfreemap.org/styles/positron"` (또는 동등 무료 스타일)
- `src/lib/constants.ts`의 `MAP_STYLE` 상수 갱신

### FR-4: Access Token 제거
- `MapView.tsx`에서 `mapboxAccessToken` prop 제거
- `.env.local`의 `NEXT_PUBLIC_MAPBOX_TOKEN` 제거 (또는 주석 처리)

### FR-5: CSS 변경
- `globals.css`: `@import "mapbox-gl/dist/mapbox-gl.css"` → `@import "maplibre-gl/dist/maplibre-gl.css"`
- CSS 선택자 접두사 변경:
  - `.mapboxgl-popup-content` → `.maplibregl-popup-content`
  - `.mapboxgl-popup-close-button` → `.maplibregl-popup-close-button`
  - `.mapboxgl-ctrl-group` → `.maplibregl-ctrl-group`

### FR-6: 폰트 변경
- `map-layers.ts`의 `text-font`: `"DIN Pro Medium"` → OpenFreeMap 스타일에 포함된 폰트로 변경
- (예: `"Open Sans Bold"` 또는 `"Noto Sans Regular"`)

### FR-7: 정적 맵 → 미니맵 컴포넌트
- `SpotHero.tsx`의 Mapbox Static Images API URL 제거
- MapLibre 기반 인터랙티브 미니맵 컴포넌트로 교체
- 기능: POI 위치에 마커 표시, 줌/패닝 비활성화 (정적 뷰)
- 크기: 현재와 동일 (h-48~h-72)

### FR-8: Next.js 설정 변경
- `next.config.ts`의 `remotePatterns`에서 `api.mapbox.com` 제거
- (미니맵은 클라이언트 렌더링이므로 이미지 도메인 불필요)

### FR-9: TypeScript 타입 호환
- `mapboxgl.GeoJSONSource` 타입 캐스팅 → `maplibregl.GeoJSONSource`로 변경
- `MapView.tsx`의 클러스터 확장 줌 계산 부분 확인

---

## 4. 비기능 요구사항

### NFR-1: 성능
- WebGL 렌더링 유지 (현재와 동일한 성능)
- 번들 사이즈 동급 유지 (~800KB)

### NFR-2: 접근성
- 기존 키보드/스크린리더 지원 유지

### NFR-3: SSR 호환
- `MapShellLoader.tsx`의 `dynamic({ ssr: false })` 패턴 유지

### NFR-4: 무료 운영
- API 키 불필요, 가입 절차 불필요
- OpenFreeMap: 사용량 제한 없음 (기부 기반)

---

## 5. 문서 갱신 요구사항

### DOC-1: REQUIREMENTS.md
- Section 3.1: "Mapbox GL JS" → "MapLibre GL JS"
- Section 4.1.1: Mapbox 참조 → MapLibre로 갱신
- Section 8: Mapbox Light style → OpenFreeMap positron
- Section 11: Mapbox 무료 티어 관련 Q&A 삭제/갱신

### DOC-2: 환경 설정 문서
- `.env.local` 템플릿에서 `NEXT_PUBLIC_MAPBOX_TOKEN` 제거
- README 또는 설정 가이드에서 Mapbox 가입 안내 제거

### DOC-3: MEMORY.md (Auto Memory)
- react-map-gl import 경로: `react-map-gl/maplibre`
- 타일 서버: OpenFreeMap
- CSS 접두사: `.maplibregl-*`

---

## 6. 테스트 계획

### T-1: 빌드 검증
- [ ] `npm run build` 성공 (에러 없음)
- [ ] TypeScript 타입 체크 통과
- [ ] 정적 페이지 생성 확인 (57페이지)

### T-2: 맵 기본 기능
- [ ] 지도 정상 로딩 (OpenFreeMap 타일)
- [ ] 한국 중심 초기 뷰 (lng: 127.77, lat: 35.91, zoom: 7)
- [ ] maxBounds 작동 (한반도 영역 제한)
- [ ] 줌 인/아웃 정상
- [ ] 패닝 정상

### T-3: 클러스터링
- [ ] 줌 아웃 시 POI 클러스터 표시
- [ ] 클러스터 숫자 라벨 표시
- [ ] 클러스터 클릭 시 확대 (getClusterExpansionZoom)
- [ ] 카테고리별 색상 구분 (unclustered-point)

### T-4: POI 인터랙션
- [ ] POI 클릭 시 Popup 표시
- [ ] Popup 내용 정상 (이름, 카테고리 등)
- [ ] Popup 닫기 버튼 작동
- [ ] POI 호버 시 커서 변경 (pointer)

### T-5: 컨트롤
- [ ] NavigationControl 표시 (줌 버튼)
- [ ] GeolocateControl 작동 (위치 추적)

### T-6: 네비게이션
- [ ] flyTo 애니메이션 정상 (POI 선택 시)
- [ ] 검색 결과에서 POI 선택 시 맵 이동

### T-7: 상세 페이지 미니맵
- [ ] SpotHero 미니맵 정상 로딩
- [ ] POI 위치에 마커 표시
- [ ] 적절한 줌 레벨 (13)
- [ ] 카테고리 색상 마커

### T-8: 반응형/모바일
- [ ] 모바일 뷰 정상 (터치 인터랙션)
- [ ] 태블릿/데스크톱 뷰 정상

### T-9: i18n
- [ ] 한국어(ko) 로케일에서 맵 정상
- [ ] 영어(en) 로케일에서 맵 정상

### T-10: 성능
- [ ] 초기 로딩 시간 현재와 동등
- [ ] 타일 로딩 속도 확인
- [ ] 메모리 누수 없음 (컴포넌트 언마운트 시)

---

## 7. 변경 영향 범위

### 변경 파일 목록 (예상)

| 파일 | 변경 유형 |
|------|----------|
| `package.json` | 의존성 교체 |
| `src/components/map/MapView.tsx` | import 경로 + token 제거 |
| `src/components/map/ClusterSource.tsx` | import 경로 |
| `src/components/map/map-layers.ts` | import 경로 + 폰트 |
| `src/components/map/MapControls.tsx` | import 경로 |
| `src/components/map/POIPopup.tsx` | import 경로 |
| `src/components/map/MapShell.tsx` | import 경로 |
| `src/components/spot/SpotHero.tsx` | 정적맵 → 미니맵 컴포넌트 |
| `src/lib/constants.ts` | MAP_STYLE URL |
| `src/app/globals.css` | CSS import + 선택자 접두사 |
| `next.config.ts` | remotePatterns 제거 |
| `.env.local` | MAPBOX_TOKEN 제거 |
| `REQUIREMENTS.md` | Mapbox 참조 갱신 |

---

## 8. 미해결 사항 / 리스크

| 항목 | 설명 | 대응 |
|------|------|------|
| OpenFreeMap 안정성 | 기부 기반 서비스, SLA 없음 | 소규모 앱에 적합. 필요 시 MapTiler 무료 티어로 대체 가능 |
| 폰트 호환 | OpenFreeMap 스타일의 가용 폰트 확인 필요 | 빌드 시 확인 후 조정 |
| GeoJSON Source 타입 | maplibregl.GeoJSONSource 호환 확인 | 동일 API이나 타입 임포트 경로 다를 수 있음 |

---

## 9. 수용 기준 (Acceptance Criteria)

1. Mapbox 관련 패키지(`mapbox-gl`, `@types/mapbox-gl`) 완전 제거
2. `NEXT_PUBLIC_MAPBOX_TOKEN` 환경변수 불필요
3. 모든 지도 기능 동일하게 작동 (클러스터링, Popup, flyTo, 컨트롤)
4. 상세 페이지에 미니맵 컴포넌트 정상 표시
5. `npm run build` 성공, 57개 정적 페이지 생성
6. REQUIREMENTS.md 등 문서에서 Mapbox 참조 제거/갱신
7. 테스트 계획 T-1 ~ T-10 전체 통과

---

## 10. 다음 단계

이 요구사항 명세 승인 후:
1. `/sc:workflow` → 구현 워크플로우 생성
2. `/sc:implement` → 실제 코드 변경 수행
3. `/sc:test` → 테스트 실행 및 검증
