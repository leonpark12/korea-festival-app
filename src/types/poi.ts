export type Category =
  | "attraction"
  | "restaurant"
  | "accommodation"
  | "shopping"
  | "festival"
  | "culture"
  | "nature"
  | "leisure";

export type RegionCode =
  | "seoul"
  | "busan"
  | "daegu"
  | "incheon"
  | "gwangju"
  | "daejeon"
  | "ulsan"
  | "sejong"
  | "gyeonggi"
  | "gangwon"
  | "chungbuk"
  | "chungnam"
  | "jeonbuk"
  | "jeonnam"
  | "gyeongbuk"
  | "gyeongnam"
  | "jeju";

export interface POISummary {
  id: string;
  slug: string;
  name: string;
  address: string;
  category: Category;
  appCategory?: Category;
  region: RegionCode;
  coordinates: { lat: number; lng: number };
  thumbnail?: string;
}

export interface POIInfoItem {
  // 범용 (12,14,15,28,38,39)
  infoname?: string;
  infotext?: string;
  fldgubun?: string;
  serialnum?: string;
  // 여행코스(25)
  subnum?: string;
  subcontentid?: string;
  subname?: string;
  subdetailoverview?: string;
  subdetailimg?: string;
  subdetailalt?: string;
  // 숙박(32) 객실정보
  roomtitle?: string;
  roomsize1?: string;
  roomsize2?: string;
  roomcount?: string;
  roombasecount?: string;
  roommaxcount?: string;
  roomoffseasonminfee1?: string;
  roomoffseasonminfee2?: string;
  roompeakseasonminfee1?: string;
  roompeakseasonminfee2?: string;
  roomintro?: string;
  roombathfacility?: string;
  roomaircondition?: string;
  roomtv?: string;
  roompc?: string;
  roomcable?: string;
  roominternet?: string;
  roomrefrigerator?: string;
  roomtoiletries?: string;
  roomsofa?: string;
  roomcook?: string;
  roomtable?: string;
  roomhairdryer?: string;
  roomimg1?: string;
  roomimg2?: string;
  roomimg3?: string;
  roomimg4?: string;
  roomimg5?: string;
  [key: string]: string | undefined;
}

export interface POIIntroItem {
  // === 공통 ===
  infocenter?: string;
  restdate?: string;
  usetime?: string;
  parking?: string;
  expguide?: string;
  chkbabycarriage?: string;
  chkcreditcard?: string;
  opendate?: string;

  // === 관광지(12) ===
  chkpet?: string;
  heritage1?: string;
  heritage2?: string;
  heritage3?: string;
  expagerange?: string;
  accomcount?: string;
  useseason?: string;

  // === 문화시설(14) ===
  usetimeculture?: string;
  restdateculture?: string;
  parkingculture?: string;
  infocenterculture?: string;
  chkbabycarriageculture?: string;
  chkcreditcardculture?: string;
  chkpetculture?: string;
  accomcountculture?: string;
  usefee?: string;
  spendtime?: string;
  scale?: string;
  discountinfo?: string;
  parkingfee?: string;

  // === 축제(15) ===
  usetimefestival?: string;
  eventstartdate?: string;
  eventenddate?: string;
  eventplace?: string;
  program?: string;
  sponsor1?: string;
  sponsor1tel?: string;
  sponsor2?: string;
  sponsor2tel?: string;
  spendtimefestival?: string;
  agelimit?: string;
  playtime?: string;
  festivalgrade?: string;

  // === 여행코스(25) ===
  distance?: string;
  taketime?: string;
  theme?: string;
  schedule?: string;
  infocentertourcourse?: string;

  // === 레포츠(28) ===
  usetimeleports?: string;
  restdateleports?: string;
  parkingleports?: string;
  parkingfeeleports?: string;
  infocenterleports?: string;
  chkcreditcardleports?: string;
  chkbabycarriageleports?: string;
  chkpetleports?: string;
  accomcountleports?: string;
  expagerangeleports?: string;
  usefeeleports?: string;
  reservation?: string;
  openperiod?: string;
  scaleleports?: string;

  // === 숙박(32) ===
  checkintime?: string;
  checkouttime?: string;
  roomcount?: string;
  roomtype?: string;
  subfacility?: string;
  refundregulation?: string;
  chkcooking?: string;
  foodplace?: string;
  infocenterlodging?: string;
  parkinglodging?: string;
  pickup?: string;
  reservationlodging?: string;
  reservationurl?: string;
  accomcountlodging?: string;
  scalelodging?: string;
  barbecue?: string;
  beauty?: string;
  beverage?: string;
  bicycle?: string;
  campfire?: string;
  fitness?: string;
  karaoke?: string;
  publicbath?: string;
  publicpc?: string;
  sauna?: string;
  seminar?: string;
  sports?: string;

  // === 쇼핑(38) ===
  opentime?: string;
  restdateshopping?: string;
  parkingshopping?: string;
  infocentershopping?: string;
  chkbabycarriageshopping?: string;
  chkcreditcardshopping?: string;
  chkpetshopping?: string;
  saleitem?: string;
  saleitemcost?: string;
  shopguide?: string;
  fairday?: string;
  opendateshopping?: string;
  restroom?: string;
  culturecenter?: string;
  scaleshopping?: string;

  // === 음식점(39) ===
  opentimefood?: string;
  restdatefood?: string;
  parkingfood?: string;
  infocenterfood?: string;
  chkcreditcardfood?: string;
  firstmenu?: string;
  treatmenu?: string;
  packing?: string;
  seat?: string;
  smoking?: string;
  kidsfacility?: string;
  opendatefood?: string;
  reservationfood?: string;
  scalefood?: string;
  lcnsno?: string;
  discountinfofood?: string;

  [key: string]: string | undefined;
}

export interface POIPetInfo {
  acmpyTypeCd?: string;
  etcAcmpyInfo?: string;
  acmpyPsblCpam?: string;
  acmpyNeedMtr?: string;
  relaAcdntRiskMtr?: string;
  relaFrnshPrdlst?: string;
  relaPosesFclty?: string;
  relaPurcPrdlst?: string;
  relaRntlPrdlst?: string;
}

export interface NearbyPOI extends POISummary {
  description?: string;
  distance?: number; // meters
}

export interface POI extends POISummary {
  description?: string;
  images?: string[];
  contact?: string;
  website?: string;
  tags?: string[];
  updatedAt: string;
  mlevel?: number;
  intro?: POIIntroItem[];
  info?: POIInfoItem[];
  pet?: POIPetInfo;
  detailPetUpdated?: boolean;
}

export interface POIGeoJSONProperties {
  id: string;
  slug: string;
  category: Category;
  name: string;
  region: RegionCode;
  /** 서버사이드 region 클러스터 전용 */
  cluster?: boolean;
  point_count?: number;
  point_count_abbreviated?: string;
}

export interface POIGeoJSON {
  type: "FeatureCollection";
  features: POIFeature[];
  metadata?: {
    totalCount: number;
    sparse: boolean;
  };
}

export interface POIFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: POIGeoJSONProperties;
}

export interface CategoryCardGroup {
  category: Category;
  total: number;
  items: POISummary[];
}

export interface Region {
  code: RegionCode;
  name: {
    ko: string;
    en: string;
  };
  center: [number, number]; // [lng, lat]
  bbox: [number, number, number, number]; // [west, south, east, north]
}
