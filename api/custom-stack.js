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

  const width = 420;
  const height = 285;
  const padding = 25;
  const barWidth = 340;
  const barHeight = 10;

  let currentX = padding;
  const total = items.reduce((sum, item) => sum + item.value, 0);

  const barSegments = items
    .map((item) => {
      const segmentWidth = (item.value / total) * barWidth;
      const segment = `<rect x="${currentX}" y="70" width="${segmentWidth}" height="${barHeight}" fill="${item.color}" rx="2" />`;
      currentX += segmentWidth;
      return segment;
    })
    .join("");

  const legend = items
    .map((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = padding + col * 190;
      const y = 110 + row * 32;

      return `
        <circle cx="${x}" cy="${y}" r="6" fill="${item.color}" />
        <text x="${x + 14}" y="${y + 5}" fill="#c9d1d9" font-size="14" font-family="Segoe UI, Ubuntu, sans-serif">
          ${item.name} ${item.value.toFixed(2)}%
        </text>
      `;
    })
    .join("");

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="10" fill="#151515" />
      <text x="${padding}" y="38" fill="#ffffff" font-size="24" font-weight="700" font-family="Segoe UI, Ubuntu, sans-serif">
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
