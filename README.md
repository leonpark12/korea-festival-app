# Korea Travel Map

한국 관광지를 인터랙티브 지도에서 탐색할 수 있는 반응형 웹 애플리케이션

🌐 **Live**: [korea-travel-map.vercel.app](https://korea-travel-map.vercel.app)

## Features

- **인터랙티브 지도**: MapLibre GL JS 기반, 마커 클러스터링 지원
- **MongoDB 백엔드**: 21,000+ POI 데이터, viewport 기반 로딩
- **카테고리별 카드뷰**: 8개 카테고리별 5개씩 그룹화하여 표시
- **카테고리 필터**: 관광지, 맛집, 숙박, 쇼핑, 축제, 문화, 자연, 레저
- **지역 필터**: 17개 시/도 단위 필터링
- **퍼지 검색**: MongoDB text search + cmdk 커맨드 팔레트
- **다국어**: 한국어/영어 (next-intl, URL prefix 방식)
- **반응형 레이아웃**: 데스크톱 사이드패널 / 모바일 바텀시트
- **상세 페이지**: POI별 ISR 페이지 (SEO 최적화, JSON-LD)
- **현재 위치**: Geolocation API 기반 위치 표시
- **Viewport 연동**: 지도 이동/줌 시 카드 목록 자동 업데이트

## Tech Stack

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | MongoDB | 6.x |
| Data Caching | SWR | 2.x |
| Map | react-map-gl + MapLibre GL JS | 8.x / 5.x |
| Tile Server | OpenFreeMap positron | API 키 불필요 |
| i18n | next-intl | 4.x |
| Search | MongoDB text search + cmdk | - / 1.x |
| Test | Vitest + Testing Library | 4.x |
| Deploy | Vercel | - |

## Getting Started

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트
npm run lint

# 테스트
npm run test
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### 환경변수

| 변수 | 용도 | 기본값 |
|------|------|--------|
| `MONGODB_URI` | MongoDB 연결 문자열 | - (필수) |
| `MONGODB_DB` | MongoDB 데이터베이스 이름 | `korea_tourism` |
| `NEXT_PUBLIC_SITE_URL` | sitemap/robots 베이스 URL | `https://korea-travel-map.vercel.app` |

> MapLibre + OpenFreeMap 사용으로 지도 관련 API 키가 필요하지 않습니다.

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── [locale]/               # 다국어 라우팅 (ko, en)
│   │   ├── page.tsx            # 메인 지도 페이지
│   │   └── spots/[slug]/      # POI 상세 페이지 (ISR)
│   └── api/                    # API Routes
│       ├── geojson/            # GeoJSON 데이터 API
│       ├── pois/               # POI 목록/검색 API
│       └── pois/[slug]/        # POI 상세 API
├── components/
│   ├── layout/                 # 헤더, 로고, 언어 전환
│   ├── map/                    # 지도 (MapShell, MapView, ClusterSource)
│   ├── panel/                  # 사이드패널, 바텀시트, 검색, 필터
│   └── spot/                   # 상세 페이지 컴포넌트
├── data/                       # 정적 JSON 데이터 (locale별 분리)
├── hooks/                      # 커스텀 React hooks
├── i18n/                       # next-intl 설정
├── lib/                        # 유틸리티, 상수, 데이터 로더
└── types/                      # TypeScript 타입 정의
```

## API Routes

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/pois?locale=ko` | GET | 전체 POI 목록 |
| `/api/pois/[slug]?locale=ko` | GET | 단일 POI 상세 |
| `/api/pois/search?q=...&locale=ko` | GET | MongoDB text/regex 검색 |
| `/api/pois/cards?locale=ko&bbox=...&zoom=...&per_category=5` | GET | 카테고리별 카드 (viewport 연동) |
| `/api/geojson?locale=ko&bbox=...&zoom=...` | GET | GeoJSON (viewport 기반) |
| `/api/db-setup` | POST | DB 인덱스 셋업 (1회 실행) |

## Architecture

- **MongoDB-backed**: 21,000+ POI 데이터를 MongoDB에서 viewport 기반으로 쿼리
- **Viewport 기반 로딩**: bbox + zoom으로 보이는 영역만 로드, SWR 캐싱
- **카테고리별 카드뷰**: 서버사이드 aggregation으로 카테고리별 5개씩 그룹화
- **URL as State**: URL search params로 필터 상태 관리 (글로벌 상태 라이브러리 없음)
- **Server → Client 경계**: Server Component → MapShellLoader (client) → MapShell (dynamic, ssr: false)
- **ISR**: 상세 페이지는 `revalidate=86400`으로 일 1회 재생성

## Deployment

Vercel에 자동 배포됩니다. `main` 브랜치에 push 시 프로덕션 배포가 트리거됩니다.

## License

Private
