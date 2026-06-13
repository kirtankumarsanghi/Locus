const fs = require('fs');
const files = [
  'd:/Kirtan Folder/Locus/frontend/src/pages/StudentDashboard.tsx',
  'd:/Kirtan Folder/Locus/frontend/src/pages/SeatFinder.tsx',
  'd:/Kirtan Folder/Locus/frontend/src/pages/MapView.tsx',
  'd:/Kirtan Folder/Locus/frontend/src/pages/DeskList.tsx',
  'd:/Kirtan Folder/Locus/frontend/src/pages/CheckIn.tsx',
  'd:/Kirtan Folder/Locus/frontend/src/pages/ActiveSession.tsx'
];
files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    // Replace \${API_BASE_URL} with ${API_BASE_URL}
    content = content.replace(/\\\$\{API_BASE_URL\}/g, '${API_BASE_URL}');
    fs.writeFileSync(f, content);
  }
});
