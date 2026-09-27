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

L.circleMarker(
    [place.lat, place.lng],
    {
        radius: 5,
        color: "green",
        fillColor: "green",
        fillOpacity: 0.8
    }
)
    .addTo(map)
    .bindPopup(popup);

});