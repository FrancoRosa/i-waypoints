import { useLocalStorage } from "./js/storage";
import DeckGL from "@deck.gl/react";
import { LineLayer, ScatterplotLayer } from "@deck.gl/layers";
import { Map, NavigationControl } from "react-map-gl";
import proj4 from "proj4";
import { distance, divideSegment } from "./js/helper";
import { useEffect, useState } from "react";

const initialView = {
  longitude: -71.978,
  latitude: -13.516,
  zoom: 13,
};

const App = () => {
  const [points, setPoints] = useLocalStorage("points", []);
  const [gPoints, setGPoints] = useLocalStorage("gpoints", []);
  const [lines, setLines] = useLocalStorage("lines", []);
  const [total, setTotal] = useState();
  const [style, setStyle] = useLocalStorage("style", 0);
  const [len, setLen] = useLocalStorage("len", 100);

  const [proj, setProj] = useLocalStorage(
    "proj",
    "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs +type=crs"
  );

  const styles = [
    "mapbox://styles/mapbox/streets-v12",
    "mapbox://styles/mapbox/satellite-v9",
    "mapbox://styles/mapbox/satellite-streets-v12",
    "mapbox://styles/mapbox/navigation-night-v1",
  ];

  const handleRemovePoint = () => {
    setPoints((p) => p.slice(0, -1));
    setLines((p) => p.slice(0, -1));
    setGPoints((p) => p.slice(0, -1));
  };

  const handleClick = (e) => {
    const [longitude, latitude] = e.coordinate;
    const to = [longitude, latitude];
    setPoints((p) => [...p, to]);
    if (points.length > 0) {
      const from = points.at(-1);
      const from_utm = proj4(proj).forward(from);
      const to_utm = proj4(proj).forward(to);
      const dist = distance(from_utm, to_utm);
      const intp_utm = divideSegment(from_utm, to_utm, len);
      const intp = [];
      intp_utm.forEach((c) => {
        intp.push(proj4(proj).inverse(c));
      });
      console.log(intp);
      setGPoints((p) => [...p, ...intp]);
      setLines((l) => [...l, { from, to, dist }]);
    }
  };

  useEffect(() => {
    setTotal(lines.reduce((s, l) => s + l.dist, 0).toFixed(2));
  }, [lines]);

  const handleStyle = () => {
    console.log("Click", style);
    setStyle((s) => (s + 1 < styles.length ? s + 1 : 0));
  };

  // toDO. FUNTION TOGENERATE from to FROM ARRAR

  return (
    <>
      <DeckGL
        controller={{ dragPan: true }}
        initialViewState={initialView || points[0]}
        onClick={handleClick}
      >
        <LineLayer
          id="route-layer"
          data={lines}
          getSourcePosition={(d) => d.from}
          getTargetPosition={(d) => d.to}
          getColor={[255, 140, 0]}
          getWidth={5}

          // widthUnits="meter"
        />
        <ScatterplotLayer
          id="route-points"
          data={points}
          getPosition={(d) => d}
          getRadius={1}
          getFillColor={[255, 140, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={0.5}
          stroked
        />
        <ScatterplotLayer
          id="granular-points"
          data={gPoints}
          getPosition={(d) => d}
          getRadius={0.5}
          getFillColor={[255, 0, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={0.2}
          stroked
        />

        <Map
          mapStyle={styles[style]}
          mapboxAccessToken="pk.eyJ1Ijoia20xMTVmcmFuY28iLCJhIjoiY2x4cGE5emJvMG1vMDJrbzZpdXQwaXp6NCJ9.OMUGXuwdfhrcCwcwwKIZ5A"
        >
          <NavigationControl />
        </Map>
      </DeckGL>

      <div className=" bg-slate-100 bg-opacity-80 p-4 z-10 absolute top-0 right-0">
        <h1>Maps</h1>

        <button
          onClick={handleRemovePoint}
          className=" border border-slate-500 rounded px-4 py-1 mx-4"
        >
          Remove
        </button>
        <button
          onClick={handleStyle}
          className="border border-slate-500 rounded px-4 py-1"
        >
          Style {style + 1}/{styles.length}
        </button>
        <p>Lines: {lines.length}</p>
        <p>Points: {points.length}</p>
        <p>dPoints: {gPoints.length}</p>
        <p>Total: {total}</p>
      </div>
    </>
  );
};
export default App;
