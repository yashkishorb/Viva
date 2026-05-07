const express = require("express");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const FILES_DIR = path.join(__dirname, "files");

// Main route - auto downloads all files as a ZIP
app.get("/", (req, res) => {
  const files = fs.readdirSync(FILES_DIR);

  if (files.length === 0) {
    return res.status(404).send("No files found in the /files folder.");
  }

  const zipName = "practical_files.zip";

  res.setHeader("Content-Disposition", `attachment; filename="${zipName}"`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    console.error("Archive error:", err);
    res.status(500).send("Error creating zip.");
  });

  archive.pipe(res);

  // Add every file from the /files folder into the zip
  files.forEach((file) => {
    const filePath = path.join(FILES_DIR, file);
    if (fs.statSync(filePath).isFile()) {
      archive.file(filePath, { name: file });
      console.log(`  + Adding: ${file}`);
    }
  });

  archive.finalize();
  console.log(`[${new Date().toLocaleTimeString()}] Download triggered → ${zipName}`);
});

app.listen(PORT, () => {
  console.log("====================================");
  console.log(`  Auto-Downloader Server Running`);
  console.log(`  Open: http://localhost:${PORT}`);
  console.log(`  Files folder: ${FILES_DIR}`);
  console.log("====================================");
});
