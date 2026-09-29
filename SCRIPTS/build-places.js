const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const placeFolder = path.join(__dirname, "../CONTENT/PLACE");
const outputFile = path.join(__dirname, "../DATA/places.js");

// CONTENT/PLACE 内の .md ファイルを取得
const files = fs
    .readdirSync(placeFolder)
    .filter(file => file.endsWith(".md"));

// 各MarkdownのYAML部分を読み込む
const places = files.map(file => {

    const filePath = path.join(placeFolder, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = matter(content);

    return {
    ...parsed.data,
    content: parsed.content
};

});

// 地図用JavaScriptを作成
const output =
    "const places = " +
    JSON.stringify(places, null, 4) +
    ";\n";

// DATA/places.js に保存
fs.writeFileSync(outputFile, output, "utf8");

console.log("DATA/places.js を作成しました。");
console.log(`${places.length}件の施設を変換しました。`);