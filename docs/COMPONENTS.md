# Component API Reference

모든 컴포넌트의 Props 인터페이스, 사용법, 의존관계를 정리한 레퍼런스.

---

## Layout 컴포넌트

### `Header`
> `src/components/layout/Header.tsx`

앱 상단 고정 헤더. 로고와 언어 전환 버튼을 포함한다.

| 속성 | 없음 | - |
|------|------|---|

**내부 구성**: `Logo` + `LocaleSwitcher`

```tsx
<Header />
```

---

### `Logo`
> `src/components/layout/Logo.tsx`

홈으로 이동하는 앱 로고 링크.

| 속성 | 없음 | - |
|------|------|---|

next-intl의 `Link`를 사용하여 현재 로케일에 맞는 `/` 경로로 이동.

---

### `LocaleSwitcher`
> `src/components/layout/LocaleSwitcher.tsx`

현재 로케일을 토글하는 버튼 (KO ↔ EN).

| 속성 | 없음 | - |
|------|------|---|

next-intl의 `useRouter().replace(pathname, { locale })` 사용.

---

## Map 컴포넌트

### `MapShellLoader`
> `src/components/map/MapShellLoader.tsx`

`MapShell`을 `next/dynamic`으로 로드하는 Client Component 래퍼.

| 속성 | 없음 | - |
|------|------|---|

**필수 패턴**: `"use client"` + `dynamic(() => import("./MapShell"), { ssr: false })`
Next.js 16에서 `ssr: false`는 반드시 Client Component 내에서 사용해야 한다.

---

### `MapShell`
> `src/components/map/MapShell.tsx`

앱의 메인 클라이언트 경계. 맵, 패널, 검색, 필터의 모든 상태를 관리한다.

| 속성 | 없음 | - |
|------|------|---|

**내부 상태 관리**:

| 상태 | 소스 | 설명 |
|------|------|------|
| `filters` | `useQueryParams()` | URL 쿼리 파라미터 기반 필터 |
| `viewState` | `useState<MapViewState>` | 맵 카메라 상태 |
| `searchResults` | `useState<POI[]>` | Fuse.js 검색 결과 |
| `isDesktop` | `useIsDesktop()` | 반응형 분기 |

**제공하는 핸들러**:

| 핸들러 | 설명 |
|--------|------|
| `handleSearch(query)` | URL에 검색어 저장 + Fuse.js 검색 실행 |
| `handleSelectPOI(slug)` | URL에 POI 저장 + 맵 flyTo 애니메이션 |
| `handleToggleCategory(cat)` | 카테고리 토글 (다중 선택) |
| `handleSelectRegion(region)` | 지역 단일 선택 |

**Suspense**: `useSearchParams()`를 사용하므로 `<Suspense>`로 래핑 필수.

---

### `MapView`
> `src/components/map/MapView.tsx`

react-map-gl + MapLibre GL JS 기반 인터랙티브 맵.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `POIGeoJSON` | Yes | 필터링된 GeoJSON 데이터 |
| `viewState` | `MapViewState` | Yes | 맵 카메라 상태 (lng, lat, zoom) |
| `onViewStateChange` | `(vs: MapViewState) => void` | Yes | 맵 이동 시 호출 |
| `selectedPOI` | `POI \| null` | Yes | 현재 선택된 POI (팝업 표시용) |
| `onSelectPOI` | `(slug: string \| null) => void` | Yes | POI 선택/해제 시 호출 |
| `mapRef` | `RefObject<MapRef \| null>` | No | 외부 맵 참조 |

**인터랙션**:
- 클러스터 클릭 → `getClusterExpansionZoom()` → flyTo
- 개별 마커 클릭 → `onSelectPOI(slug)` + flyTo
- 빈 영역 클릭 → `onSelectPOI(null)`
- 마우스 진입 → 포인터 커서

**맵 제한**: `maxBounds={[[122, 32], [132, 40]]}` (한반도 영역)

---

### `ClusterSource`
> `src/components/map/ClusterSource.tsx`

