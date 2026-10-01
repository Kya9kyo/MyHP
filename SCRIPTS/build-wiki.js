const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const wikiFolder = path.join(__dirname, "../CONTENT/WIKI");
const outputFile = path.join(__dirname, "../DATA/wiki.js");

const files = fs
    .readdirSync(wikiFolder)
    .filter(file => file.endsWith(".md"));

let maxId = 0;

// 既存IDの最大番号を確認
files.forEach(file => {
    const filePath = path.join(wikiFolder, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = matter(content);

    if (parsed.data.id) {
        const number = parseInt(
            String(parsed.data.id).replace("W", ""),
            10
        );

        if (!isNaN(number) && number > maxId) {
            maxId = number;
        }
    }
});

// IDがない記事に自動採番
files.forEach(file => {
    const filePath = path.join(wikiFolder, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = matter(content);

    if (!parsed.data.id) {
        maxId++;

        parsed.data.id =
            "W" + String(maxId).padStart(6, "0");

        const newContent =
            matter.stringify(parsed.content, parsed.data);

        fs.writeFileSync(filePath, newContent, "utf8");

        console.log(
            `${file} → ${parsed.data.id} を割り当てました。`
        );
    }
});

// Wiki記事を読み込む
const wiki = files.map(file => {
    const filePath = path.join(wikiFolder, file);
    const content = fs.readFileSync(filePath, "utf8");
    const parsed = matter(content);

    return {
        ...parsed.data,
        content: parsed.content
    };
});

// DATA/wiki.js を生成
const output =
    "const wiki = " +
    JSON.stringify(wiki, null, 4) +
    ";\n";

fs.writeFileSync(outputFile, output, "utf8");

console.log("DATA/wiki.js を作成しました。");
console.log(`${wiki.length}件のWiki記事を変換しました。`);