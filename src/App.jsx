import { useLocalStorage } from "./js/storage";
import DeckGL from "@deck.gl/react";
import { LineLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { Map, NavigationControl } from "react-map-gl";
import proj4 from "proj4";
import { distance, divideSegment, downloadCSV } from "./js/helper";
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
  const [intermediate, setIntermediate] = useLocalStorage("intermediate", []);
  const [total, setTotal] = useState();
  const [style, setStyle] = useLocalStorage("style", 0);
  const [len, setLen] = useLocalStorage("len", 10);

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
    setGPoints((p) => p.slice(0, -(1 + intermediate.at(-1))));
    setIntermediate((p) => p.slice(0, -1));
  };

  const handleRemoveAll = () => {
    setPoints([]);
    setLines([]);
    setGPoints([]);
    setIntermediate([]);
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
      setIntermediate((p) => [...p, intp.length - 1]);
      setGPoints((p) => [...p, ...intp]);
      setLines((l) => [
        ...l,
        { from, to, dist, tdist: l.length > 0 ? l.at(-1).tdist + dist : dist },
      ]);
    }
  };

  const handleDistanceInput = (e) => {
    setLen(e.target.value);
  };

  useEffect(() => {
    setTotal(lines.reduce((s, l) => s + l.dist, 0).toFixed(2));
  }, [lines]);

  const handleStyle = () => {
    setStyle((s) => (s + 1 < styles.length ? s + 1 : 0));
  };

  const handleDownload = () => {
    console.log("Click download");
    downloadCSV(gPoints);
  };

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
        <TextLayer
          id="distance-labels"
          data={lines}
          getPosition={(d) => d.to}
          getText={(d) => d.tdist.toFixed(1)}
          getColor={[255, 128, 0]}
          getSize={16}
          getAlignmentBaseline={"top"}
          getTextAnchor={"middle"}
        />
        <Map
          mapStyle={styles[style]}
          mapboxAccessToken="pk.eyJ1Ijoia20xMTVmcmFuY28iLCJhIjoiY2x4cGE5emJvMG1vMDJrbzZpdXQwaXp6NCJ9.OMUGXuwdfhrcCwcwwKIZ5A"
        >
          <NavigationControl />
        </Map>
      </DeckGL>

      <div className=" bg-slate-100 bg-opacity-80 p-4 z-10 absolute top-0 right-0 rounded m-2">
        <h1 className="text-center text-xl">Ideoval</h1>
        <h1 className="text-center">Puntos</h1>
        <div className="flex gap-2 my-4 justify-center items-center">
          <label>Distancia: </label>
          <input
            type="number"
            placeholder="10"
            step={1}
            min={0}
            max={1000}
            className=" border border-slate-500 rounded px-1 w-20 text-right"
            onChange={handleDistanceInput}
            value={len}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRemovePoint}
            className=" border border-slate-500 rounded px-3 py-1"
          >
            Borrar
          </button>
          <button
            onClick={handleRemoveAll}
            className=" border border-slate-500 rounded px-3 py-1 "
          >
            Borrar todos
          </button>
          <button
            onClick={handleStyle}
            className="border border-slate-500 rounded px-3 py-1"
          >
            Mapa {style + 1}/{styles.length}
          </button>
        </div>
        <div className="flex text-sm flex-col text-right">
          <p>Lineas: {lines.length}</p>
          <p>Puntos: {points.length}</p>
          <p>Puntos Granulados: {gPoints.length}</p>
          <p>Distancia: {total}</p>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={handleDownload}
            className="border border-slate-500 rounded px-3 py-1"
          >
            Descargar CSV
          </button>
        </div>
      </div>
    </>
  );
};
export default App;
