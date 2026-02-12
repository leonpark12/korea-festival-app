# Data Schema Documentation

정적 데이터 파일의 구조, 타입 정의, 확장 방법을 문서화.

---

## 파일 구조

```
src/data/
├── pois.json        # POI 전체 메타데이터 (25개)
├── pois.geo.json    # GeoJSON FeatureCollection (맵 렌더링용)
└── regions.json     # 행정구역 정보 (17개)
```

---

## POI (Point of Interest)

### TypeScript 인터페이스

```typescript
// src/types/poi.ts

interface POI {
  id: string;                      // 고유 ID (예: "namsan-tower")
  slug: string;                    // URL 경로용 (예: "namsan-tower")
  category: Category;              // 카테고리 코드
  coordinates: {
    lat: number;                   // 위도 (예: 37.5512)
    lng: number;                   // 경도 (예: 126.9882)
  };
  name: {
    ko: string;                    // 한국어 이름
    en: string;                    // 영어 이름
  };
  address: {
    ko: string;                    // 한국어 주소
    en: string;                    // 영어 주소
  };
  description?: {                  // 선택 필드
    ko: string;
    en: string;
  };
  region: RegionCode;              // 행정구역 코드
  images?: string[];               // 이미지 URL 배열
  contact?: string;                // 전화번호
  website?: string;                // 웹사이트 URL
  tags?: string[];                 // 태그 배열
  updatedAt: string;               // ISO 8601 날짜 (sitemap용)
}
```

### `pois.json` 예시

```json
{
  "id": "namsan-tower",
  "slug": "namsan-tower",
  "category": "attraction",
  "coordinates": { "lat": 37.5512, "lng": 126.9882 },
  "name": { "ko": "남산서울타워", "en": "Namsan Seoul Tower" },
  "address": {
    "ko": "서울특별시 용산구 남산공원길 105",
    "en": "105 Namsangongwon-gil, Yongsan-gu, Seoul"
  },
  "description": {
    "ko": "서울의 상징적인 랜드마크...",
    "en": "An iconic landmark of Seoul..."
  },
  "region": "seoul",
  "images": ["/images/namsan-tower.jpg"],
  "contact": "02-3455-9277",
  "website": "https://www.seoultower.co.kr",
  "tags": ["랜드마크", "야경", "전망대"],
  "updatedAt": "2024-01-15"
}
```

---

## Category (카테고리)

### 타입 정의

```typescript
type Category =
  | "attraction"      // 관광지
  | "restaurant"      // 맛집
  | "accommodation"   // 숙박
  | "shopping"        // 쇼핑
  | "festival"        // 축제
  | "culture"         // 문화
  | "nature"          // 자연
  | "leisure";        // 레저
```

### 카테고리 메타데이터

`src/lib/categories.ts`에서 관리:

| ID | 색상 | 아이콘 | 한국어 | 영어 |
|----|------|--------|--------|------|
| `attraction` | `#FF6B6B` | 🏛️ | 관광지 | Attractions |
| `restaurant` | `#FFA94D` | 🍽️ | 맛집 | Restaurants |
| `accommodation` | `#69DB7C` | 🏨 | 숙박 | Accommodation |
| `shopping` | `#9775FA` | 🛍️ | 쇼핑 | Shopping |
| `festival` | `#FF8787` | 🎪 | 축제 | Festivals |
| `culture` | `#748FFC` | 🎭 | 문화 | Culture |
| `nature` | `#38D9A9` | 🌿 | 자연 | Nature |
| `leisure` | `#F783AC` | 🎢 | 레저 | Leisure |

### 접근 방법

```typescript
import { CATEGORIES, CATEGORY_MAP } from "@/lib/categories";

// 배열 순회
CATEGORIES.forEach(cat => console.log(cat.label.ko));

// ID로 직접 접근
const nature = CATEGORY_MAP["nature"];
// → { id: "nature", color: "#38D9A9", icon: "🌿", label: { ko: "자연", en: "Nature" } }
```

---

## GeoJSON (맵 렌더링용)

### TypeScript 인터페이스

```typescript
interface POIGeoJSON {
  type: "FeatureCollection";
  features: POIFeature[];
}

interface POIFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat] (GeoJSON 표준)
  };
  properties: POIGeoJSONProperties;
}

interface POIGeoJSONProperties {
  id: string;
  slug: string;
  category: Category;
  name_ko: string;          // 플랫 구조 (중첩 아님)
  name_en: string;
  region: RegionCode;
}
```

