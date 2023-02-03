document.addEventListener("DOMContentLoaded", async () => {
  var map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        rtile: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.jp/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution:
            '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
        }
      },
      layers: [
        {
          id: "raster-tiles",
          type: "raster",
          source: "rtile",
          minzoom: 0,
          maxzoom: 22
        }
      ]
    },
    center: [140.8830781, 38.2615922],
    zoom: 13
  });

  function handleHeaderMeta(headerMeta) {
    console.log("metadata", headerMeta);
  }
  const response = await fetch(
    "https://magn01ia.github.io/fudeflat/sendai-taihaku.fgb"
  );
  map.on("load", async () => {
    const fc = { type: "FeatureCollection", features: [] };
    let i = 0;
    for await (const f of flatgeobuf.deserialize(
      response.body,
      undefined,
      handleHeaderMeta
    )) {
      fc.features.push({ ...f, id: i });
      i += 1;
    }
    map.addSource("counties", {
      type: "geojson",
      data: fc
    });
    map.addLayer({
      id: "counties-fill",
      type: "fill",
      source: "counties",
      paint: {
        "fill-color": "#ffc0cb ",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          1,
          0.5
        ]
      }
    });
    map.addLayer({
      id: "counties-line",
      type: "line",
      source: "counties",
      paint: {
        "line-color": "#ffc0cb ",
        "line-opacity": 1.0,
        "line-width": 1
      }
    });

    //クリックしたときのアクション設定
    map.on("click", "counties-fill", (e) => {
      const props = e.features[0].properties;
      const html = `<h2>${props.大字名} ${props.地番}</h2>`;
      new maplibregl.Popup().setLngLat(e.lngLat).setHTML(html).addTo(map);
    });
  });
});
