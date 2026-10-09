const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// ============================================================
// 設定
// ============================================================

const workbookPath = path.join(__dirname, "../SOURCE/whc001.xlsx");
const japaneseDataPath = path.join(
    __dirname,
    "../DATA/world-heritage-ja.json"
);
const placeFolder = path.join(__dirname, "../CONTENT/PLACE");

// 今回は安全確認のため、実際に保存するのは最初の1件だけ
const TEST_MODE = false;

// ============================================================
// 補助関数
// ============================================================

function yamlQuote(value) {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    return `"${String(value)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r?\n/g, " ")}"`;
}

function yamlPlain(value) {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    return String(value);
}

function yamlBoolean(value) {
    if (
        value === true ||
        String(value).toLowerCase() === "true" ||
        String(value) === "1"
    ) {
        return "true";
    }

    return "false";
}

function yamlBlock(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .split(/\r?\n/)
        .map(line => `  ${line}`)
        .join("\n");
}

function toList(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map(v => String(v).trim())
            .filter(Boolean);
    }

    return String(value)
        .split(",")
        .map(v => v.trim())
        .filter(Boolean);
}

function yamlList(name, value) {
    const items = toList(value);

    if (items.length === 0) {
        return `${name}:`;
    }

    return [
        `${name}:`,
        ...items.map(item => `  - ${yamlQuote(item)}`)
    ].join("\n");
}

// ============================================================
// UNESCO Excel読込
// ============================================================

const workbook = XLSX.readFile(workbookPath);
const sheet = workbook.Sheets["Sheet1"];

if (!sheet) {
    console.error("Sheet1 が見つかりません。");
    process.exit(1);
}

const data = XLSX.utils.sheet_to_json(sheet);

console.log(`世界遺産データ数: ${data.length}`);

// ============================================================
// 日本語データ読込
// ============================================================

const japaneseData = JSON.parse(
    fs.readFileSync(japaneseDataPath, "utf8")
);

// ============================================================
// 既存PLACE確認
// ============================================================

const existingFiles = fs
    .readdirSync(placeFolder)
    .filter(file => file.endsWith(".md"));

console.log(`既存PLACEファイル数: ${existingFiles.length}`);

const existingWorldHeritageFiles = existingFiles.filter(file =>
    file.startsWith("P03")
);

const existingWorldHeritageIds = existingWorldHeritageFiles.map(file =>
    Number(file.replace("P03", "").replace(".md", ""))
);

console.log("登録済みUNESCO ID:", existingWorldHeritageIds);
console.log(
    `既存世界遺産ファイル数: ${existingWorldHeritageFiles.length}`
);

// ============================================================
// 追加件数
// ============================================================

const count = Number(process.argv[2]);

if (!Number.isInteger(count) || count < 2 || count > 100) {
    console.error("追加件数は2〜100の整数で指定してください。");
    process.exit(1);
}

// ============================================================
// UNESCO ID順 → 登録済み除外
// ============================================================

const sortedSites = [...data].sort(
    (a, b) => Number(a["ID"]) - Number(b["ID"])
);

const unregisteredSites = sortedSites.filter(site =>
    !existingWorldHeritageIds.includes(Number(site["ID"]))
);

const targetSites = unregisteredSites.slice(0, count);

console.log(`今回の追加対象: ${targetSites.length}件`);

// ============================================================
// 日本語データ確認
// ============================================================

const missingJapanese = targetSites.filter(
    site => !japaneseData[String(site["ID"])]
);

if (missingJapanese.length > 0) {
    console.error("\n日本語データが不足しています。");

    missingJapanese.forEach(site => {
        console.error(
            `UNESCO ID ${site["ID"]}: ${site["Name EN"]}`
        );
    });

    console.error(
        "\nworld-heritage-ja.json に追加してから再実行してください。"
    );

    process.exit(1);
}

// ============================================================
// Markdown生成
// ============================================================

