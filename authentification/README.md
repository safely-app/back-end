# Node.js-Ci-CD-Poc

# Safely Back-End

Hi! I'm your first Markdown file in **StackEdit**. If you want to learn about StackEdit, you can read me. If you want to play with Markdown, you can edit me. Once you have finished with me, you can create new files by opening the **file explorer** on the left corner of the navigation bar.


## Start the project

The file explorer is accessible using the button in left corner of the navigation bar. You can create a new file by clicking the **New file** button in the file explorer. You can also create folders by clicking the **New folder** button.

## API routes documentations

https://safely.stoplight.io/

|          |ROUTE               |Arguments                                          |Autorizations                    |Description                                       |
|----------|--------------------|---------------------------------------------------|---------------------------------|--------------------------------------------------|
|POST      |/exemple            |                                                   |                                 |Add an exemple.                                   |
|GET       |/user               |                                                   |JWT token                        |Get informations about all users                  |
|GET       |/user/1             |                                                   |JWT token                        |Get informations about user 1.                    |
|PUT       |/user/1             |email: String username: String password: String    |JWT token                        |Change data about the user with id 1.             |
|DELETE    |/user/1             |                                                   |JWT token                        |Delete user with id 1.                            |
|POST      |/resetPassword      |email: String                                      |None                             |Send a reset password email at the email provided.|
|POST      |/changePassword     |userId: String<br>token: String<br>password: String|None                             |Reset the password of the user for the new one.   |

## Project architecture Documentation

All your files and folders are presented as a tree in the file explorer. You can switch from one to another by clicking a file in the tree.

## Working rules

You can delete the current file by clicking the **Remove** button in the file explorer. The file will be moved into the **Trash** folder and automatically deleted after 7 days of inactivity.
