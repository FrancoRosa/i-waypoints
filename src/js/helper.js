export const distance = (a, b) => {
  const [y1, x1] = a;
  const [y2, x2] = b;
  const yDiff = y2 - y1;
  const xDiff = x2 - x1;
  return Math.sqrt(yDiff * yDiff + xDiff * xDiff);
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
  if (!segmentPoints.includes(b)) {
    segmentPoints.push(b);
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