GeoJSON Source + 3개 레이어 (클러스터, 카운트, 개별 마커)를 렌더링.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `POIGeoJSON` | Yes | GeoJSON FeatureCollection |

```tsx
<Source id="pois" type="geojson" data={data} cluster={true}
        clusterMaxZoom={14} clusterRadius={50}>
  <Layer {...clusterLayer} />
  <Layer {...clusterCountLayer} />
  <Layer {...unclusteredPointLayer} />
</Source>
```

---

### `MapControls`
> `src/components/map/MapControls.tsx`

맵 컨트롤 버튼 (현위치 + 줌).

| 속성 | 없음 | - |
|------|------|---|

GeolocateControl (trackUserLocation) + NavigationControl (showCompass: false).

---

### `POIPopup`
> `src/components/map/POIPopup.tsx`

선택된 POI의 맵 위 팝업.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poi` | `POI` | Yes | 표시할 POI 데이터 |
| `onClose` | `() => void` | Yes | 팝업 닫기 핸들러 |

카테고리 배지, 이름, 주소, 설명(2줄 제한), "상세보기" 링크를 표시.

---

## Panel 컴포넌트

### `SidePanel`
> `src/components/panel/SidePanel.tsx`

데스크톱(≥1024px) 좌측 고정 패널.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pois` | `POI[]` | Yes | 필터링된 POI 목록 |
| `selectedSlug` | `string \| null` | Yes | 선택된 POI slug |
| `selectedCategories` | `string[]` | Yes | 활성 카테고리 필터 |
| `selectedRegion` | `string \| null` | Yes | 활성 지역 필터 |
| `searchResults` | `POI[]` | Yes | 검색 결과 |
| `onSearch` | `(query: string) => void` | Yes | 검색 실행 |
| `onToggleCategory` | `(cat: string) => void` | Yes | 카테고리 토글 |
| `onSelectRegion` | `(region: string \| null) => void` | Yes | 지역 선택 |
| `onSelectPOI` | `(slug: string) => void` | Yes | POI 선택 |

**레이아웃**: 너비 384px(`w-96`), `lg:flex`로 데스크톱에서만 표시.

---

### `BottomSheet`
> `src/components/panel/BottomSheet.tsx`

모바일(<1024px) 하단 시트 패널.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| (SidePanel과 동일) | | | |

**스냅 포인트**:

| 상태 | 높이 | 표시 내용 |
|------|------|-----------|
| `peek` | 120px | FilterChips만 표시 |
| `half` | 50vh | + SearchBar + POICardList |
| `full` | calc(100vh - 56px) | 전체 패널 |

터치 드래그 + 키보드 ArrowUp/Down으로 스냅 전환.

---

### `SearchBar`
> `src/components/panel/SearchBar.tsx`

cmdk 기반 검색 입력 + 자동완성 드롭다운.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSearch` | `(query: string) => void` | Yes | 검색어 변경 시 호출 |
| `searchResults` | `POI[]` | Yes | 검색 결과 목록 |
| `onSelect` | `(slug: string) => void` | Yes | 결과 항목 선택 시 호출 |
| `isOpen` | `boolean` | No | 드롭다운 외부 제어 |
| `onOpenChange` | `(open: boolean) => void` | No | 드롭다운 상태 변경 |

**주의**: `onSearch`를 `useRef`로 관리하여 useEffect 의존성 안정화.

---

### `FilterChips`
> `src/components/panel/FilterChips.tsx`

카테고리 칩 버튼 + 지역 셀렉트 박스.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedCategories` | `string[]` | Yes | 활성 카테고리 목록 |
| `selectedRegion` | `string \| null` | Yes | 선택된 지역 |
| `onToggleCategory` | `(cat: string) => void` | Yes | 카테고리 토글 |
| `onSelectRegion` | `(region: string \| null) => void` | Yes | 지역 선택 |

- 카테고리: 8개 칩 (다중 선택, `aria-pressed`), 모바일에서 가로 스크롤
- 지역: 17개 `<option>` + "전체" 드롭다운

---

