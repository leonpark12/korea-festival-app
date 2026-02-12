# Custom Hooks Guide

커스텀 hooks의 사용법, 내부 동작, 주의사항을 정리한 가이드.

---

## `useQueryParams`
> `src/hooks/useQueryParams.ts`

URL 검색 파라미터를 타입 안전한 `FilterState`로 래핑하는 hook.

### 반환값

```typescript
{
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string | string[] | null) => void;
  clearFilters: () => void;
}
```

### FilterState

```typescript
interface FilterState {
  categories: string[];     // URL: ?cat=nature,culture
  region: string | null;    // URL: ?region=seoul
  query: string;            // URL: ?q=한라산
  selectedPOI: string | null; // URL: ?poi=hallasan
}
```

### URL 파라미터 매핑

| FilterState 키 | URL 파라미터 | 형식 |
|----------------|-------------|------|
| `categories` | `cat` | 쉼표 구분 (`nature,culture`) |
| `region` | `region` | 단일 문자열 |
| `query` | `q` | 단일 문자열 |
| `selectedPOI` | `poi` | slug 문자열 |

### 사용 예시

```tsx
function MyComponent() {
  const { filters, setFilter, clearFilters } = useQueryParams();

  // 카테고리 토글
  const toggle = (cat: string) => {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    setFilter("categories", cats);
  };

  // 지역 선택
  setFilter("region", "seoul");   // 설정
  setFilter("region", null);      // 해제

  // 전체 초기화
  clearFilters();
}
```

### 내부 동작

1. `useSearchParams()`로 현재 URL 파라미터 읽기
2. `setFilter()` 호출 시 `router.replace()`로 URL 업데이트 (히스토리 쌓지 않음)
3. URL 변경 → React 리렌더링 → 새 `filters` 객체 생성

### 주의사항

- **Suspense 필수**: `useSearchParams()`를 사용하므로 상위에 `<Suspense>` 필요
- **searchParams Ref 패턴**: `searchParams`를 직접 의존성에 넣으면 무한 리렌더링 발생. `useRef`로 관리하여 `setFilter` 콜백의 참조 안정성 보장

```typescript
// 올바른 패턴 (현재 구현)
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams;

const setFilter = useCallback((...) => {
  const params = new URLSearchParams(searchParamsRef.current.toString());
  // ...
}, [router, pathname]); // searchParams 제외

// 잘못된 패턴 (무한루프 발생)
const setFilter = useCallback((...) => {
  const params = new URLSearchParams(searchParams.toString());
  // ...
}, [searchParams, router, pathname]); // searchParams 포함 → 무한루프
```

---

## `useFilteredGeoJSON`
> `src/hooks/useFilteredPOIs.ts`

GeoJSON FeatureCollection에 카테고리/지역 필터를 적용하는 hook.

### 시그니처

```typescript
function useFilteredGeoJSON(
  geojson: POIGeoJSON,
  filters: FilterState
): POIGeoJSON
```

### 동작

1. `filters.categories`가 비어있지 않으면 → 해당 카테고리만 필터
2. `filters.region`이 있으면 → 해당 지역만 필터
3. `useMemo`로 캐싱 (의존성: `geojson`, `filters.categories`, `filters.region`)

### 사용 예시

```tsx
const filteredGeoJSON = useFilteredGeoJSON(geojson, filters);
// → ClusterSource에 전달
<ClusterSource data={filteredGeoJSON} />
```

### 주의사항

- **검색어(`query`)는 필터링하지 않음**: 맵에는 모든 POI를 표시하고, 검색 결과는 별도 UI로 표시
- `filters.categories`와 `filters.region`만 의존성에 포함 (전체 `filters` 객체가 아님)

---

## `useFilteredPOIs`
> `src/hooks/useFilteredPOIs.ts`

POI 배열에 카테고리/지역 필터를 적용하는 hook.

### 시그니처

```typescript
function useFilteredPOIs(
  pois: POI[],
  filters: FilterState
): POI[]
```

### 동작

`useFilteredGeoJSON`과 동일한 필터 로직을 `POI[]`에 적용. `useMemo`로 캐싱.

### 사용 예시

```tsx
const filteredPOIs = useFilteredPOIs(allPois, filters);
// → POICardList에 전달
<POICardList pois={filteredPOIs} ... />
```

---

## `usePOISearch`
> `src/hooks/usePOISearch.ts`

Fuse.js 기반 클라이언트 퍼지 검색 hook.

### 시그니처

```typescript
function usePOISearch(pois: POI[]): {
  search: (query: string, limit?: number) => POI[];
}
```

### Fuse.js 설정

| 검색 키 | 가중치 |
|---------|--------|
| `name.ko` | 2 |
| `name.en` | 2 |
| `address.ko` | 1 |
| `address.en` | 1 |
| `tags` | 1.5 |

- **threshold**: 0.3 (낮을수록 정확한 매칭)
- **minMatchCharLength**: 1
- **기본 limit**: 10

### 사용 예시

```tsx
const { search } = usePOISearch(allPois);

// 검색 실행
const results = search("경복궁");     // POI[] 반환
const top5 = search("부산", 5);       // 최대 5개 반환
const empty = search("");             // 빈 배열 반환 (빈 문자열 무시)
```

### 내부 동작

1. `useMemo`로 Fuse.js 인덱스를 한 번만 생성
2. `useCallback`으로 `search` 함수 안정화
3. `useRef`로 Fuse 인스턴스 참조 유지

---

## `useMediaQuery`
> `src/hooks/useMediaQuery.ts`

CSS 미디어 쿼리를 React 상태로 변환하는 hook.

### 시그니처

```typescript
function useMediaQuery(query: string): boolean
```

### 사용 예시

```tsx
const isWide = useMediaQuery("(min-width: 1280px)");
```

### 내부 동작

1. `window.matchMedia(query)`로 MediaQueryList 생성
2. `change` 이벤트 리스너로 상태 업데이트
3. 클린업 시 이벤트 리스너 해제

### 주의사항

- **초기값은 `false`**: SSR 환경에서는 `window`가 없으므로 항상 `false`로 시작
- 클라이언트 hydration 후 실제 값으로 업데이트

---

## `useIsDesktop` / `useIsMobile`
> `src/hooks/useMediaQuery.ts`

`useMediaQuery`의 프리셋 래퍼.

```typescript
function useIsDesktop(): boolean  // (min-width: 1024px)
function useIsMobile(): boolean   // (max-width: 767px)
```

### 사용처

| Hook | 사용 컴포넌트 | 용도 |
|------|-------------|------|
| `useIsDesktop()` | `MapShell` | SidePanel vs BottomSheet 분기 |

---

## Hook 의존관계

```
MapShell
├── useQueryParams()          → FilterState + setFilter
├── useFilteredGeoJSON()      → 맵 데이터 필터링
├── useFilteredPOIs()         → 목록 데이터 필터링
├── usePOISearch()            → Fuse.js 검색 함수
└── useIsDesktop()            → 반응형 레이아웃 분기
```
