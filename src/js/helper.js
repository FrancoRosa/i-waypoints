export const distance = (a, b) => {
  const [y1, x1] = a;
  const [y2, x2] = b;
  const yDiff = y2 - y1;
  const xDiff = x2 - x1;
  return Math.sqrt(yDiff * yDiff + xDiff * xDiff);
};

export const getHeading = (coord1, coord2) => {
  const [lng1, lat1] = coord1.map((deg) => (deg * Math.PI) / 180);
  const [lng2, lat2] = coord2.map((deg) => (deg * Math.PI) / 180);

  const deltaLng = lng2 - lng1;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let angle = Math.atan2(y, x) * (180 / Math.PI);

  return (angle + 360) % 360; // Normalize to [0, 360]
};

const dRound = (num, decimalPlaces = 6) => {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
};

export const divideSegment = (a, b, L) => {
  const segmentPoints = [];
  const totalDistance = distance(a, b);
  const [x1, y1] = a;
  const [x2, y2] = b;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const xDiff = dRound(L * Math.cos(ang));
  const yDiff = dRound(L * Math.sin(ang));
  const divs = totalDistance / L;
  for (let index = 0; index < divs; index++) {
    segmentPoints.push([x1 + index * xDiff, y1 + index * yDiff]);
  }

  return segmentPoints;
};

const arrayToCSV = (data) => {
  const rows = [];
  const headers = ["nro", "latitud", "longitud"];
  rows.push(headers.join(";"));
  data.forEach((d, i) => {
    rows.push([i + 1, d[1].toFixed(6), d[0].toFixed(6)].join(";"));
  });
  return rows.join("\n");
};

const objToCSV = (data) => {
  const rows = [];
  const headers = ["nro", "nombre", "latitud", "longitud", "angulo"];
  rows.push(headers.join(";"));
  data.forEach((d, i) => {
    rows.push(
      [
        i + 1,
        d.name,
        d.lat.toFixed(6),
        d.lng.toFixed(6),
        d.heading.toFixed(2),
      ].join(";")
    );
  });
  return rows.join("\n");
};

export const downloadCSV = (data) => {
  const date = new Date()
    .toLocaleString("sv")
    .replace(/-/g, "")
    .replace(/:/g, "")
    .replace(/ /g, "");
  const filename = `wp_${date}.csv`;
  const csvString = arrayToCSV(data);
  if (!csvString) {
    return;
  }

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadWCSV = (data) => {
  const date = new Date()
    .toLocaleString("sv")
    .replace(/-/g, "")
    .replace(/:/g, "")
    .replace(/ /g, "");
  const filename = `wp_${date}.csv`;
  const csvString = objToCSV(data);
  if (!csvString) {
    return;
  }

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const hexToRgba = (hex) => {
  // Remove the leading # if present
  hex = hex.replace(/^#/, "");

  // Parse the hexadecimal string to get the red, green, blue, and optional alpha components
  let r,
    g,
    b,
    a = 255;

  if (hex.length === 3) {
    // Handle short hex format (e.g., #RGB)
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // Handle full hex format (e.g., #RRGGBB)
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    // Handle full hex with alpha (e.g., #RRGGBBAA)
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = parseInt(hex.substring(6, 8), 16) / 255;
  } else {
    throw new Error("Invalid hex color format");
  }

  return [r, g, b, a];
};

export const copyToClipboard = async (text) => {
  return await navigator.clipboard.writeText(text);
};
