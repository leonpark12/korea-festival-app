/**
 * MongoDB 초기 셋업 스크립트
 * - location GeoJSON 필드 추가 (viewport bbox 쿼리용)
 * - 필수 인덱스 생성 (2dsphere, slug, category+region, text)
 *
 * 실행: node scripts/db-setup.mjs
 */
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// .env.local 수동 파싱
const envPath = join(rootDir, ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
});

async function setup() {
  const uri = envVars.MONGODB_URI;
  if (!uri) {
    console.error("ERROR: MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  const dbName = envVars.MONGODB_DB || "korea_tourism";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`MongoDB 연결 성공 (DB: ${dbName})\n`);

    const db = client.db(dbName);

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);
      const count = await collection.countDocuments();
      console.log(`━━━ ${colName} (${count}건) ━━━`);

      // 1. location GeoJSON 필드 추가
      const withoutLocation = await collection.countDocuments({
        location: { $exists: false },
      });

      if (withoutLocation > 0) {
        console.log(`  location 필드 추가 중... (${withoutLocation}건)`);
        const result = await collection.updateMany(
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
        console.log(`  ✅ location 필드 추가 완료: ${result.modifiedCount}건`);
      } else {
        console.log("  ✅ location 필드: 이미 존재");
      }

      // 2. 인덱스 생성
      const indexes = await collection.indexes();
      const indexNames = indexes.map((i) => i.name);

      // 2dsphere 인덱스
      if (!indexNames.includes("location_2dsphere")) {
        console.log("  인덱스 생성 중: location_2dsphere...");
        await collection.createIndex({ location: "2dsphere" }, { name: "location_2dsphere" });
        console.log("  ✅ location_2dsphere 생성 완료");
      } else {
        console.log("  ✅ location_2dsphere: 이미 존재");
      }

      // slug 유니크 인덱스
      if (!indexNames.includes("slug_1")) {
        console.log("  인덱스 생성 중: slug_1 (unique)...");
        await collection.createIndex({ slug: 1 }, { name: "slug_1", unique: true });
        console.log("  ✅ slug_1 생성 완료");
      } else {
        console.log("  ✅ slug_1: 이미 존재");
      }

      // category + region 복합 인덱스
      if (!indexNames.includes("category_1_region_1")) {
        console.log("  인덱스 생성 중: category_1_region_1...");
        await collection.createIndex({ category: 1, region: 1 }, { name: "category_1_region_1" });
        console.log("  ✅ category_1_region_1 생성 완료");
      } else {
        console.log("  ✅ category_1_region_1: 이미 존재");
      }

      // appCategory + region 복합 인덱스
      if (!indexNames.includes("appCategory_1_region_1")) {
        console.log("  인덱스 생성 중: appCategory_1_region_1...");
        await collection.createIndex({ appCategory: 1, region: 1 }, { name: "appCategory_1_region_1" });
        console.log("  ✅ appCategory_1_region_1 생성 완료");
      } else {
        console.log("  ✅ appCategory_1_region_1: 이미 존재");
      }

      // 텍스트 인덱스
      const hasTextIndex = indexes.some((i) => i.name?.includes("text"));
      if (!hasTextIndex) {
        const lang = colName === "pois_kr" ? "none" : "english";
        console.log(`  인덱스 생성 중: text_search (${lang})...`);
        await collection.createIndex(
          { name: "text", address: "text", tags: "text", description: "text" },
          { name: "text_search", weights: { name: 10, tags: 5, description: 3, address: 1 }, default_language: lang }
        );
        console.log("  ✅ text_search 생성 완료");
      } else {
        console.log("  ✅ text_search: 이미 존재");
      }

      console.log("");
    }

    // 검증
    console.log("━━━ 검증 ━━━");
    const verifyKr = await db.collection("pois_kr").findOne({});
    if (verifyKr?.location) {
      console.log("  ✅ pois_kr location:", JSON.stringify(verifyKr.location));
    }
    const verifyEn = await db.collection("pois_en").findOne({});
    if (verifyEn?.location) {
      console.log("  ✅ pois_en location:", JSON.stringify(verifyEn.location));
    }

    console.log("\n🎉 DB 셋업 완료!");
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setup();
