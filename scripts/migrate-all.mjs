/**
 * 전체 MongoDB 문서 스키마 마이그레이션
 *
 * MongoDB aggregation pipeline update로 모든 문서를 일괄 변환:
 * 1. appCategory 추가 (category → 앱 카테고리 코드)
 * 2. thumbnail 추가 (images 배열 첫 번째)
 * 3. location ↔ coordinates 동기화
 * 4. images URL HTTPS 정규화
 * 5. mlevel string → number 변환
 * 6. info[].serialnum 제거
 *
 * 실행: node scripts/migrate-all.mjs
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
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
});

async function migrate() {
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

    // ─── Step 1: appCategory 추가 ────────────────────────────
    console.log("━━━ Step 1: appCategory 추가 ━━━");

    const categoryMaps = {
      pois_kr: {
        역사관광: "culture",
        문화관광: "culture",
        자연관광: "nature",
        "축제/공연/행사": "festival",
        축제공연행사: "festival",
        숙박: "accommodation",
        레저스포츠: "leisure",
        쇼핑: "shopping",
        음식: "restaurant",
        체험관광: "attraction",
        추천코스: "attraction",
      },
      pois_en: {
        "Historical Tourism": "culture",
        "Cultural Tourism": "culture",
        "Nature Tourism": "nature",
        "Festivals/Performances/Events": "festival",
        "Festivals/Events": "festival",
        Accommodation: "accommodation",
        "Leisure Sports": "leisure",
        Shopping: "shopping",
        Food: "restaurant",
        "Experiential Tourism": "attraction",
        "Recommended Course": "attraction",
      },
    };

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);
      const catMap = categoryMaps[colName];

      // $switch branches 생성
      const branches = Object.entries(catMap).map(([raw, mapped]) => ({
        case: { $eq: ["$category", raw] },
        then: mapped,
      }));

      const result = await collection.updateMany({}, [
        {
          $set: {
            appCategory: {
              $switch: {
                branches,
                default: "attraction",
              },
            },
          },
        },
      ]);
      console.log(`  ${colName}: ${result.modifiedCount}건 업데이트`);
    }

    // ─── Step 2: thumbnail 추가 ──────────────────────────────
    console.log("\n━━━ Step 2: thumbnail 추가 ━━━");

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);

      const result = await collection.updateMany({}, [
        {
          $set: {
            thumbnail: {
              $cond: {
                if: {
                  $and: [
                    { $isArray: "$images" },
                    { $gt: [{ $size: "$images" }, 0] },
                  ],
                },
                then: { $arrayElemAt: ["$images", 0] },
                else: "",
              },
            },
          },
        },
      ]);
      console.log(`  ${colName}: ${result.modifiedCount}건 업데이트`);
    }

    // ─── Step 3: location 동기화 ─────────────────────────────
    console.log("\n━━━ Step 3: location ↔ coordinates 동기화 ━━━");

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);

      const result = await collection.updateMany({}, [
        {
          $set: {
            location: {
              type: "Point",
              coordinates: ["$coordinates.lng", "$coordinates.lat"],
            },
          },
        },
      ]);
      console.log(`  ${colName}: ${result.modifiedCount}건 업데이트`);
    }

    // ─── Step 4: images HTTPS 정규화 ─────────────────────────
    console.log("\n━━━ Step 4: images HTTPS 정규화 ━━━");

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);

      // images 배열의 각 URL에서 http:// → https:// 변환
      const result = await collection.updateMany(
        { images: /^http:\/\// },
        [
          {
            $set: {
              images: {
                $map: {
                  input: "$images",
                  as: "url",
                  in: {
                    $replaceOne: {
                      input: "$$url",
                      find: "http://",
                      replacement: "https://",
                    },
                  },
                },
              },
            },
          },
        ]
      );
      console.log(`  ${colName}: ${result.modifiedCount}건 업데이트`);

      // thumbnail도 HTTPS 정규화
      const thumbResult = await collection.updateMany(
        { thumbnail: /^http:\/\// },
        [
          {
            $set: {
              thumbnail: {
                $replaceOne: {
                  input: "$thumbnail",
                  find: "http://",
                  replacement: "https://",
                },
              },
            },
          },
        ]
      );
      if (thumbResult.modifiedCount > 0) {
        console.log(
          `  ${colName} thumbnail: ${thumbResult.modifiedCount}건 HTTPS 변환`
        );
      }
    }

    // ─── Step 5: mlevel string → number ──────────────────────
    console.log("\n━━━ Step 5: mlevel string → number 변환 ━━━");

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);

      const result = await collection.updateMany(
        { mlevel: { $type: "string" } },
        [{ $set: { mlevel: { $toInt: "$mlevel" } } }]
      );
      console.log(`  ${colName}: ${result.modifiedCount}건 변환`);
    }

    // ─── Step 6: info[].serialnum 제거 ───────────────────────
    console.log("\n━━━ Step 6: info[].serialnum 제거 ━━━");

    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);

      // info 배열이 있고 serialnum이 포함된 문서 찾기
      const withSerialnum = await collection.countDocuments({
        "info.serialnum": { $exists: true },
      });

      if (withSerialnum > 0) {
        const result = await collection.updateMany(
          { "info.serialnum": { $exists: true } },
          [
            {
              $set: {
                info: {
                  $map: {
                    input: "$info",
                    as: "item",
                    in: {
                      $arrayToObject: {
                        $filter: {
                          input: { $objectToArray: "$$item" },
                          as: "kv",
                          cond: {
                            $and: [
                              { $ne: ["$$kv.k", "serialnum"] },
                              { $ne: ["$$kv.k", "contentid"] },
                              { $ne: ["$$kv.k", "contenttypeid"] },
                              { $ne: ["$$kv.v", ""] },
                              { $ne: ["$$kv.v", null] },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ]
        );
        console.log(`  ${colName}: ${result.modifiedCount}건 업데이트`);
      } else {
        console.log(`  ${colName}: serialnum 없음 (스킵)`);
      }
    }

    // ─── 검증 ────────────────────────────────────────────────
    console.log("\n━━━ 최종 검증 ━━━");
    for (const colName of ["pois_kr", "pois_en"]) {
      const collection = db.collection(colName);
      const total = await collection.countDocuments();
      const withApp = await collection.countDocuments({
        appCategory: { $exists: true },
      });
      const withThumb = await collection.countDocuments({
        thumbnail: { $exists: true },
      });
      const httpImages = await collection.countDocuments({
        images: /^http:\/\//,
      });
      const strMlevel = await collection.countDocuments({
        mlevel: { $type: "string" },
      });
      const numMlevel = await collection.countDocuments({
        mlevel: { $type: "number" },
      });
      const withSerialnum = await collection.countDocuments({
        "info.serialnum": { $exists: true },
      });

      console.log(`  ${colName} (${total}건):`);
      console.log(`    appCategory: ${withApp}/${total}`);
      console.log(`    thumbnail: ${withThumb}/${total}`);
      console.log(`    http:// images: ${httpImages}건`);
      console.log(
        `    mlevel — string: ${strMlevel}, number: ${numMlevel}`
      );
      console.log(`    info.serialnum: ${withSerialnum}건`);
    }

    console.log("\n전체 마이그레이션 완료!");
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
