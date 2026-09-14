const scoreSeries = [
  {
    name: "街景",
    className: "street",
    values: [52.9, 67.6, 74.4, 82.4, 83.4, 85.5, 84.2, 84.9, 86.8, 86.9]
  },
  {
    name: "后厨",
    className: "kitchen",
    values: [60.1, 58.0, 79.7, 81.2, 81.9, 82.2, 85.1, 85.5]
  },
  {
    name: "住宅 v3",
    className: "cedar",
    values: [69.8, 82.2, 83.7]
  }
];

function renderScoreChart() {
  const root = document.getElementById("score-chart");
  if (!root) return;

  const width = 900;
  const height = 390;
  const margin = { top: 28, right: 78, bottom: 46, left: 48 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const minScore = 50;
  const maxScore = 92;
  const x = cycle => margin.left + ((cycle - 1) / 9) * innerWidth;
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

  for (let cycle = 1; cycle <= 10; cycle += 1) {
    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", x(cycle));
    label.setAttribute("y", height - 16);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "axis-label");
    label.textContent = cycle;
    svg.appendChild(label);
  }

  const gateLabel = document.createElementNS(ns, "text");
  gateLabel.setAttribute("x", width - margin.right + 10);
  gateLabel.setAttribute("y", y(90) + 4);
  gateLabel.setAttribute("class", "axis-label");
  gateLabel.textContent = "90 gate";
  svg.appendChild(gateLabel);

  scoreSeries.forEach(series => {
    const points = series.values.map((value, index) => `${x(index + 1)},${y(value)}`).join(" ");
    const polyline = document.createElementNS(ns, "polyline");
    polyline.setAttribute("points", points);
    polyline.setAttribute("class", `series-line series-${series.className}`);
    svg.appendChild(polyline);

    series.values.forEach((value, index) => {
      const point = document.createElementNS(ns, "circle");
      point.setAttribute("cx", x(index + 1));
      point.setAttribute("cy", y(value));
      point.setAttribute("r", index === series.values.length - 1 ? 5 : 3.5);
      point.setAttribute("class", `point-${series.className}`);
      const title = document.createElementNS(ns, "title");
      title.textContent = `${series.name} · 第 ${index + 1} 轮 · ${value}`;
      point.appendChild(title);
      svg.appendChild(point);
    });

    const endValue = series.values[series.values.length - 1];
    const endLabel = document.createElementNS(ns, "text");
    endLabel.setAttribute("x", x(series.values.length) + 9);
    endLabel.setAttribute("y", y(endValue) - 9);
    endLabel.setAttribute("class", "end-label");
    endLabel.textContent = `${endValue}`;
    svg.appendChild(endLabel);
  });

  const xLabel = document.createElementNS(ns, "text");
  xLabel.setAttribute("x", width - margin.right);
  xLabel.setAttribute("y", height - 16);
  xLabel.setAttribute("text-anchor", "end");
  xLabel.setAttribute("class", "axis-label");
  xLabel.textContent = "review cycle";
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
