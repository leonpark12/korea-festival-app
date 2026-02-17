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

    // 1. location GeoJSON 필드 추가 (coordinates → location)
    const withoutLocation = await collection.countDocuments({
      location: { $exists: false },
    });

    if (withoutLocation > 0) {
      const updateResult = await collection.updateMany(
        { location: { $exists: false } },
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
        `  → location 필드 추가: ${updateResult.modifiedCount}건`
      );
    } else {
      results.push(`  → location 필드: 이미 존재`);
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

    // category + region 복합 인덱스 (필터링)
    if (!indexNames.includes("category_1_region_1")) {
      await collection.createIndex(
        { category: 1, region: 1 },
        { name: "category_1_region_1" }
      );
      results.push(`  → 인덱스 생성: category_1_region_1`);
    }

    // 텍스트 인덱스 (검색)
    const hasTextIndex = indexes.some((i) => i.name?.includes("text"));
    if (!hasTextIndex) {
      await collection.createIndex(
        { name: "text", address: "text", tags: "text" },
        {
          name: "text_search",
          weights: { name: 10, tags: 5, address: 1 },
          default_language: col === "pois_kr" ? "none" : "english",
        }
      );
      results.push(`  → 인덱스 생성: text_search`);
    }
  }

  return results;
}
