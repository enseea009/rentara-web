# How to Deploy Rentara Web

This project is a **Full Stack Application** (Node.js Backend + MySQL Database + HTML Frontend). To deploy it, you need two things:

1.  **A Cloud Database** (To store your users, cars, and bookings).
2.  **A Cloud Host** (To run your website and server).

---

## Step 1: Set up a Cloud Database (Free)

Since your local XAMPP/MySQL database cannot be accessed by the internet, you need a cloud version.

1.  Go to **[Aiven](https://aiven.io/)** or **[PlanetScale](https://planetscale.com/)** and sign up.
2.  Create a new **MySQL Database**.
3.  Once created, they will give you a **connection string** or credentials (Host, User, Password, Port).
    *   *Example Host*: `mysql-services.aivencloud.com`
    *   *Example Port*: `12345`

4.  **Import your data**:
    *   Use a tool like **HeidiSQL** or **MySQL Workbench**.
    *   Connect to your **NEW cloud database** using the credentials above.
    *   Open your local `database/schema.sql` file and run it in the cloud database to create the tables.
    *   (Optional) Run `scripts/create-admin.js` locally (but change your `.env` first!) to create the admin user.

---

## Step 2: Configure Environment Variables

1.  **Do not** upload your `.env` file blindly. You will set these variables in your host dashboard later.
2.  Your production variables should look like this:
    ```
    DB_HOST=your-cloud-host.com
    DB_USER=your-cloud-user
    DB_PASSWORD=your-cloud-password
    DB_NAME=defaultdb
    DB_PORT=12345
    JWT_SECRET=some-secure-random-text
    ```

---

## Step 3: Deploy to Vercel (Easiest)

I have already prepared the `vercel.json` configuration for you.

1.  **Push your code to GitHub**.
    *   Create a repository on GitHub.
    *   Upload all your files.

2.  **Go to [Vercel](https://vercel.com/)** and log in with GitHub.
3.  Click **"Add New Project"** and select your `Rentara Web` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Other (or default).
    *   **Root Directory**: `./` (Leave as is).
5.  **Environment Variables**:
    *   Open the "Environment Variables" section.
    *   Add `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `JWT_SECRET` with the values from Step 1.
6.  Click **Deploy**.

---

## Step 4: Done!

Vercel will give you a link (e.g., `https://rentara-web.vercel.app`).
*   Open it to see your site.
*   Try logging in (it will connect to your cloud database).

---

### Alternative: Render.com

If Vercel doesn't work for you, **Render.com** is also excellent for Node.js apps.
1.  Connect GitHub.
2.  Create "Web Service".
3.  Command: `npm install`
4.  Start Command: `node server/server.js`
5.  Add Environment Variables in the dashboard.
