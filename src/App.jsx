import { useLocalStorage } from "./js/storage";
import DeckGL from "@deck.gl/react";
import { LineLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { Map, NavigationControl } from "react-map-gl";
import proj4 from "proj4";
import {
  copyToClipboard,
  distance,
  divideSegment,
  downloadCSV,
  downloadWCSV,
  getHeading,
  hexToRgba,
} from "./js/helper";
import { useEffect, useState } from "react";
import Button from "./Button";

const initialView = {
  longitude: -71.978,
  latitude: -13.516,
  zoom: 13,
};

const App = () => {
  const [points, setPoints] = useLocalStorage("points", []);
  const [gPoints, setGPoints] = useLocalStorage("gpoints", []);
  const [wPoints, setWPoints] = useLocalStorage("wPoints", []);
  const [waypoint, setWaypoint] = useState([]);
  const [list, setList] = useState(false);
  const [lines, setLines] = useLocalStorage("lines", []);
  const [intermediate, setIntermediate] = useLocalStorage("intermediate", []);
  const [total, setTotal] = useState();
  const [style, setStyle] = useLocalStorage("style", 0);
  const [len, setLen] = useLocalStorage("len", 10);
  const [color, setColor] = useLocalStorage("color", "#df870c");
  const [copied, setCopied] = useState(false);

  const [proj, setProj] = useLocalStorage(
    "proj",
    "+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs +type=crs"
  );

  const styles = [
    "mapbox://styles/mapbox/streets-v12",
    "mapbox://styles/mapbox/satellite-v9",
    "mapbox://styles/km115franco/clan50h4r000g14qenbn65jsv",
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

  const handleRemoveWPoint = () => {
    setWPoints((p) => p.slice(0, -1));
  };
  const handleRemoveWAll = () => {
    setWPoints([]);
  };

  const handleClick = (e) => {
    const {
      picked,
      coordinate: [longitude, latitude],
    } = e;
    if (!picked) {
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
          {
            from,
            to,
            dist,
            tdist: l.length > 0 ? l.at(-1).tdist + dist : dist,
          },
        ]);
      }
    }
  };

  const handleDistanceInput = (e) => {
    let dist = e.target.value;
    if (dist < 1) dist = 1;
    if (dist > 1000) dist = 1000;
    if (isNaN(dist)) dist = dist;
    setLen(dist);
  };

  const handleStyle = () => {
    setStyle((s) => (s + 1 < styles.length ? s + 1 : 0));
  };

  const handleDownload = () => {
    downloadCSV(gPoints);
  };

  const handleWDownload = () => {
    downloadWCSV(wPoints);
  };

  const handleColor = (e) => {
    setColor(e.target.value);
  };

  const addWaypoint = (e) => {
    const {
      coordinate: [lng, lat],
      object,
    } = e;
    const index = gPoints.findIndex((p) => p === object);
    const heading = getHeading([lng, lat], gPoints[index + 1]);
    const name = "NuevoParadero";
    const id = Date.now();
    setWaypoint({ lng, lat, name, id, heading });
    setCopied(false);
    setWPoints((p) => [...p, { lng, lat, name, id, heading }]);
  };

  const handleCopy = () => {
    const { lat, lng, heading } = waypoint;
    const payload = `${lat.toFixed(6)}, ${lng.toFixed(6)}, ${heading.toFixed(
      2
    )}`;
    copyToClipboard(payload).then(() => setCopied(true));
  };

  useEffect(() => {
    setTotal(lines.reduce((s, l) => s + l.dist, 0).toFixed(2));
  }, [lines]);
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
          getColor={hexToRgba(color)}
          getWidth={5}

          // widthUnits="meter"
        />
        <ScatterplotLayer
          id="route-points"
          data={points}
          getPosition={(d) => d}
          getRadius={2}
          getFillColor={[255, 140, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={0.5}
          stroked
        />
        <ScatterplotLayer
          id="granular-points"
          data={gPoints}
          getPosition={(d) => d}
          getRadius={1}
          getFillColor={[255, 0, 0]}
          getLineColor={[255, 255, 255]}
          getLineWidth={1}
          stroked
          autoHighlight
          pickable
          onClick={(e) => {
            addWaypoint(e);
          }}
        />
        <ScatterplotLayer
          id="waypoints-points"
          data={wPoints}
          getPosition={({ lng, lat }) => [lng, lat]}
          getRadius={7.5}
          getFillColor={[155, 0, 155, 100]}
          getLineColor={[0, 155, 0, 50]}
          getLineWidth={5}
          stroked
          autoHighlight
          pickable
          onClick={(e) => {
            setWaypoint(e.object);
            setCopied(false);
          }}
        />
        <TextLayer
          id="heading-labels"
          data={wPoints}
          getPosition={({ lng, lat }) => [lng, lat]}
          getText={(d) => `${d.heading.toFixed(0)}\u00b0`}
          getColor={hexToRgba(color)}
          getSize={16}
          getAlignmentBaseline={"top"}
          getTextAnchor={"middle"}
          getPixelOffset={[15, 15]}
          characterSet="auto"
        />
        <TextLayer
          id="w-name-labels"
          data={wPoints}
          getPosition={({ lng, lat }) => [lng, lat]}
          getText={(d) => d.name}
          getColor={hexToRgba(color)}
          getSize={24}
          getAlignmentBaseline="bottom"
          getTextAnchor="end"
        />
        <TextLayer
          id="distance-labels"
          data={lines}
          getPosition={(d) => d.to}
          getText={(d) => d.tdist.toFixed(1)}
          getColor={hexToRgba(color)}
          getSize={16}
          getAlignmentBaseline={"top"}
          getTextAnchor={"middle"}
          getPixelOffset={[12, 12]}
        />
        <Map
          mapStyle={styles[style]}
          mapboxAccessToken="pk.eyJ1Ijoia20xMTVmcmFuY28iLCJhIjoiY2x4cGE5emJvMG1vMDJrbzZpdXQwaXp6NCJ9.OMUGXuwdfhrcCwcwwKIZ5A"
        >
          <NavigationControl />
        </Map>
      </DeckGL>

      <div className=" bg-slate-100 bg-opacity-80 p-4 z-10 absolute top-0 right-0 rounded m-2">
        <div className="flex justify-between">
          <h1 className="text-center text-xl">Ideoval</h1>
          <Button onClick={handleStyle}>
            Mapa {style + 1}/{styles.length}
          </Button>
        </div>
        <div className="flex gap-2 justify-between my-2 items-center">
          <h1 className="text-center font-bold">Puntos: {points.length}</h1>
          <Button onClick={handleRemovePoint}>Borrar</Button>
          <Button onClick={handleRemoveAll}>Borrar todos</Button>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2 my-4 justify-center items-center">
            <label>Distancia: </label>
            <input
              type="number"
              placeholder="10"
              step={1}
              min={1}
              max={1000}
              className="text-sm border border-slate-500 rounded px-1 w-12 text-right mx-2"
              onChange={handleDistanceInput}
              value={len}
            />
          </div>
          <div className="flex gap-2 my-4 justify-center items-center">
            <label>Color: </label>
            <input
              type="color"
              className=" border border-slate-500 rounded  w-6 text-right"
              onChange={handleColor}
              value={color}
            />
          </div>
        </div>

        <div className="flex text-sm flex-col text-right">
          <p>Puntos Granulados: {gPoints.length}</p>
          <p>Lineas: {lines.length}</p>
          <p>Distancia: {total}</p>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button onClick={handleDownload}>Descargar Puntos</Button>
        </div>
        <hr className="w-full border border-slate-500 my-2" />
        <div className="flex gap-2 justify-between my-2 items-center">
          <h1 className="text-center font-bold">Paraderos: {wPoints.length}</h1>
          <Button onClick={() => setList((s) => !s)}>Ver</Button>
          <Button onClick={handleRemoveWPoint}>Borrar</Button>
          <Button onClick={handleRemoveWAll}>Borrar todos</Button>
        </div>
        {list && (
          <pre className="h-24 overflow-y-scroll text-xs text-right">
            {wPoints.map((w, index) => (
              <p key={index}>
                {`${w.name},${w.lat.toFixed(6)},${w.lng.toFixed(6)},${w.heading
                  .toFixed(3)
                  .padStart(7, " ")}`}
              </p>
            ))}
          </pre>
        )}
        <div className="flex gap-2 justify-end mt-4">
          <Button onClick={handleWDownload}>Descargar Paraderos</Button>
        </div>
        <hr className="w-full border border-slate-500 my-2" />

        {waypoint.id && (
          <div>
            <div className="flex gap-2 my-2">
              <p>Paradero:</p>{" "}
              <input
                type="text"
                className="w-40 border border-slate-500 rounded px-1"
                value={waypoint.name}
                onChange={(e) => {
                  setWaypoint({ ...waypoint, name: e.target.value });
                  setWPoints((p) =>
                    p.map((w) =>
                      w.id === waypoint.id ? { ...w, name: e.target.value } : w
                    )
                  );
                }}
              />
            </div>
            <div className="flex gap-2 justify-between items-center">
              <p>
                {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)},{" "}
                {waypoint.heading.toFixed(2)}
              </p>
              <Button onClick={handleCopy}>
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default App;
