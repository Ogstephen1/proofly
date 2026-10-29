# Proofly — raw code starter

This is a standalone, locally runnable React version of the Proofly interface and core demo workflow.

## Requirements
- Node.js 20 or newer (LTS recommended)
- A browser such as Chrome or Edge
- VS Code (recommended, not required)

## Run on Windows
1. Install Node.js from https://nodejs.org/ (choose the LTS version).
2. Extract this ZIP file.
3. Open the extracted `proofly-raw-code` folder in VS Code.
4. In VS Code choose **Terminal → New Terminal**.
5. Run:

   ```powershell
   npm install
   npm run dev
   ```

6. Vite will print a local address, usually `http://localhost:5173/`. Open it in your browser.
7. To stop the local server, click the terminal and press `Ctrl + C`.

## Make a production build
Run:

```powershell
npm run build
npm run preview
```

The production files will be placed in the `dist` folder.

## Features in this starter
- Dashboard and sample jobs
- Create, search, filter and delete jobs
- Business name setting
- Job status updates
- Image evidence attachments
- Customer-facing Proof Passport page
- Approve work or request a correction
- Responsive layout for desktop and mobile

## Important limitations
This is a **standalone starter/demo**, not a byte-for-byte export of the deployed AppDeploy project. The deployed app uses AppDeploy's hosted authentication, API and database services; this standalone version uses browser `localStorage` so it can run on your computer without those services.

That means:
- Data stays in the current browser on the current device.
- Passport links are only useful in the same browser profile where that job data exists; they will not reliably work for customers on another device.
- There is no real login, cloud database, email/push notification service, or active payment processing.
- Do not store sensitive customer information in this demo.

For a real public product, replace localStorage with a secure backend and database, add authentication and authorization, and test shared passport access before collecting real customer data.
