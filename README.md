# groceries_app
A grocery list app for adding and tracking needed essentials

# Project notes

## GET Routes
- /  - Home route (login/register offering)
- /login - Renders login page
- /register - Renders register page
- /user_portal - Renders regular user page
- /admin_portal - Renders admin page, for super-users

## POST Routes
- /login - Using passportjs, authenticates user, directing to either
  /user_portal or /admin_portal route, based on user level.
- /logout - Logs out user, redirects to / route
- /register - Using passportjs, registers new user in mongoose db.