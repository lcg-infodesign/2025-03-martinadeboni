let data;
let minLat, minLon, maxLat, maxLon;
let filterSelect;
let currentFilter = "Tutti";
let myFont;

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, CENTER);
  textSize(16);

  // Calcolo min/max
  let allLat = data.getColumn("latitude").map(Number);
  let allLon = data.getColumn("longitude").map(Number);
  minLat = min(allLat);
  maxLat = max(allLat);
  minLon = min(allLon);
  maxLon = max(allLon);

  // Menu a tendina per filtrare per country
  filterSelect = createSelect();
  filterSelect.position(40, 100);
  filterSelect.option("Tutti");
  let countries = [...new Set(data.getColumn("country"))];
  countries.forEach(c => filterSelect.option(c));
  filterSelect.changed(() => currentFilter = filterSelect.value());
}

function draw() {
  drawBackground();

  // Titolo
  fill(200, 220, 255);
  textSize(36);
  text(`Atlante dei Vulcani – ${currentFilter}`, 40, 50);

  // Contatore visibile
  let visibleCount = 0;

  let hoverData = [];

  for (let i = 0; i < data.getRowCount(); i++) {
    let row = data.getRow(i);
    if (currentFilter !== "Tutti" && row.getString("country") !== currentFilter) continue;

    let lon = row.getNum("longitude");
    let lat = row.getNum("latitude");
    let country = row.getString("country");
    let value = row.getNum("value");
    let uncertainty = row.getNum("uncertainty");

    let x = map(lon, minLon, maxLon, 80, width - 80);
    let y = map(lat, minLat, maxLat, height - 120, 140);

    // Colore basato su valore
    let c = lerpColor(color(100, 200, 100), color(255, 100, 50), map(value, 0, 100, 0, 1));
    let size = 12;

    // Hover
    let d = dist(mouseX, mouseY, x, y);
    let hover = d < size;
    let hoverSize = hover ? size + sin(frameCount * 0.2) * 2 + 2 : size;

    fill(c);
    noStroke();
    drawTriangle(x, y, hoverSize);

    if (hover) {
      hoverData.push({
        x, y, size, country, value, uncertainty
      });
    }

    visibleCount++;
  }

  // Tooltip e overlay
  hoverData.forEach(t => drawTooltip(t));

  drawLegend();
  drawGrid();
  drawCoordinates();

  // Contatore vulcani
  fill(180, 220, 255);
  textSize(16);
  text(`${visibleCount} vulcani mostrati`, 40, height - 40);
}

//  COMPONENTI GRAFICI

function drawBackground() {
  // Sfondo gradiente
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(10, 10, 30), color(40, 40, 70), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawTriangle(x, y, size) {
  push();
  translate(x, y);
  triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
  pop();
}

function drawTooltip(t) {
  fill(255, 100, 100);
  stroke(255);
  strokeWeight(2);
  drawTriangle(t.x, t.y, t.size * 1.5);

  let tooltip = `${t.country}\nValue: ${t.value}\nUncertainty: ${t.uncertainty}`;
  textSize(14);
  let lines = tooltip.split("\n");
  let padding = 6;
  let w = 0;
  lines.forEach(line => { if (textWidth(line) > w) w = textWidth(line); });
  let h = lines.length * 18;

  fill(0, 180);
  noStroke();
  rect(t.x + 10, t.y - t.size - 10 - h / 2, w + padding * 2, h + padding * 2, 6);

  fill(255);
  lines.forEach((line, i) => {
    text(line, t.x + 10 + padding, t.y - t.size - 10 - h / 2 + padding + i * 18);
  });
}

function drawLegend() {
  let legendX = width - 220;
  let legendY = 80;
  let legendW = 200;
  let legendH = 120;

  fill(0, 180);
  stroke(200, 220, 255);
  strokeWeight(1);
  rect(legendX, legendY, legendW, legendH, 8);

  fill(200, 220, 255);
  noStroke();
  textSize(18);
  textAlign(LEFT, CENTER);
  text("Legenda", legendX + 20, legendY + 20);

  fill(150, 200, 100);
  drawTriangle(legendX + 25, legendY + 55, 12);
  fill(200, 220, 255);
  textSize(14);
  text("Posizionamento vulcano", legendX + 40, legendY + 55);

  fill(255, 100, 100);
  drawTriangle(legendX + 25, legendY + 80, 12);
  fill(200, 220, 255);
  text("Hover: dettagli", legendX + 40, legendY + 80);

  fill(200, 220, 255);
  drawTriangle(legendX + 25, legendY + 105, 12);
  fill(200, 220, 255);
  text("Colore: intensità", legendX + 40, legendY + 105);
}

function drawGrid() {
  stroke(255, 30);
  for (let i = 0; i <= 5; i++) {
    let x = map(i, 0, 5, 80, width - 80);
    line(x, 140, x, height - 120);
  }
  for (let j = 0; j <= 5; j++) {
    let y = map(j, 0, 5, 140, height - 120);
    line(80, y, width - 80, y);
  }
}

function drawCoordinates() {
  fill(180);
  noStroke();
  textSize(14);
  let lat = nf(map(mouseY, height - 120, 140, minLat, maxLat), 1, 2);
  let lon = nf(map(mouseX, 80, width - 80, minLon, maxLon), 1, 2);
  text(`Lat: ${lat}   Lon: ${lon}`, width - 220, height - 40);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
