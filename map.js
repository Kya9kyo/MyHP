// 地図を作成
const map = L.map("map").setView(
    [36.5, 137.5],
    5
);

// 地図を表示
L.tileLayer(
    "https://tile.openstreetmap.jp/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

const petLayer = L.layerGroup().addTo(map);
const roadsideStationLayer = L.layerGroup().addTo(map);
const visitedRoadsideStationLayer = L.layerGroup();
const worldHeritageLayer = L.layerGroup().addTo(map);
const visitedWorldHeritageLayer = L.layerGroup();

// ドッグランを地図に表示
places.forEach(place => {


        const popup = place.categoryId === "03"
    ? `
        <strong><a href="place.html?id=${place.id}">${place.name}</a></strong><br>
        ${place.name_en}<br><br>

        <strong>国：</strong>${place.states_names}<br>
        <strong>分類：</strong>${place.unesco_category}<br>
        <strong>登録年：</strong>${place.date_inscribed}<br>
        <strong>登録基準：</strong>${place.criteria}<br><br>

        ${place.visited ? "✓ 訪問済み" : "□ 未訪問"}
      `
    : `
        <strong>${place.subname || ""}</strong><br>
        ${place.name}<br><br>

        <strong>住所：</strong>${place.address || ""}<br>
        <strong>電話：</strong>${place.phone || ""}<br>
        <strong>営業時間：</strong>${place.hours || ""}<br>
        <strong>休業日：</strong>${place.closed || ""}<br>
        <strong>駐車場：</strong>${place.parking || ""}<br><br>

        <small>最終更新：${place.updated || ""}</small>
      `;

const markerColor =
    place.categoryId === "01"
        ? "blue"
        : place.categoryId === "03"
            ? "red"
            : "green";

const targetLayer =
    place.categoryId === "01"
        ? roadsideStationLayer
        : place.categoryId === "03"
            ? worldHeritageLayer
            : petLayer;

L.circleMarker(
    [place.lat, place.lng],
    {
        radius: 3,
color: markerColor,
fillColor: markerColor,
        fillOpacity: 0.8
    }
)
    .addTo(targetLayer)
    .bindPopup(popup);

if (place.categoryId === "01" && place.visited === true) {
    L.circleMarker(
        [place.lat, place.lng],
        {
            radius: 3,
color: "blue",
fillColor: "blue",
            fillOpacity: 0.8
        }
    )
        .addTo(visitedRoadsideStationLayer)
        .bindPopup(popup);
}

if (place.categoryId === "03" && place.visited === true) {
    L.circleMarker(
        [place.lat, place.lng],
        {
            radius: 3,
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.8
        }
    )
        .addTo(visitedWorldHeritageLayer)
        .bindPopup(popup);
}

});

L.control.layers(null, {
    "ペット関連": petLayer,
    "道の駅 ALL": roadsideStationLayer,
    "道の駅 行ったところのみ": visitedRoadsideStationLayer,
    "世界遺産 ALL": worldHeritageLayer,
    "世界遺産 行ったところのみ": visitedWorldHeritageLayer
}).addTo(map);