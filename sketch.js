let data;
let minLat, minLon, maxLat, maxLon;
let filterSelect;
let currentFilter = "Tutti";

function preload() {
  data = loadTable("assets/data.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, CENTER);
  textSize(16);

  // calcolo min/max
  let allLat = data.getColumn("latitude");
  minLat = min(allLat);
  maxLat = max(allLat);

  let allLon = data.getColumn("longitude");
  minLon = min(allLon);
  maxLon = max(allLon);

  // menu a tendina per filtrare per country
  filterSelect = createSelect();
  filterSelect.position(40, 100);
  filterSelect.option("Tutti");
  let countries = [...new Set(data.getColumn("country"))];
  countries.forEach(c => filterSelect.option(c));
  filterSelect.changed(() => currentFilter = filterSelect.value());
}

function drawTriangle(x, y, size) {
  push();
  translate(x, y);
  triangle(
    0, -size / 2,
    -size / 2, size / 2,
    size / 2, size / 2
  );
  pop();
}

function draw() {
  background(20, 20, 30);

  // titolo
  fill(200, 220, 255);
  textSize(36);
  text("Atlante dei Vulcani", 40, 50);

  let hoverData = []; // array per salvare info hover

  // disegno triangoli
  for (let i = 0; i < data.getRowCount(); i++) {
    let row = data.getRow(i);

    // filtro per country
    if (currentFilter !== "Tutti" && row.getString("country") !== currentFilter) continue;

    let lon = row.getNum("longitude");
    let lat = row.getNum("latitude");
    let country = row.getString("country");
    let value = row.getNum("value");
    let uncertainty = row.getNum("uncertainty");

    let x = map(lon, minLon, maxLon, 50, width - 50);
    let y = map(lat, minLat, maxLat, height - 100, 120);

    let size = 12;
    let d = dist(mouseX, mouseY, x, y);

    // triangolo normale
    fill(150, 200, 100);
    noStroke();
    drawTriangle(x, y, size);

    // salva info hover se mouse sopra
    if (d < size) {
      hoverData.push({
        x: x,
        y: y,
        size: size,
        country: country,
        value: value,
        uncertainty: uncertainty
      });
    }
  }

  // disegna triangoli hover e testo in primo piano
  hoverData.forEach(t => {
    // triangolo ingrandito
    fill(255, 100, 100);
    stroke(255);
    strokeWeight(2);
    drawTriangle(t.x, t.y, t.size * 1.5);

    // testo con sfondo
    let tooltip = `${t.country}\nValue: ${t.value}\nUncertainty: ${t.uncertainty}`;
    textSize(14);
    let lines = tooltip.split("\n");
    let padding = 6;
    let w = 0;
    lines.forEach(line => { if (textWidth(line) > w) w = textWidth(line); });
    let h = lines.length * 18;

    fill(0, 180); // sfondo semitrasparente
    noStroke();
    rect(t.x + 10, t.y - t.size - 10 - h / 2, w + padding * 2, h + padding * 2, 6);

    fill(255); // testo sopra lo sfondo
    lines.forEach((line, i) => {
      text(line, t.x + 10 + padding, t.y - t.size - 10 - h / 2 + padding + i * 18);
    });
  });

  drawLegend();
}


  drawLegend();


function drawLegend() {
  let legendX = width - 220;
  let legendY = 80;
  let legendW = 200;
  let legendH = 100;

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
}
