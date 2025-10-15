module.exports = {
  apps: [
    {
      name: "TRADE_RECON-backend",
      script: "server.js", // backend entry
      cwd: "./server",
      watch: true,
    },
    {
      name: "TRADE_RECON-frontend",
      script: "node_modules/react-scripts/scripts/start.js",
      cwd: "./client",
      watch: true,
      env: {
        BROWSER: "none",
        PORT: 3000,
      },
    },
  ],
};

//

// # Start all applications
// pm2 start ecosystem.config.js

// # Stop all
// pm2 stop ecosystem.config.js

// # Restart all
// pm2 restart ecosystem.config.js

// # Reload all
// pm2 reload ecosystem.config.js

// # Delete all
// pm2 delete ecosystem.config.js
