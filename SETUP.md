# Setting this up — plain-English instructions

You are wiring together three free/cheap services. Nothing here needs coding.

- **GitHub** stores the code.
- **Supabase** is the database and the login system. Your data lives here.
- **Vercel** turns the code into a real website at a real address.
- **Resend** sends the notification emails.

Budget roughly 45 minutes the first time. Do the steps in order.

---

## Step 1 — Put the code on GitHub (10 min)

**The folder structure has to survive the upload.** The app will not build if every
file ends up at the top level. Use Option A — it's the reliable one.

### Option A — GitHub Desktop (recommended)

1. Create a free account at **github.com**.
2. Download **GitHub Desktop** from **desktop.github.com** and sign in with that account.
3. In GitHub Desktop: **File → New Repository**
   - Name: `merit-comp`
   - Local path: anywhere, e.g. your Documents folder
   - Click **Create repository**
4. Click **Repository → Show in Finder** (Mac) or **Show in Explorer** (Windows).
   A folder called `merit-comp` opens.
5. Unzip the package you downloaded. Open the `merit-comp` folder inside it, select
   everything in there, and copy it into the folder from step 4. Say yes to merging
   or replacing if asked.
6. Back in GitHub Desktop you'll see a long list of changed files. Type
   `first commit` in the Summary box at the bottom left, click **Commit to main**,
   then click **Publish repository** at the top. Tick **Keep this code private**.

Done — and folders stay folders.

### Option B — the browser, if you'd rather not install anything

The trick is to drag the *folders themselves*, not their contents.

1. Create the repository as in Option A step 1–3, but on github.com: **+ → New
   repository**, name `merit-comp`, **Private**, no README, **Create repository**.
2. On the next screen click **uploading an existing file**.
3. Unzip the package and open the `merit-comp` folder so you can see `app`,
   `components`, `lib`, `supabase`, `package.json`, and the rest.
4. Select all of those — the four folders *and* the loose files — and drag the whole
   selection in one motion onto the upload area. Do **not** open the folders first.
   GitHub should show a file count in the hundreds and paths that contain slashes,
   like `app/dashboard/page.jsx`. If instead you see a flat list of names with no
   slashes, undo and try again, dragging the folders rather than their contents.
5. Click **Commit changes**.

### How to check it worked

Open your repository on github.com. The top level should list folders — `app`,
`components`, `lib`, `supabase` — plus `package.json`, `README.md`, `SETUP.md`,
`middleware.js`, and `next.config.mjs`. Click into `app` and you should see
`dashboard`, `admin`, `login`, and so on.

If you see `page.jsx` sitting at the top level next to `package.json`, the structure
flattened. Delete the repository (**Settings → scroll to the bottom → Delete this
repository**) and use Option A.

**One more thing:** files starting with a dot — `.gitignore` and `.env.example` — are
hidden by default on Mac and Windows and may not come across. Neither is required for
the site to work. If you want `.gitignore` anyway, press
Cmd+Shift+period (Mac) or turn on **Hidden items** in Explorer's View menu (Windows)
before you copy.

---

## Step 2 — Create the database (15 min)

1. Create a free account at **supabase.com**.
2. Click **New project**.
   - Name: `merit-comp`
   - Database password: click **Generate**, then **copy it somewhere safe** (you likely won't need it again, but don't lose it)
   - Region: pick the one closest to you
   - Click **Create new project** and wait ~2 minutes.
3. In the left sidebar click **SQL Editor**, then **New query**.
4. Open `supabase/schema.sql` from the package in any text editor. Select all, copy, paste into the query box, click **Run**.
   You should see "Success. No rows returned." That built all your tables and the security rules.
5. Now create your own login. In the left sidebar go to **Authentication → Users → Add user → Create new user**.
   - Email: your work email
   - Password: pick one
   - Tick **Auto Confirm User**
   - Click **Create user**
