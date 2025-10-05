const path = require("path");
const { spawn } = require("child_process");

// Path to your Go service folder
const goServicePath = path.join(__dirname, "..", "services");

// Start the Go server asynchronously
const goServer = spawn("go", ["run", "main.go"], { cwd: goServicePath, stdio: "inherit" });

// Listen for Go server exit (optional)
goServer.on("close", (code) => {
  console.log(`Go server exited with code ${code}`);
});
