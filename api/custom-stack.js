export default function handler(req, res) {
  const title = req.query.title || "Top 10 languages";

  const items = [
    { name: "Go", value: 35.35, color: "#00ADD8" },
    { name: "TypeScript", value: 28.05, color: "#3178C6" },
    { name: "JavaScript", value: 11.74, color: "#f1e05a" },
    { name: "Python", value: 7.02, color: "#3572A5" },
    { name: "C#", value: 4.86, color: "#178600" },
    { name: "PHP", value: 3.91, color: "#4F5D95" },
    { name: "HTML", value: 2.95, color: "#e34c26" },
    { name: "Less", value: 2.63, color: "#1d365d" },
    { name: "SCSS", value: 2.03, color: "#c6538c" },
    { name: "CSS", value: 1.46, color: "#563d7c" },
  ];

  const width = 495;
  const height = 220;
  const paddingX = 26;
  const titleY = 34;
  const barX = 26;
  const barY = 58;
  const barWidth = 385;
  const barHeight = 8;
  const colGap = 205;
  const rowGap = 28;
  const startY = 94;

  let currentX = barX;
  const total = items.reduce((sum, item) => sum + item.value, 0);

  const barSegments = items
    .map((item, index) => {
      const segmentWidth = (item.value / total) * barWidth;
      const rx = index === 0 || index === items.length - 1 ? 2 : 0;

      const segment = `<rect x="${currentX.toFixed(2)}" y="${barY}" width="${segmentWidth.toFixed(2)}" height="${barHeight}" fill="${item.color}" rx="${rx}" />`;
      currentX += segmentWidth;
      return segment;
    })
    .join("");

  const legend = items
    .map((item, index) => {
      const itemsPerColumn = 5;
      const col = index < itemsPerColumn ? 0 : 1;
      const row = index % itemsPerColumn;

      const x = paddingX + col * colGap;
      const y = startY + row * rowGap;

      return `
        <circle cx="${x}" cy="${y}" r="5.5" fill="${item.color}" />
        <text x="${x + 14}" y="${y + 4}" fill="#c9d1d9" font-size="13" font-family="Segoe UI, Ubuntu, sans-serif">
          ${item.name} ${item.value.toFixed(2)}%
        </text>
      `;
    })
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="10" fill="#0d1117" />
      
      <text x="${paddingX}" y="${titleY}" fill="#ffffff" font-size="18" font-weight="600" font-family="Segoe UI, Ubuntu, sans-serif">
        ${title}
      </text>
      
      ${barSegments}
      ${legend}
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(svg);
}
