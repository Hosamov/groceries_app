# groceries_app
A grocery list app for adding and tracking needed household essentials

# Project notes
## Details
- Contains a base level of american household shopping/grocery items that are
fully editable by the individual user.
- Users may sign up and use the data as shown by default, or edit the list based
on their needs/wants.
- Each item may be added to its own (editable) classification, such as Produce,
Meat, or Household.
- Prior to each shopping trip, users may select, by clicking the individual items 
they want added to their shopping list. 
- Once items are selected, users may either save or print the items desired for
the next shopping trip, containing checkboxes to indicate the item was added to
cart/purchased.

## Routes
### GET Routes
- /  - Home route (login/register offering)
- /login - Renders login page
- /register - Renders register page
- /user_portal - Renders regular user page
- /admin_portal - Renders admin page, for super-users

### POST Routes
- /login - Using passportjs, authenticates user, directing to either
  /user_portal or /admin_portal route, based on user level.
- /logout - Logs out user, redirects to / route
- /register - Using passportjs, registers new user in mongoose db.