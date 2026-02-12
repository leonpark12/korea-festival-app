import type { Region } from "@/types/poi";

export const REGIONS: Region[] = [
  {
    code: "seoul",
    name: { ko: "서울", en: "Seoul" },
    center: [126.978, 37.5665],
    bbox: [126.764, 37.4283, 127.184, 37.7017],
  },
  {
    code: "busan",
    name: { ko: "부산", en: "Busan" },
    center: [129.0756, 35.1796],
    bbox: [128.859, 35.0467, 129.292, 35.3833],
  },
  {
    code: "daegu",
    name: { ko: "대구", en: "Daegu" },
    center: [128.6014, 35.8714],
    bbox: [128.349, 35.7667, 128.854, 36.0267],
  },
  {
    code: "incheon",
    name: { ko: "인천", en: "Incheon" },
    center: [126.7052, 37.4563],
    bbox: [126.3, 37.15, 127.0, 37.7],
  },
  {
    code: "gwangju",
    name: { ko: "광주", en: "Gwangju" },
    center: [126.8526, 35.1595],
    bbox: [126.719, 35.05, 127.0, 35.275],
  },
  {
    code: "daejeon",
    name: { ko: "대전", en: "Daejeon" },
    center: [127.3845, 36.3504],
    bbox: [127.2, 36.2, 127.55, 36.5],
  },
  {
    code: "ulsan",
    name: { ko: "울산", en: "Ulsan" },
    center: [129.3114, 35.5384],
    bbox: [129.0, 35.35, 129.55, 35.75],
  },
  {
    code: "sejong",
    name: { ko: "세종", en: "Sejong" },
    center: [127.0, 36.48],
    bbox: [126.85, 36.35, 127.15, 36.65],
  },
  {
    code: "gyeonggi",
    name: { ko: "경기", en: "Gyeonggi" },
    center: [127.0, 37.4138],
    bbox: [126.386, 36.892, 127.617, 38.284],
  },
  {
    code: "gangwon",
    name: { ko: "강원", en: "Gangwon" },
    center: [128.3115, 37.8228],
    bbox: [127.05, 37.02, 129.4, 38.62],
  },
  {
    code: "chungbuk",
    name: { ko: "충북", en: "Chungbuk" },
    center: [127.7, 36.8],
    bbox: [127.2, 36.35, 128.3, 37.15],
  },
  {
    code: "chungnam",
    name: { ko: "충남", en: "Chungnam" },
    center: [126.8, 36.5],
    bbox: [125.9, 36.0, 127.4, 37.0],
  },
  {
    code: "jeonbuk",
    name: { ko: "전북", en: "Jeonbuk" },
    center: [127.15, 35.82],
    bbox: [126.35, 35.4, 127.9, 36.15],
  },
  {
    code: "jeonnam",
    name: { ko: "전남", en: "Jeonnam" },
    center: [126.99, 34.87],
    bbox: [125.9, 34.0, 127.9, 35.5],
  },
  {
    code: "gyeongbuk",
    name: { ko: "경북", en: "Gyeongbuk" },
    center: [128.8, 36.4],
    bbox: [128.0, 35.6, 129.6, 37.1],
  },
  {
    code: "gyeongnam",
    name: { ko: "경남", en: "Gyeongnam" },
    center: [128.2, 35.4],
    bbox: [127.5, 34.5, 129.0, 35.95],
  },
  {
    code: "jeju",
    name: { ko: "제주", en: "Jeju" },
    center: [126.5312, 33.4996],
    bbox: [126.1, 33.1, 126.97, 33.95],
  },
];

export const REGION_MAP = Object.fromEntries(
  REGIONS.map((r) => [r.code, r])
) as Record<string, Region>;
