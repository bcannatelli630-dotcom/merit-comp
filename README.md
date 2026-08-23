# Merit Roofing · Variable Compensation

Next.js 14 (App Router) + Supabase + Vercel. Tracks variable comp for employees on
percentage-based plans, with an owner-approved claim process on prospective accounts.

**New here? Read `SETUP.md` — it walks the whole thing in plain English.**

## What it does

- Email + password logins, one admin (owner) and any number of employees
- Chart of accounts: accounts assigned to an owner, each with sub-engagements
- Three comp types per engagement — % of contract value, % of target margin,
  % of margin growth on house accounts — set per engagement, admin-visible only
- Comp calculated from the inputs on save; running totals per quarter and per year
- Claim workflow: employee submits a narrative, admin sets comp type + rate,
  approves or denies with remarks, then promotes the claim into the chart of accounts
- Mark-paid per engagement, with paid vs pending split on every chart
- Email on submission (to the admin) and on decision (to the employee)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

## Layout

```
app/
  login/            email + password sign-in, password reset
  dashboard/        totals, quarterly and annual charts, breakdowns
  accounts/         employee: accounts they own (read-only)
  claim/            employee: submit a claim with a narrative
  requests/         employee: status + owner feedback
  admin/queue/      owner: set comp type & rate, approve/deny, remarks
  admin/accounts/   owner: full chart of accounts, comp inputs, mark paid
  admin/people/     owner: invite, retitle, promote, disable
  actions.js        every write, server-side, with role checks
components/         sidebar, shell, charts, shared style tokens
lib/comp.js         the comp formulas — change rates or add a type here
supabase/schema.sql tables + row-level security. Run this first.
```

## Security model

Row-level security is on for every table. `is_admin()` gates all writes to accounts,
engagements, and request decisions. Employees can read only rows they own and can
insert only their own pending requests. Engagements are read-only to employees, which
is what keeps comp inputs out of their hands.

The service-role key is used in exactly one place — inviting a user in
`app/actions.js` — and is never exposed to the browser.
