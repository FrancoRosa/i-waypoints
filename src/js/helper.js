export const distance = (a, b) => {
  const [y1, x1] = a;
  const [y2, x2] = b;
  const yDiff = y2 - y1;
  const xDiff = x2 - x1;
  return Math.sqrt(yDiff * yDiff + xDiff * xDiff);
};

export const divideSegment = (a, b, L) => {
  const dist = distance(a, b);
  const numSegments = Math.floor(dist / L);
  const segmentPoints = [];

  const [y1, x1] = a;
  const [y2, x2] = b;
  const yDiff = y2 - y1;
  const xDiff = x2 - x1;

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const y = y1 + t * yDiff;
    const x = x1 + t * xDiff;
    segmentPoints.push([y, x]);
  }

  // Add the end point if it wasn't added already
  if (distance % L !== 0) {
    segmentPoints.push([y2, x2]);
  }

  return segmentPoints;
};
