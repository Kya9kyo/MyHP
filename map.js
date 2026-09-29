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

// ドッグランを地図に表示
places.forEach(place => {

    const popup = `
        <strong>${place.subname}</strong><br>
        ${place.name}<br><br>

        <strong>住所：</strong>${place.address}<br>
        <strong>電話：</strong>${place.phone}<br>
        <strong>営業時間：</strong>${place.hours}<br>
        <strong>休業日：</strong>${place.closed}<br>
        <strong>駐車場：</strong>${place.parking}<br><br>

        <small>最終更新：${place.updated}</small>
    `;

const markerColor = place.categoryId === "01" ? "blue" : "green";

const targetLayer =
    place.categoryId === "01"
        ? roadsideStationLayer
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

});

L.control.layers(null, {
    "ペット関連": petLayer,
    "道の駅 ALL": roadsideStationLayer,
    "道の駅 行ったところのみ": visitedRoadsideStationLayer
}).addTo(map);