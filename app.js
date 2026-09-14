const scoreSeries = [
  {
    name: "街景",
    className: "street",
    points: [
      { cycle: 1, hours: 0.05, score: 52.9 },
      { cycle: 2, hours: 0.46, score: 67.6 },
      { cycle: 3, hours: 0.93, score: 74.4 },
      { cycle: 4, hours: 1.30, score: 82.4 },
      { cycle: 5, hours: 1.70, score: 83.4 },
      { cycle: 6, hours: 2.11, score: 85.5 },
      { cycle: 7, hours: 2.63, score: 84.2 },
      { cycle: 8, hours: 3.03, score: 84.9 },
      { cycle: 9, hours: 3.55, score: 86.8 },
      { cycle: 10, hours: 3.90, score: 86.9 }
    ]
  },
  {
    name: "后厨",
    className: "kitchen",
    points: [
      { cycle: 1, hours: 0.57, score: 60.1 },
      { cycle: 2, hours: 0.78, score: 58.0 },
      { cycle: 3, hours: 1.15, score: 79.7 },
      { cycle: 4, hours: 2.09, score: 81.2 },
      { cycle: 5, hours: 2.35, score: 81.9 },
      { cycle: 6, hours: 2.71, score: 82.2 },
      { cycle: 7, hours: 3.18, score: 85.1 },
      { cycle: 8, hours: 3.62, score: 85.5 }
    ]
  },
  {
    name: "住宅 v3（时间估算）",
    className: "cedar",
    estimated: true,
    points: [
      { cycle: 1, hours: 1.10, score: 69.8 },
      { cycle: 2, hours: 1.85, score: 82.2 },
      { cycle: 3, hours: 2.58, score: 83.7 }
    ]
  }
];

function renderScoreChart() {
  const root = document.getElementById("score-chart");
  if (!root) return;

  const width = 900;
  const height = 390;
  const margin = { top: 28, right: 78, bottom: 58, left: 48 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const minScore = 50;
  const maxScore = 92;
  const maxHours = 4;
  const x = hours => margin.left + (hours / maxHours) * innerWidth;
  const y = score => margin.top + ((maxScore - score) / (maxScore - minScore)) * innerHeight;
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-hidden", "true");

  [50, 60, 70, 80, 90].forEach(value => {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", margin.left);
    line.setAttribute("x2", width - margin.right);
    line.setAttribute("y1", y(value));
    line.setAttribute("y2", y(value));
    line.setAttribute("class", value === 90 ? "threshold" : "grid-line");
    svg.appendChild(line);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", margin.left - 12);
    label.setAttribute("y", y(value) + 4);
    label.setAttribute("text-anchor", "end");
    label.setAttribute("class", "axis-label");
    label.textContent = value;
    svg.appendChild(label);
  });

  for (let hour = 0; hour <= maxHours; hour += 1) {
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", x(hour));
    line.setAttribute("x2", x(hour));
    line.setAttribute("y1", margin.top);
    line.setAttribute("y2", height - margin.bottom);
    line.setAttribute("class", "grid-line time-grid-line");
    svg.appendChild(line);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", x(hour));
    label.setAttribute("y", height - 25);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis-label");
    label.textContent = `${hour}h`;
    svg.appendChild(label);
  }

  const gateLabel = document.createElementNS(ns, "text");
  gateLabel.setAttribute("x", width - margin.right + 10);
  gateLabel.setAttribute("y", y(90) + 4);
  gateLabel.setAttribute("class", "axis-label");
  gateLabel.textContent = "90 gate";
  svg.appendChild(gateLabel);

  scoreSeries.forEach(series => {
    const points = series.points.map(point => `${x(point.hours)},${y(point.score)}`).join(" ");
    const polyline = document.createElementNS(ns, "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("class", `series-line series-${series.className}`);
    svg.appendChild(polyline);

    series.points.forEach((datum, index) => {
      const point = document.createElementNS(ns, "circle");
      point.setAttribute("cx", x(datum.hours));
      point.setAttribute("cy", y(datum.score));
      point.setAttribute("r", index === series.points.length - 1 ? 5 : 3.5);
      point.setAttribute("class", `point-${series.className}`);
      const title = document.createElementNS(ns, "title");
      title.textContent = `${series.name} · C${datum.cycle} · ${datum.hours.toFixed(2)} h · ${datum.score} 分`;
      point.appendChild(title);
      svg.appendChild(point);
    });

    const endPoint = series.points[series.points.length - 1];
    const endLabel = document.createElementNS(ns, "text");
    endLabel.setAttribute("x", x(endPoint.hours) + 9);
    endLabel.setAttribute("y", y(endPoint.score) - 9);
    endLabel.setAttribute("class", "end-label");
    endLabel.textContent = `${endPoint.score}`;
    svg.appendChild(endLabel);
  });

  const xLabel = document.createElementNS(ns, "text");
  xLabel.setAttribute("x", margin.left);
  xLabel.setAttribute("y", height - 6);
  xLabel.setAttribute("text-anchor", "start");
  xLabel.setAttribute("class", "axis-label");
  xLabel.textContent = "elapsed wall time";
  svg.appendChild(xLabel);

  root.replaceChildren(svg);
}

function setupLightbox() {
  const dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const image = dialog.querySelector("img");
  const caption = dialog.querySelector("p");
  const close = dialog.querySelector(".lightbox-close");

  document.querySelectorAll("[data-lightbox]").forEach(button => {
    button.addEventListener("click", () => {
      image.src = button.dataset.lightbox;
      image.alt = button.dataset.caption || "放大图像";
      caption.textContent = button.dataset.caption || "";
      dialog.showModal();
    });
  });

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => {
    const box = dialog.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
}

renderScoreChart();
setupLightbox();
