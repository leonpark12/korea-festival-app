import { getDb } from "./mongodb";

/**
 * MongoDB 초기 셋업: location 필드 추가 + 인덱스 생성
 * 한 번만 실행하면 됩니다.
 */
export async function setupDatabase() {
  const db = await getDb();
  const results: string[] = [];

  for (const col of ["pois_kr", "pois_en"]) {
    const collection = db.collection(col);
    const count = await collection.countDocuments();
    results.push(`${col}: ${count} documents`);

    // 1. location GeoJSON 필드 전체 동기화 (coordinates → location)
    const locationSync = await collection.updateMany(
      {},
      [
        {
          $set: {
            location: {
              type: "Point",
              coordinates: ["$coordinates.lng", "$coordinates.lat"],
            },
          },
        },
      ]
    );
    results.push(
      `  → location 필드 동기화: ${locationSync.modifiedCount}건`
    );

    // 1-1. mlevel string → number 변환
    const mlevelFix = await collection.updateMany(
      { mlevel: { $type: "string" } },
      [{ $set: { mlevel: { $toInt: "$mlevel" } } }]
    );
    if (mlevelFix.modifiedCount > 0) {
      results.push(
        `  → mlevel 타입 변환: ${mlevelFix.modifiedCount}건`
      );
    }

    // 2. 인덱스 생성
    const indexes = await collection.indexes();
    const indexNames = indexes.map((i) => i.name);

    // 2dsphere 인덱스 (viewport bbox, $geoNear 쿼리)
    if (!indexNames.includes("location_2dsphere")) {
      await collection.createIndex(
        { location: "2dsphere" },
        { name: "location_2dsphere" }
      );
      results.push(`  → 인덱스 생성: location_2dsphere`);
    }

    // slug 유니크 인덱스 (상세 조회)
    if (!indexNames.includes("slug_1")) {
      await collection.createIndex({ slug: 1 }, { name: "slug_1", unique: true });
      results.push(`  → 인덱스 생성: slug_1 (unique)`);
    }

    // 기존 미사용 category_1_region_1 인덱스 제거
    if (indexNames.includes("category_1_region_1")) {
      await collection.dropIndex("category_1_region_1");
      results.push(`  → 인덱스 제거: category_1_region_1 (미사용)`);
    }

    // region 단일 인덱스 (region별 그룹/필터 쿼리)
    if (!indexNames.includes("region_1")) {
      await collection.createIndex(
        { region: 1 },
        { name: "region_1" }
      );
      results.push(`  → 인덱스 생성: region_1`);
    }

    // appCategory + region 복합 인덱스
    if (!indexNames.includes("appCategory_1_region_1")) {
      await collection.createIndex(
        { appCategory: 1, region: 1 },
        { name: "appCategory_1_region_1" }
      );
      results.push(`  → 인덱스 생성: appCategory_1_region_1`);
    }

    // 텍스트 인덱스 (검색) — description 포함
    const hasTextIndex = indexes.some((i) => i.name?.includes("text"));
    if (!hasTextIndex) {
      await collection.createIndex(
        { name: "text", address: "text", tags: "text", description: "text" },
        {
          name: "text_search",
          weights: { name: 10, tags: 5, description: 3, address: 1 },
          default_language: col === "pois_kr" ? "none" : "english",
        }
      );
      results.push(`  → 인덱스 생성: text_search`);
    }
  }

  return results;
}
