-- Run this ONCE, after you have created your own login,
-- so that your account is the admin. Change the email first.
update public.profiles
   set role = 'admin', full_name = 'Your Name'
 where email = 'you@meritroofing.com';