function buildMarkdown(site, japanese) {

    const fileId =
        `P03${String(site["ID"]).padStart(4, "0")}`;

    const coordinates = String(site["Coordinates"] || "")
        .split(",")
        .map(value => value.trim());

    const lat = coordinates[0] || "";
    const lng = coordinates[1] || "";

    const name = japanese.name || "";
    const shortDescription = japanese.short_description || "";

    const nameEn = site["Name EN"] || "";
    const shortDescriptionEn =
        site["Short Description EN"] || "";

    const descriptionEn =
        site["Description EN"] || "";

    const justificationEn =
        site["Justification EN"] || "";

    const dateInscribed =
        site["Date inscribed"] || "";

    const secondaryDates =
        site["Secondary dates"] || "";

    const danger =
        site["Danger"] || false;

    const dateEnd =
        site["Date end"] || "";

    const dangerList =
        site["Danger list"] || "";

    const areaHectares =
        site["Area hectares"] || "";

    const culturalCriteria =
        site["Cultural Criteria"] || "";

    const naturalCriteria =
        site["Natural Criteria"] || "";

    const criteria =
        site["Criteria"] || "";

    const unescoCategory =
        site["Category"] || "";

    const unescoCategoryId =
        site["Category ID"] || "";

    const statesNames =
        site["States Names"] || "";

    const isoCodes =
        site["ISO Codes"] || "";

    const region =
        site["Region"] || "";

    const regionCode =
        site["Region Code"] || "";

    const transboundary =
        site["Transboundary"] || false;

    const mainImage =
        site["Main Image"] || "";

    const mainImageAuthor =
        site["Main Image Author"] || "";

    const mainImageCopyright =
        site["Main Image Copyright"] || "";

    const mainImageCaptionEn =
        site["Main Image Caption EN"] || "";

    const images =
        site["Images"] || "";

    const mainVideo =
        site["Main Video"] || "";

    const mainVideoAuthor =
        site["Main Video Author"] || "";

    const mainVideoCaptionEn =
        site["Main Video Caption EN"] || "";

    const videosUrls =
        site["videos_urls"] || "";

    const unescoId =
        String(site["ID"]);

    const uuid =
        site["UUID"] || "";

    const components =
        site["Components"] || "";

    const componentsCount =
        site["Components Count"] || "";

    return `---
# My HP 基本情報
id: ${fileId}
type: place
categoryId: "03"

# 名称・説明
name: ${name}
name_en: ${nameEn}
short_description: ${yamlQuote(shortDescription)}
short_description_en: ${yamlQuote(shortDescriptionEn)}

# UNESCO詳細情報
description_en: ${yamlQuote(descriptionEn)}
justification_en: >-
${yamlBlock(justificationEn)}

# UNESCO登録情報
date_inscribed: ${yamlQuote(dateInscribed)}
secondary_dates: ${yamlQuote(secondaryDates)}
danger: ${yamlBoolean(danger)}
date_end: ${yamlPlain(dateEnd)}
danger_list: ${yamlPlain(dangerList)}
area_hectares: ${yamlPlain(areaHectares)}

# 登録基準
cultural_criteria: ${culturalCriteria ? yamlQuote(culturalCriteria) : ""}
natural_criteria: ${naturalCriteria ? yamlQuote(naturalCriteria) : ""}
criteria: ${criteria ? yamlQuote(criteria) : ""}
unesco_category: ${yamlPlain(unescoCategory)}
unesco_category_id: ${yamlPlain(unescoCategoryId)}

# 国・地域
states_names: ${yamlQuote(statesNames)}
iso_codes: ${yamlQuote(isoCodes)}
region: ${yamlQuote(region)}
region_code: ${yamlQuote(regionCode)}
transboundary: ${yamlBoolean(transboundary)}

# 位置情報
lat: ${yamlPlain(lat)}
lng: ${yamlPlain(lng)}
unesco_coordinates: ${yamlQuote(
        lat && lng ? `${lat}, ${lng}` : ""
    )}

# UNESCO画像情報
main_image: ${yamlQuote(mainImage)}
main_image_author: ${yamlQuote(mainImageAuthor)}
main_image_copyright: ${yamlQuote(mainImageCopyright)}
main_image_caption_en: ${yamlQuote(mainImageCaptionEn)}
${yamlList("images", images)}

# UNESCO動画情報
main_video: ${yamlQuote(mainVideo)}
main_video_author: ${yamlQuote(mainVideoAuthor)}
main_video_caption_en: ${yamlQuote(mainVideoCaptionEn)}
${yamlList("videos_urls", videosUrls)}

# UNESCO識別情報
unesco_id: ${yamlQuote(unescoId)}
uuid: ${yamlQuote(uuid)}

# 構成資産
components: ${yamlQuote(components)}
components_count: ${yamlPlain(componentsCount)}

# My HP 訪問情報
visited: false
firstVisit:
lastVisit:
visitCount: 0
favorite: false

# My HP 管理情報
updated:
---

# ${name}

## 概要


## 訪問記録


## メモ


## 写真


## 関連項目


## 外部リンク
`;
}

// ============================================================
// ファイル生成
// ============================================================

const sitesToWrite = TEST_MODE
    ? targetSites.slice(0, 1)
    : targetSites;

console.log(
    TEST_MODE
        ? "\nTEST MODE: 最初の1件だけ生成します。"
        : "\n通常モード: 対象ファイルを生成します。"
);

sitesToWrite.forEach(site => {

    const japanese =
        japaneseData[String(site["ID"])];

    const fileId =
        `P03${String(site["ID"]).padStart(4, "0")}`;

    const outputPath =
        path.join(placeFolder, `${fileId}.md`);

    if (fs.existsSync(outputPath)) {
        console.error(
            `既存ファイルのためスキップ: ${fileId}.md`
        );
        return;
    }

    const markdown =
        buildMarkdown(site, japanese);

    fs.writeFileSync(
        outputPath,
        markdown,
        "utf8"
    );

    console.log(
        `生成: ${fileId}.md / ${japanese.name}`
    );
});

console.log("\n完了");