### `pois.geo.json` 예시

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [126.9882, 37.5512]
      },
      "properties": {
        "id": "namsan-tower",
        "slug": "namsan-tower",
        "category": "attraction",
        "name_ko": "남산서울타워",
        "name_en": "Namsan Seoul Tower",
        "region": "seoul"
      }
    }
  ]
}
```

### pois.json vs pois.geo.json 차이

| 항목 | `pois.json` | `pois.geo.json` |
|------|-------------|-----------------|
| 용도 | 전체 메타데이터 (목록, 상세, 검색) | 맵 렌더링 전용 |
| 크기 | ~25KB (25개 기준) | ~8KB |
| 좌표 형식 | `{ lat, lng }` | `[lng, lat]` (GeoJSON 표준) |
| 이름 구조 | `{ ko, en }` 중첩 | `name_ko`, `name_en` 플랫 |
| 포함 정보 | 주소, 설명, 연락처, 이미지, 태그 등 | id, slug, category, name, region만 |

**왜 분리했는가**: 맵 소스에는 최소한의 데이터만 전달하여 렌더링 성능 최적화. 상세 정보는 팝업 클릭 시 `pois.json`에서 조회.

---

## Region (행정구역)

### TypeScript 인터페이스

```typescript
type RegionCode =
  | "seoul" | "busan" | "daegu" | "incheon"
  | "gwangju" | "daejeon" | "ulsan" | "sejong"
  | "gyeonggi" | "gangwon" | "chungbuk" | "chungnam"
  | "jeonbuk" | "jeonnam" | "gyeongbuk" | "gyeongnam"
  | "jeju";

interface Region {
  code: RegionCode;
  name: {
    ko: string;              // 한국어 명칭
    en: string;              // 영어 명칭
  };
  center: [number, number]; // [lng, lat] 중심 좌표
  bbox: [number, number, number, number]; // [west, south, east, north]
}
```

### 접근 방법

```typescript
import { REGIONS, REGION_MAP } from "@/lib/regions";

// 배열 순회
REGIONS.forEach(r => console.log(r.name.ko));

// 코드로 직접 접근
const seoul = REGION_MAP["seoul"];
// → { code: "seoul", name: { ko: "서울", en: "Seoul" }, center: [126.978, 37.5665], bbox: [...] }
```

---

## Data Loader

> `src/lib/data-loader.ts`

정적 데이터에 접근하는 유틸리티 함수.

| 함수 | 반환 타입 | 설명 |
|------|----------|------|
| `getAllPOIs()` | `POI[]` | 전체 POI 배열 |
| `getPOIBySlug(slug)` | `POI \| undefined` | slug로 단일 POI 조회 |
| `getAllSlugs()` | `string[]` | 전체 slug 목록 (SSG용) |
| `getGeoJSON()` | `POIGeoJSON` | GeoJSON FeatureCollection |
| `getNearbyPOIs(lat, lng, excludeSlug, limit?)` | `POI[]` | 유클리드 거리 기반 주변 POI |

### 사용 컨텍스트

| 함수 | 사용처 | 컨텍스트 |
|------|--------|---------|
| `getAllPOIs()` | `generateStaticParams()`, `MapShell` | Server / Client |
| `getPOIBySlug()` | `spots/[slug]/page.tsx` | Server (SSG) |
| `getAllSlugs()` | `sitemap.ts` | Server |
| `getGeoJSON()` | `MapShell` (import) | Client |
| `getNearbyPOIs()` | `spots/[slug]/page.tsx` | Server (SSG) |

---

## 새 POI 추가 방법

### 1. `pois.json`에 데이터 추가

```json
{
  "id": "your-poi-id",
  "slug": "your-poi-slug",
  "category": "nature",
  "coordinates": { "lat": 33.3617, "lng": 126.5292 },
  "name": { "ko": "새 관광지", "en": "New Attraction" },
  "address": { "ko": "주소", "en": "Address" },
  "description": { "ko": "설명", "en": "Description" },
  "region": "jeju",
  "tags": ["태그1", "태그2"],
  "updatedAt": "2024-12-01"
}
```

### 2. `pois.geo.json`에 Feature 추가

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [126.5292, 33.3617]
  },
  "properties": {
    "id": "your-poi-id",
    "slug": "your-poi-slug",
    "category": "nature",
    "name_ko": "새 관광지",
    "name_en": "New Attraction",
    "region": "jeju"
  }
}
```

### 3. 빌드 확인

```bash
npm run build
# 새 POI의 상세 페이지가 SSG로 생성되는지 확인
```

### 체크리스트

- [ ] `pois.json`과 `pois.geo.json`의 id/slug가 일치하는지
- [ ] 좌표 형식: `pois.json`은 `{ lat, lng }`, `pois.geo.json`은 `[lng, lat]`
- [ ] `category`가 8개 유효값 중 하나인지
- [ ] `region`이 17개 유효값 중 하나인지
- [ ] `updatedAt`이 ISO 8601 형식인지

---

## 새 카테고리 추가 방법

1. `src/types/poi.ts`의 `Category` 타입에 추가
2. `src/lib/categories.ts`의 `CATEGORIES` 배열에 메타데이터 추가
3. `src/app/globals.css`에 `--color-cat-{name}` CSS 변수 추가
4. 번역 파일 업데이트 불필요 (카테고리 라벨은 `categories.ts`에서 직접 관리)

---

## 새 지역 추가 방법

1. `src/types/poi.ts`의 `RegionCode` 타입에 추가
2. `src/lib/regions.ts`의 `REGIONS` 배열에 추가 (code, name, center, bbox)
3. 지역 드롭다운에 자동 반영됨