6. Make yourself the admin. Go back to **SQL Editor → New query**, paste this, change the email to yours, and click **Run**:

   ```sql
   update public.profiles
      set role = 'admin', full_name = 'Your Name'
    where email = 'you@meritroofing.com';
   ```

7. Collect three values you'll need in Step 4. Go to **Project Settings** (gear icon) **→ API** and copy these into a scratch note:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public** key (a long string)
   - **service_role** key (click reveal — treat this one like a password, never share it)

---

## Step 3 — Set up email (5 min)

1. Create a free account at **resend.com**.
2. Go to **API Keys → Create API Key**. Copy the key (starts with `re_`) into your scratch note.
3. For real emails from your own domain, go to **Domains → Add Domain**, enter `meritroofing.com`, and give the DNS records it shows to whoever manages your website DNS. Until that's verified you can send from `onboarding@resend.dev` for testing.

---

## Step 4 — Put it online (10 min)

1. Create a free account at **vercel.com** and choose **Continue with GitHub**.
2. Click **Add New → Project**, find `merit-comp`, click **Import**.
3. Before clicking Deploy, expand **Environment Variables** and add these one at a time
   (name on the left, value on the right):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
   | `RESEND_API_KEY` | your Resend key |
   | `MAIL_FROM` | `Merit Comp <comp@meritroofing.com>` |
   | `ADMIN_NOTIFY_EMAIL` | the address that should get new-claim alerts |
   | `NEXT_PUBLIC_SITE_URL` | leave blank for now |

4. Click **Deploy** and wait ~2 minutes. Vercel gives you an address like `https://merit-comp.vercel.app`.
5. Go to **Settings → Environment Variables**, set `NEXT_PUBLIC_SITE_URL` to that address (no trailing slash), then **Deployments → ⋯ → Redeploy**.
6. Back in Supabase go to **Authentication → URL Configuration** and set **Site URL** to the same address. Add `https://your-address.vercel.app/**` under **Redirect URLs**.

---

## Step 5 — First run (5 min)

1. Open your Vercel address and log in with the email and password from Step 2.5.
2. Go to **People** and invite your salesperson and your project manager. They get an email, set their own password, and land in their own view.
3. Go to **Chart of Accounts** and add the accounts each person owns.
4. Under each account, click **Add engagement**, then fill in the comp type, the rate, the dollar inputs, and the quarter. Click **Save changes** — the comp figure calculates from what you entered.
5. When you pay someone, click **Mark paid** on that engagement.

---

## How the pieces work day to day

**The employee** sees only their own accounts and their own numbers. They submit a claim on **Claim an Account** with a written narrative. They can see the *rate* on an approved claim but never the *comp type* behind it.

**You** get an email whenever a claim comes in. In **Approval Queue** you pick the comp type, set the rate, write remarks, and approve or deny. Either way the employee gets an email with your remarks. Approving lets you push the account straight into the chart of accounts with those terms already attached.

**The three comp types**

| Type | What gets multiplied by the rate |
| --- | --- |
| % of Contract Value | the contract value you enter |
| % of Target Margin | the target margin you enter |
| % of Margin Growth (House Account) | current margin minus the prior baseline |

**Quarter and year totals** on the dashboard come from the quarter you tag each engagement with, so tag them accurately.

---

## Costs

Supabase, Vercel, and Resend all have free tiers that comfortably cover two employees. If you outgrow them, expect roughly $20/month each for Supabase Pro and Vercel Pro. Resend is free up to 3,000 emails a month.

## Changing something later

Edit the file on GitHub (click the file, then the pencil icon, then **Commit changes**). Vercel rebuilds and redeploys within a couple of minutes on its own.

## A note on the data

Comp figures live in Supabase with row-level security switched on, which means the database itself refuses to hand an employee anyone else's numbers — it isn't just hidden in the interface. Supabase takes daily backups on the free tier; check **Database → Backups** if you ever need to restore.
