import { useTranslations } from "next-intl";
import type { POI, POIPetInfo, POIIntroItem, POIInfoItem } from "@/types/poi";

interface SpotInfoProps {
  poi: POI;
}

/** HTML 문자열에서 <br> 태그를 줄바꿈으로 변환하고 나머지 태그는 제거한다. */
function renderHtmlText(html: string) {
  const parts = html.split(/<br\s*\/?>/gi);
  return parts.map((part, i) => {
    const text = part.replace(/<[^>]+>/g, "").trim();
    if (!text) return null;
    return (
      <span key={i}>
        {i > 0 && <br />}
        {text}
      </span>
    );
  });
}

function safeHostname(url: string): string {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname;
  } catch {
    return url;
  }
}

function safeHref(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "#";
  }
  return url.startsWith("http") ? url : `https://${url}`;
}

/** intro 객체에서 contentType별 필드를 섹션별로 추출 */
function extractIntroSections(intro: POIIntroItem) {
  const usetime = intro.usetime || intro.usetimeculture || intro.usetimefestival
    || intro.opentime || intro.opentimefood || intro.usetimeleports
    || intro.checkintime;
  const restdate = intro.restdate || intro.restdateculture || intro.restdateshopping
    || intro.restdatefood || intro.restdateleports;
  const parking = intro.parking || intro.parkingculture || intro.parkingshopping
    || intro.parkingfood || intro.parkingleports || intro.parkinglodging;

  const infocenter = intro.infocenter || intro.infocenterculture
    || intro.infocentershopping || intro.infocenterfood || intro.infocenterleports
    || intro.infocenterlodging || intro.infocentertourcourse;

  const usefee = intro.usefee || intro.usefeeleports;
  const discountinfo = intro.discountinfo || intro.discountinfofood;
  const spendtime = intro.spendtime || intro.spendtimefestival;
  const expagerange = intro.expagerange || intro.expagerangeleports;

  const chkpet = intro.chkpet || intro.chkpetculture || intro.chkpetshopping || intro.chkpetleports;
  const chkbabycarriage = intro.chkbabycarriage || intro.chkbabycarriageculture
    || intro.chkbabycarriageshopping || intro.chkbabycarriageleports;
  const chkcreditcard = intro.chkcreditcard || intro.chkcreditcardculture
    || intro.chkcreditcardshopping || intro.chkcreditcardfood || intro.chkcreditcardleports;

  return {
    visitInfo: { usetime, restdate, parking },
    infocenter,
    feeInfo: { usefee, discountinfo, spendtime, expagerange },
    facilityCheck: { chkpet, chkbabycarriage, chkcreditcard },
    eventInfo: {
      eventstartdate: intro.eventstartdate,
      eventenddate: intro.eventenddate,
      eventplace: intro.eventplace,
      program: intro.program,
      sponsor1: intro.sponsor1,
      sponsor2: intro.sponsor2,
      agelimit: intro.agelimit,
      playtime: intro.playtime,
    },
    courseInfo: {
      distance: intro.distance,
      taketime: intro.taketime,
      theme: intro.theme,
      schedule: intro.schedule,
    },
    lodgingInfo: {
      checkintime: intro.checkintime,
      checkouttime: intro.checkouttime,
      roomcount: intro.roomcount,
      roomtype: intro.roomtype,
      subfacility: intro.subfacility,
      refundregulation: intro.refundregulation,
    },
    lodgingAmenities: [
      intro.barbecue && "BBQ",
      intro.fitness && "Fitness",
      intro.sauna && "Sauna",
      intro.sports && "Sports",
      intro.publicbath && "Public Bath",
      intro.beauty && "Beauty",
      intro.karaoke && "Karaoke",
      intro.seminar && "Seminar",
      intro.publicpc && "PC",
      intro.bicycle && "Bicycle",
      intro.campfire && "Campfire",
      intro.beverage && "Beverage",
    ].filter(Boolean) as string[],
    foodInfo: {
      firstmenu: intro.firstmenu,
      treatmenu: intro.treatmenu,
      packing: intro.packing,
      seat: intro.seat,
      smoking: intro.smoking,
      kidsfacility: intro.kidsfacility,
    },
    shopInfo: {
      saleitem: intro.saleitem,
      shopguide: intro.shopguide,
      fairday: intro.fairday,
    },
    leisureInfo: {
      reservation: intro.reservation,
      usefeeleports: intro.usefeeleports,
      openperiod: intro.openperiod,
    },
    heritage: [intro.heritage1, intro.heritage2, intro.heritage3].filter((v) => v && v !== "0") as string[],
  };
}

