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
    
    // Fix fetch(`/api/...`)
    content = content.replace(/fetch\(`(\/api\/[\w-]+)`\)/g, 'fetch(`\\${API_BASE_URL}$1`)');
    // Fix fetch(`/api/...`, { ... })
    content = content.replace(/fetch\(`(\/api\/[\w-]+)`,/g, 'fetch(`\\${API_BASE_URL}$1`,');
    
    // Replace hardcoded localhost entirely
    content = content.replace(/http:\/\/localhost:4000/g, '${API_BASE_URL}');
    
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
