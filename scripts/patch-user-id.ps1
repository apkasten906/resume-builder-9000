# patch-user-id.ps1
# Simple script to update user ID using better-sqlite3 from Node.js

# Path to the database
$dbPath = Join-Path -Path $PSScriptRoot -ChildPath "..\packages\api\resume.db"
Write-Host "Patching user record in database at $dbPath"

# Generate temp JavaScript file
$tempJsFile = Join-Path -Path $env:TEMP -ChildPath "update-user-id.js"

# Write JavaScript that uses better-sqlite3 to update the ID
@"
const sqlite3 = require('better-sqlite3');
const db = new sqlite3('$($dbPath.Replace('\','\\'))');

// Check current user record
const currentUser = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('Current user record:', currentUser);

if (!currentUser) {
  console.error('No user found with email user@example.com');
  process.exit(1);
}

if (currentUser.id) {
  console.log("User already has ID: " + currentUser.id);
  // If the ID is not null or empty string, no need to update
  if (currentUser.id !== null && currentUser.id !== "") {
    console.log('No update needed, exiting');
    db.close();
    process.exit(0);
  }
}

// Set the user ID
const userId = '00000000-0000-0000-0000-000000000001'; // Predictable ID for test user

// Update the user record with the ID
const updateStmt = db.prepare('UPDATE users SET id = ? WHERE email = ?');
const result = updateStmt.run(userId, 'user@example.com');

console.log("Updated " + result.changes + " user records");

// Verify the update
const updatedUser = db.prepare('SELECT * FROM users WHERE email = ?').get('user@example.com');
console.log('Updated user record:', {
  id: updatedUser.id,
  email: updatedUser.email,
  created_at: updatedUser.created_at
});

db.close();
console.log('Database patching completed successfully!');
"@ | Out-File -FilePath $tempJsFile -Encoding utf8

try {
    # Run the JavaScript with Node.js
    $nodeResult = node $tempJsFile
    Write-Host $nodeResult
    Write-Host "Patch completed successfully!"
} catch {
    Write-Error "Failed to patch user ID: $_"
    exit 1
} finally {
    # Clean up temp file
    if (Test-Path $tempJsFile) {
        Remove-Item $tempJsFile
    }
}