/** 공통 정보 행 컴포넌트 */
function InfoRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className="mt-0.5 shrink-0 text-base text-muted-foreground">{emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{renderHtmlText(value)}</p>
      </div>
    </div>
  );
}

/** 섹션 래퍼 컴포넌트 */
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

/** 여행코스 단계 표시 */
function CourseSteps({ items, title }: { items: POIInfoItem[]; title: string }) {
  const sorted = [...items].sort((a, b) => Number(a.subnum || 0) - Number(b.subnum || 0));
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-3">
        {sorted.map((step, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {step.subnum || idx + 1}
              </span>
              <h3 className="font-medium text-foreground">{step.subname}</h3>
            </div>
            {step.subdetailoverview && (
              <p className="text-sm text-muted-foreground ml-8">
                {renderHtmlText(step.subdetailoverview)}
              </p>
            )}
            {step.subdetailimg && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={step.subdetailimg}
                alt={step.subdetailalt || step.subname || ""}
                className="mt-2 ml-8 rounded-md max-w-full h-auto max-h-48 object-cover"
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** 숙박 객실 카드 */
function RoomCards({ items, tSpot }: { items: POIInfoItem[]; tSpot: (key: string) => string }) {
  const roomFacilities: { key: string; label: string }[] = [
    { key: "roomtv", label: "TV" },
    { key: "roominternet", label: "Internet" },
    { key: "roomrefrigerator", label: "Fridge" },
    { key: "roomaircondition", label: "A/C" },
    { key: "roombathfacility", label: "Bath" },
    { key: "roompc", label: "PC" },
    { key: "roomsofa", label: "Sofa" },
    { key: "roomcook", label: "Cook" },
    { key: "roomhairdryer", label: "Dryer" },
    { key: "roomtoiletries", label: "Toiletries" },
    { key: "roomcable", label: "Cable" },
    { key: "roomtable", label: "Table" },
  ];

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{tSpot("roomInfo")}</h2>
      <div className="space-y-3">
        {items.map((room, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-muted/30 overflow-hidden">
            {room.roomimg1 && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={room.roomimg1}
                alt={room.roomtitle || ""}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
            )}
            <div className="p-4 space-y-2">
              <h3 className="font-medium text-foreground">{room.roomtitle}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {room.roombasecount && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">{tSpot("roomBase")}:</span> {room.roombasecount}
                  </p>
                )}
                {room.roommaxcount && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">{tSpot("roomMax")}:</span> {room.roommaxcount}
                  </p>
                )}
                {(room.roomsize1 || room.roomsize2) && (
                  <p className="text-muted-foreground">
                    <span className="font-medium">{tSpot("roomSize")}:</span>{" "}
                    {[room.roomsize1, room.roomsize2].filter(Boolean).join(" / ")}
                  </p>
                )}
              </div>
              {(room.roomoffseasonminfee1 || room.roompeakseasonminfee1) && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  {room.roomoffseasonminfee1 && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">{tSpot("offseasonFee")}:</span>{" "}
                      {Number(room.roomoffseasonminfee1).toLocaleString()}
                    </p>
                  )}
                  {room.roompeakseasonminfee1 && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">{tSpot("peakseasonFee")}:</span>{" "}
                      {Number(room.roompeakseasonminfee1).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              {room.roomintro && (
                <p className="text-sm text-muted-foreground">{renderHtmlText(room.roomintro)}</p>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {roomFacilities.map(
                  (f) =>
                    room[f.key] === "Y" && (
                      <span
                        key={f.key}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      >
                        {f.label}
                      </span>
                    )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function SpotInfo({ poi }: SpotInfoProps) {
  const t = useTranslations("poi");
  const tSpot = useTranslations("spot");

  const intro = poi.intro?.[0];
  const sections = intro ? extractIntroSections(intro) : null;
  const hasVisitInfo =
    sections && (sections.visitInfo.usetime || sections.visitInfo.restdate || sections.visitInfo.parking);

  const hasEventInfo = sections && (
    sections.eventInfo.eventstartdate || sections.eventInfo.eventplace || sections.eventInfo.program
  );
  const hasCourseInfo = sections && (
    sections.courseInfo.distance || sections.courseInfo.taketime || sections.courseInfo.theme
  );
  const hasLodgingInfo = sections && (
    sections.lodgingInfo.checkintime || sections.lodgingInfo.checkouttime || sections.lodgingInfo.roomcount
  );
  const hasFoodInfo = sections && (
    sections.foodInfo.firstmenu || sections.foodInfo.treatmenu
  );
  const hasShopInfo = sections && (
    sections.shopInfo.saleitem || sections.shopInfo.shopguide || sections.shopInfo.fairday
  );
  const hasLeisureInfo = sections && (
    sections.leisureInfo.reservation || sections.leisureInfo.usefeeleports || sections.leisureInfo.openperiod
  );
  const hasFeeInfo = sections && (
    sections.feeInfo.usefee || sections.feeInfo.discountinfo || sections.feeInfo.spendtime || sections.feeInfo.expagerange
  );
  const hasFacilityCheck = sections && (
    sections.facilityCheck.chkpet || sections.facilityCheck.chkbabycarriage || sections.facilityCheck.chkcreditcard
  );

  // info 분기: 여행코스 / 숙박 객실 / 범용
  const infoItems = poi.info;
  const isCourseInfo = infoItems && infoItems.length > 0 && !!infoItems[0]?.subname;
  const isRoomInfo = infoItems && infoItems.length > 0 && !!infoItems[0]?.roomtitle;
  const genericInfoItems = !isCourseInfo && !isRoomInfo
    ? infoItems?.filter((item) => item.infoname && item.infotext)
    : undefined;
  const hasGenericInfo = genericInfoItems && genericInfoItems.length > 0;

  const petFields: { key: keyof POIPetInfo; emoji: string; labelKey: string }[] = [
    { key: "acmpyTypeCd", emoji: "\uD83D\uDC3E", labelKey: "petType" },
    { key: "etcAcmpyInfo", emoji: "\uD83D\uDCCB", labelKey: "petEtcInfo" },
    { key: "acmpyPsblCpam", emoji: "\u26FA", labelKey: "petCamping" },
    { key: "acmpyNeedMtr", emoji: "\uD83C\uDF92", labelKey: "petNeedMtr" },
    { key: "relaAcdntRiskMtr", emoji: "\u26A0\uFE0F", labelKey: "petRiskMtr" },
    { key: "relaFrnshPrdlst", emoji: "\uD83E\uDE91", labelKey: "petFrnshPrdlst" },
    { key: "relaPosesFclty", emoji: "\uD83C\uDFD7\uFE0F", labelKey: "petPosesFclty" },
    { key: "relaPurcPrdlst", emoji: "\uD83D\uDED2", labelKey: "petPurcPrdlst" },
    { key: "relaRntlPrdlst", emoji: "\uD83D\uDD11", labelKey: "petRntlPrdlst" },
  ];
  const hasPetInfo = poi.pet && petFields.some((f) => poi.pet?.[f.key]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* 1. Description */}
      <section>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {t("description")}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {poi.description ? renderHtmlText(poi.description) : tSpot("noDescription")}
        </p>
      </section>

      {/* 2. Visit Info */}
      {hasVisitInfo && (
        <InfoSection title={tSpot("visitInfo")}>
          {sections.visitInfo.usetime && (
            <InfoRow emoji="&#x1F553;" label={tSpot("hours")} value={sections.visitInfo.usetime} />
          )}
          {sections.visitInfo.restdate && (
            <InfoRow emoji="&#x1F4C5;" label={tSpot("closedDays")} value={sections.visitInfo.restdate} />
          )}
          {sections.visitInfo.parking && (
            <InfoRow emoji="&#x1F17F;" label={tSpot("parking")} value={sections.visitInfo.parking} />
          )}
        </InfoSection>
      )}

      {/* 3. 문의처 */}
      {sections?.infocenter && (
        <InfoSection title={tSpot("infocenter")}>
          <InfoRow emoji="&#x1F4DE;" label={tSpot("infocenter")} value={sections.infocenter} />
        </InfoSection>
      )}

      {/* 4. 축제 정보 */}
      {hasEventInfo && (
        <InfoSection title={tSpot("eventInfo")}>
          {(sections.eventInfo.eventstartdate || sections.eventInfo.eventenddate) && (
            <InfoRow
              emoji="&#x1F4C6;"
              label={tSpot("eventPeriod")}
              value={[sections.eventInfo.eventstartdate, sections.eventInfo.eventenddate].filter(Boolean).join(" ~ ")}
            />
          )}
          {sections.eventInfo.eventplace && (
            <InfoRow emoji="&#x1F4CD;" label={tSpot("eventPlace")} value={sections.eventInfo.eventplace} />
          )}
          {sections.eventInfo.program && (
            <InfoRow emoji="&#x1F3AD;" label={tSpot("program")} value={sections.eventInfo.program} />
          )}
          {(sections.eventInfo.sponsor1 || sections.eventInfo.sponsor2) && (
            <InfoRow
              emoji="&#x1F3E2;"
              label={tSpot("sponsor")}
              value={[sections.eventInfo.sponsor1, sections.eventInfo.sponsor2].filter(Boolean).join(" / ")}
            />
          )}
          {sections.eventInfo.playtime && (
            <InfoRow emoji="&#x23F1;" label={tSpot("spendtime")} value={sections.eventInfo.playtime} />
          )}
          {sections.eventInfo.agelimit && (
            <InfoRow emoji="&#x1F464;" label={tSpot("expagerange")} value={sections.eventInfo.agelimit} />
          )}
        </InfoSection>
      )}

      {/* 5. 코스 정보 */}
      {hasCourseInfo && (
        <InfoSection title={tSpot("courseInfo")}>
          {sections.courseInfo.distance && (
            <InfoRow emoji="&#x1F4CF;" label={tSpot("distance")} value={sections.courseInfo.distance} />
          )}
          {sections.courseInfo.taketime && (
            <InfoRow emoji="&#x23F1;" label={tSpot("taketime")} value={sections.courseInfo.taketime} />
          )}
          {sections.courseInfo.theme && (
            <InfoRow emoji="&#x1F3AF;" label={tSpot("theme")} value={sections.courseInfo.theme} />
          )}
          {sections.courseInfo.schedule && (
            <InfoRow emoji="&#x1F4CB;" label={tSpot("schedule")} value={sections.courseInfo.schedule} />
          )}
        </InfoSection>
      )}

      {/* 6. 숙박 정보 */}
      {hasLodgingInfo && (
        <InfoSection title={tSpot("lodgingInfo")}>
          {sections.lodgingInfo.checkintime && (
            <InfoRow emoji="&#x1F6CE;" label={tSpot("checkin")} value={sections.lodgingInfo.checkintime} />
          )}
          {sections.lodgingInfo.checkouttime && (
            <InfoRow emoji="&#x1F6AA;" label={tSpot("checkout")} value={sections.lodgingInfo.checkouttime} />
          )}
          {sections.lodgingInfo.roomcount && (
            <InfoRow emoji="&#x1F3E8;" label={tSpot("roomCount")} value={sections.lodgingInfo.roomcount} />
          )}
          {sections.lodgingInfo.roomtype && (
            <InfoRow emoji="&#x1F6CF;" label={tSpot("roomType")} value={sections.lodgingInfo.roomtype} />
          )}
          {sections.lodgingInfo.subfacility && (
            <InfoRow emoji="&#x1F3E0;" label={tSpot("subfacility")} value={sections.lodgingInfo.subfacility} />
          )}
          {sections.lodgingInfo.refundregulation && (
            <InfoRow emoji="&#x1F4B3;" label={tSpot("refund")} value={sections.lodgingInfo.refundregulation} />
          )}
          {sections.lodgingAmenities.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">{tSpot("amenities")}</p>
              <div className="flex flex-wrap gap-1.5">
                {sections.lodgingAmenities.map((name) => (
                  <span key={name} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </InfoSection>
      )}

      {/* 7. 음식점 정보 */}
      {hasFoodInfo && (
        <InfoSection title={tSpot("foodInfo")}>
          {sections.foodInfo.firstmenu && (
            <InfoRow emoji="&#x2B50;" label={tSpot("firstmenu")} value={sections.foodInfo.firstmenu} />
          )}
          {sections.foodInfo.treatmenu && (
            <InfoRow emoji="&#x1F37D;" label={tSpot("treatmenu")} value={sections.foodInfo.treatmenu} />
          )}
          {sections.foodInfo.packing && (
            <InfoRow emoji="&#x1F4E6;" label={tSpot("packing")} value={sections.foodInfo.packing} />
          )}
          {sections.foodInfo.seat && (
            <InfoRow emoji="&#x1FA91;" label={tSpot("seatCount")} value={sections.foodInfo.seat} />
          )}
          {sections.foodInfo.smoking && (
            <InfoRow emoji="&#x1F6AD;" label={tSpot("smoking")} value={sections.foodInfo.smoking} />
          )}
        </InfoSection>
      )}

      {/* 8. 쇼핑 정보 */}
      {hasShopInfo && (
        <InfoSection title={tSpot("shopInfo")}>
          {sections.shopInfo.saleitem && (
            <InfoRow emoji="&#x1F6CD;" label={tSpot("saleitem")} value={sections.shopInfo.saleitem} />
          )}
          {sections.shopInfo.shopguide && (
            <InfoRow emoji="&#x1F4CB;" label={tSpot("shopguide")} value={sections.shopInfo.shopguide} />
          )}
          {sections.shopInfo.fairday && (
            <InfoRow emoji="&#x1F4C5;" label={tSpot("fairday")} value={sections.shopInfo.fairday} />
          )}
        </InfoSection>
      )}

      {/* 9. 레저 정보 */}
      {hasLeisureInfo && (
        <InfoSection title={tSpot("leisureInfo")}>
          {sections.leisureInfo.reservation && (
            <InfoRow emoji="&#x1F4DE;" label={tSpot("reservation")} value={sections.leisureInfo.reservation} />
          )}
          {sections.leisureInfo.usefeeleports && (
            <InfoRow emoji="&#x1F4B0;" label={tSpot("leportsFee")} value={sections.leisureInfo.usefeeleports} />
          )}
          {sections.leisureInfo.openperiod && (
            <InfoRow emoji="&#x1F4C6;" label={tSpot("openperiod")} value={sections.leisureInfo.openperiod} />
          )}
        </InfoSection>
      )}

      {/* 10. 요금/편의 정보 */}
      {(hasFeeInfo || hasFacilityCheck) && (
        <InfoSection title={hasFeeInfo ? tSpot("usefee") : tSpot("facilityCheck")}>
          {sections.feeInfo.usefee && (
            <InfoRow emoji="&#x1F4B0;" label={tSpot("usefee")} value={sections.feeInfo.usefee} />
          )}
          {sections.feeInfo.discountinfo && (
            <InfoRow emoji="&#x1F3F7;" label={tSpot("discountinfo")} value={sections.feeInfo.discountinfo} />
          )}
          {sections.feeInfo.spendtime && (
            <InfoRow emoji="&#x23F1;" label={tSpot("spendtime")} value={sections.feeInfo.spendtime} />
          )}
          {sections.feeInfo.expagerange && (
            <InfoRow emoji="&#x1F464;" label={tSpot("expagerange")} value={sections.feeInfo.expagerange} />
          )}
          {sections.facilityCheck.chkbabycarriage && (
            <InfoRow emoji="&#x1F6BC;" label={tSpot("chkbabycarriage")} value={sections.facilityCheck.chkbabycarriage} />
          )}
          {sections.facilityCheck.chkcreditcard && (
            <InfoRow emoji="&#x1F4B3;" label={tSpot("chkcreditcard")} value={sections.facilityCheck.chkcreditcard} />
          )}
          {sections.facilityCheck.chkpet && (
            <InfoRow emoji="&#x1F43E;" label={tSpot("chkpet")} value={sections.facilityCheck.chkpet} />
          )}
        </InfoSection>
      )}

      {/* 10-1. 문화유산 */}
      {sections && sections.heritage.length > 0 && (
        <InfoSection title={tSpot("heritage")}>
          {sections.heritage.map((h, i) => (
            <InfoRow key={i} emoji="&#x1F3DB;" label={tSpot("heritage")} value={h} />
          ))}
        </InfoSection>
      )}

      {/* 11. 시설 안내 (info 배열) - 코스/객실/범용 분기 */}
      {isCourseInfo && infoItems && (
        <CourseSteps items={infoItems} title={tSpot("courseSteps")} />
      )}
      {isRoomInfo && infoItems && (
        <RoomCards items={infoItems} tSpot={tSpot} />
      )}
      {hasGenericInfo && (
        <InfoSection title={tSpot("facilityInfo")}>
          {genericInfoItems.map((item, idx) => (
            <InfoRow key={idx} emoji="&#x2139;" label={item.infoname!} value={item.infotext!} />
          ))}
        </InfoSection>
      )}

      {/* 12. Pet Info */}
      {hasPetInfo && (
        <InfoSection title={tSpot("petInfo")}>
          {petFields.map(
            (field) =>
              poi.pet?.[field.key] && (
                <InfoRow
                  key={field.key}
                  emoji={field.emoji}
                  label={tSpot(field.labelKey)}
                  value={poi.pet[field.key]!}
                />
              )
          )}
        </InfoSection>
      )}

      {/* 13. Details */}
      <section className="space-y-3">
        {/* Address */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">&#x1F4CD;</span>
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("address")}
            </p>
            <p className="text-sm text-foreground">{poi.address}</p>
          </div>
        </div>

        {/* Contact */}
        {poi.contact && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">&#x1F4DE;</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("contact")}
              </p>
              <a
                href={`tel:${poi.contact}`}
                className="text-sm text-primary hover:underline"
              >
                {poi.contact}
              </a>
            </div>
          </div>
        )}

        {/* Website */}
        {poi.website && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-lg">&#x1F310;</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {t("website")}
              </p>
              <a
                href={safeHref(poi.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {safeHostname(poi.website)}
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 14. CTA + Tags */}
      <a
        href={`https://maps.google.com/maps?q=${poi.coordinates.lat},${poi.coordinates.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        &#x1F4CD; {t("openInMaps")}
      </a>

      {poi.tags && poi.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {poi.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