### `POICardList`
> `src/components/panel/POICardList.tsx`

POI 카드 목록 + 결과 수 표시.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pois` | `POI[]` | Yes | 표시할 POI 배열 |
| `selectedSlug` | `string \| null` | Yes | 하이라이트할 POI slug |
| `onSelect` | `(slug: string) => void` | Yes | 카드 클릭 핸들러 |

`aria-live="polite"`로 결과 수 스크린리더 안내.

---

### `POICard`
> `src/components/panel/POICard.tsx`

개별 POI 카드.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poi` | `POI` | Yes | POI 데이터 |
| `onSelect` | `(slug: string) => void` | Yes | 클릭 핸들러 |
| `isSelected` | `boolean` | No | 선택 상태 하이라이트 |

선택 시 `border-primary + bg-primary/5 + shadow-md` 스타일 적용.

---

## Spot (상세 페이지) 컴포넌트

### `SpotHero`
> `src/components/spot/SpotHero.tsx` — `"use client"`

상세 페이지 상단 히어로 영역. 미니맵 + 오버레이 텍스트.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poi` | `POI` | Yes | POI 데이터 |
| `locale` | `"ko" \| "en"` | Yes | 현재 로케일 |

`SpotMiniMap`을 `next/dynamic`으로 로드 (ssr: false).

---

### `SpotMiniMap`
> `src/components/spot/SpotMiniMap.tsx` — `"use client"`

비대화형 미니 맵. POI 위치에 카테고리 색상 마커 표시.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `lng` | `number` | Yes | 경도 |
| `lat` | `number` | Yes | 위도 |
| `color` | `string` | Yes | 마커 색상 (카테고리 컬러) |

`interactive={false}` + `attributionControl={false}` 설정.

---

### `SpotInfo`
> `src/components/spot/SpotInfo.tsx`

POI 상세 정보 섹션.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poi` | `POI` | Yes | POI 데이터 |
| `locale` | `"ko" \| "en"` | Yes | 현재 로케일 |

설명, 주소, 연락처(`tel:` 링크), 웹사이트, Google Maps 링크, 태그 표시.

---

### `NearbySpots`
> `src/components/spot/NearbySpots.tsx`

주변 관광지 추천 (최대 4개).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `pois` | `POI[]` | Yes | 추천 POI 배열 |
| `locale` | `"ko" \| "en"` | Yes | 현재 로케일 |

유클리드 거리 기반으로 가장 가까운 POI를 `getNearbyPOIs()`에서 계산. `pois.length === 0`이면 렌더링하지 않음.

---

### `SpotJsonLd`
> `src/components/spot/SpotJsonLd.tsx`

SEO용 구조화 데이터 (`application/ld+json`).

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `poi` | `POI` | Yes | POI 데이터 |
| `locale` | `"ko" \| "en"` | Yes | 현재 로케일 |

`TouristAttraction` 스키마 타입으로 name, address, geo, url, telephone, image 포함.

---

## 컴포넌트 의존관계 트리

```
App (Server)
├── [locale]/layout.tsx (NextIntlClientProvider)
│   ├── [locale]/page.tsx → MapShellLoader (Client)
│   │                          └── MapShell
│   │                               ├── Header
│   │                               │   ├── Logo
│   │                               │   └── LocaleSwitcher
│   │                               ├── MapView
│   │                               │   ├── ClusterSource (map-layers)
│   │                               │   ├── MapControls
│   │                               │   └── POIPopup
│   │                               ├── SidePanel (desktop)
│   │                               │   ├── SearchBar
│   │                               │   ├── FilterChips
│   │                               │   └── POICardList → POICard
│   │                               └── BottomSheet (mobile)
│   │                                   ├── FilterChips
│   │                                   ├── SearchBar
│   │                                   └── POICardList → POICard
│   │
│   └── spots/[slug]/page.tsx (Server, SSG)
│       ├── SpotJsonLd
│       ├── SpotHero → SpotMiniMap (dynamic)
│       ├── SpotInfo
│       └── NearbySpots
```
