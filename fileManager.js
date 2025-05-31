const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

let currentDir = path.join(os.homedir(), 'FileManager');

async function ensureDirectory(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error ensuring directory:', err.message);
  }
}

async function showMenu() {
  console.log(`
--- File Management Tool ---
Current Directory: ${currentDir}

1. Create File
2. Read File
3. Rename File
4. Delete File
5. List Files
6. Search File
7. Copy File
8. Move File
9. Change Directory / Create Folder
10. Exit
  `);

  const choice = await ask('Choose an option (1-10): ');

  switch (choice.trim()) {
    case '1': await createFile(); break;
    case '2': await readFile(); break;
    case '3': await renameFile(); break;
    case '4': await deleteFile(); break;
    case '5': await listFiles(); break;
    case '6': await searchFile(); break;
    case '7': await copyFile(); break;
    case '8': await moveFile(); break;
    case '9': await changeDirectory(); break;
    case '10':
      console.log('Exiting...');
      rl.close();
      return;
    default:
      console.log('Invalid choice.');
  }

  await showMenu();
}

async function createFile() {
  const fileName = await ask('Enter file name to create: ');
  const content = await ask('Enter file content: ');
  const filePath = path.join(currentDir, fileName);

  try {
    await fs.writeFile(filePath, content);
    console.log('✅ File created successfully.');
  } catch (err) {
    console.error('❌ Error creating file:', err.message);
  }
}

async function readFile() {
  const fileName = await ask('Enter file name to read: ');
  const filePath = path.join(currentDir, fileName);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    console.log('\n--- File Content ---\n' + data);
  } catch (err) {
    console.error('❌ Error reading file:', err.message);
  }
}

async function renameFile() {
  const oldName = await ask('Enter current file name: ');
  const newName = await ask('Enter new file name: ');
  const oldPath = path.join(currentDir, oldName);
  const newPath = path.join(currentDir, newName);

  try {
    await fs.rename(oldPath, newPath);
    console.log('✅ File renamed.');
  } catch (err) {
    console.error('❌ Error renaming file:', err.message);
  }
}

async function deleteFile() {
  const fileName = await ask('Enter file name to delete: ');
  const filePath = path.join(currentDir, fileName);

  try {
    await fs.unlink(filePath);
    console.log('✅ File deleted.');
  } catch (err) {
    console.error('❌ Error deleting file:', err.message);
  }
}

async function listFiles() {
  try {
    const files = await fs.readdir(currentDir);
    console.log('\n--- Files & Folders ---');
    files.forEach(f => console.log(f));
  } catch (err) {
    console.error('❌ Error listing files:', err.message);
  }
}

async function searchFile() {
  const query = await ask('Enter file name to search: ');

  async function searchRecursive(dir) {
    let matches = [];
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        matches = matches.concat(await searchRecursive(fullPath));
      } else if (file.name.includes(query)) {
        matches.push(fullPath);
      }
    }

    return matches;
  }

  try {
    const results = await searchRecursive(currentDir);
    if (results.length === 0) {
      console.log('🔍 No matches found.');
    } else {
      console.log('🔍 Matches:');
      results.forEach(r => console.log(r));
    }
  } catch (err) {
    console.error('❌ Error searching:', err.message);
  }
}

async function copyFile() {
  const src = await ask('Enter source file name: ');
  const dest = await ask('Enter destination file name: ');
  const srcPath = path.join(currentDir, src);
  const destPath = path.join(currentDir, dest);

  try {
    await fs.copyFile(srcPath, destPath);
    console.log('✅ File copied.');
  } catch (err) {
    console.error('❌ Error copying file:', err.message);
  }
}

async function moveFile() {
  const src = await ask('Enter source file name: ');
  const dest = await ask('Enter destination file name or path: ');
  const srcPath = path.join(currentDir, src);
  const destPath = path.join(currentDir, dest);

  try {
    await fs.rename(srcPath, destPath);
    console.log('✅ File moved.');
  } catch (err) {
    console.error('❌ Error moving file:', err.message);
  }
}

async function changeDirectory() {
  const newFolder = await ask('Enter folder name to change/create: ');
  const newPath = path.join(currentDir, newFolder);

  try {
    await ensureDirectory(newPath);
    currentDir = newPath;
    console.log(`📁 Changed to: ${currentDir}`);
  } catch (err) {
    console.error('❌ Error changing directory:', err.message);
  }
}

// Run tool
(async () => {
  await ensureDirectory(currentDir);
  await showMenu();
})();
