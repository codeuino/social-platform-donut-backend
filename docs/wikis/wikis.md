# Wikis

## Setup

Guide for developers and contributors set and test wikis on Donut

Donut has to be registered as a OAuth App on GitHub to be able to request for permissions to access repos of the orgnization on GitHub. More can be learned about the steps to register [here](https://developer.github.com/apps/building-oauth-apps/creating-an-oauth-app/). The `Authorization callback URL` URL should have link to `/wikis/oauth-callback` endpoint.

Client ID and Client Secret is to be provided after registering on GitHub as environemnt variables `GITHUB_OAUTH_APP_CLIENTID` and `GITHUB_OAUTH_APP_CLIENTSECRET` respectively. Demo values for those are already given for testing purpose.

## Workflow

- When wikis setup not done, admin user will get option to connect to GitHub. When connecting to GitHub admin user will have to grant permission the GitHub OAuth application whose clientId and clientSecret are provided in the environemnt variables to access one organization for whom he should have the rights to create repositories. The GitHub OAuth permission requests page rediects to `Authorization callback URL` provided during the creation of the GitHub OAuth App which should point to the `/wikis/oauth-callback` endpoint. Upon succesful authorization, we get an access token which is saved in the db in the Organizations.

- On first time setup a repo named `Donut-wikis-backup` public repo is created under the Organization. `Home.md` and `_Sidebar.md` files are created in the repo and two closed issues are created with the titles `Home` and `_Sidebar`.

- When a page is requested for then, the `pagesIndex` which is the title of all the pages available in the GitHub repo, complete content of `_Sidebar` and complete content and history of the page currently being viewed is sent. Complete content of pages and sidebar, history and pagesIndex is cached in redis.

- When editing pages, the sha and comments of the commit is commented with the corresponding GitHub issue for that page. The page contents and history for that page is updated in the cache.

- When creating new pages, pagesIndex is updated in the cache and history and the content of the page created is cached.

- When deleteing pages, corrent document in the Github repo is deleted, the sha and comments of the commit which deletes the page is commented on the corresponding issue, its corresponding issue is renamed to `<fileNmae>-deleted-<first 8 letters of delete commit sha>`, all corresponding keys for that page is deleted from cache. The Home page and Sidebar cannot be deleted.

## Routes

    GET     - /wikis
            - First route to be called by frontend, returns message if wikis setup not done else returns pagesIndex and Home page
    
    GET     - /wikis/oauth-check
            - Route called by frontend during initial setup by admin, handles redirection to GitHub or requesting OAuth access
    
    GET     - /wikis/oauth-callback
            - Authorization callback URL GitHub redirects to when OAuth request approved, saves the access token to DB, performs initial setup
    
    GET     - /wikis/pages
            - expects
              - query parameters
                - title - title of the page to be retrieved
                - ref - SHA of commit from which the page is to be retrived, useful of retrieving previous versions of page in histories, defaults to "master"
            - returns pagesIndex and the complete content and history of the page to be retrieved.
    
    POST    - /wikis/pages
            - expects
              - body
                - title - tile of the page to be created
                - content - content of the page to be created
                - comments - comments which could appear in the commmit message of the commit in which the page is created
            - creates a new page
    
    PUT     - /wikis/pages
            - expects
              - body
                - title - tile of the page being edited
                - content - new content of the page being edited
                - comments - comments which could appear in the commmit message of the commit in which the page is edited
            - edits an existing page
    
    DELETE  - /wikis/pages
            - expects
              - body
                - title - tile of the page being edited
            - deletes a page

## Database

accessToken - persistent - stored under wikis.accessToken in `Organization` Schema
