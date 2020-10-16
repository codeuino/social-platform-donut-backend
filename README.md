# social-platform-donut-backend

<p align="center">
    <a href="https://travis-ci.org/codeuino/social-platform-donut-backend" alt="BuildInfo">
        <img src="https://travis-ci.org/codeuino/social-platform-donut-backend.svg?branch=master" />
    </a>
    <a href="https://codecov.io/gh/codeuino/social-platform-donut-backend">
        <img src="https://codecov.io/gh/codeuino/social-platform-donut-backend/branch/master/graph/badge.svg" />
    </a>
    <a href="https://opencollective.com/donut">
        <img src="https://img.shields.io/opencollective/all/donut?logo=Open-Collective&label=financial+contributors" />
    </a>
    <a href="https://github.com/codeuino/social-platform-donut-backend/issues">
        <img alt="GitHub issues" src="https://img.shields.io/github/issues/codeuino/social-platform-donut-backend?style=plastic">
    </a>
    <a href="https://github.com/codeuino/social-platform-donut-backend/blob/master/LICENSE">
        <img alt="GitHub license" src="https://img.shields.io/github/license/codeuino/social-platform-donut-backend">
    </a>
    <a href="https://www.codefactor.io/repository/github/devesh-verma/social-platform-donut-backend">
        <img src="https://www.codefactor.io/repository/github/devesh-verma/social-platform-donut-backend/badge" alt="CodeFactor" />
    </a>
</p>


## Prerequisite: 

These are the requirement that should be installed locally on your machine.

- Node.js
- MongoDB
- Redis


## How to setup node.js on your machine?

- Move to: [link](https://nodejs.org/en/download/) choose the operating system as per your machine and start downloading and setup by clicking recommended settings in the installation wizard.

## How to setup MongoDB on your machine?

- Move to: [link](https://docs.mongodb.com/manual/administration/install-community/) look at the left sidebar and choose the operating system according to your machine. Then follow the steps recommended in the official docs.

```
Note: You can also use the MongoDB servers like Mlab or MongoDB Cluster server
```

## How to setup redis on your machine?

- Follow the steps provided in the [link](https://auth0.com/blog/introduction-to-redis-install-cli-commands-and-data-types/) to install redis on your operating system

## How to set up this project locally?

- Move to: https://github.com/codeuino/social-platform-donut-backend
- Fork the repo 
- Clone the repo using: 
```sh
    git clone https://github.com/codeuino/social-platform-donut-backend.git
```
- Now move to the project directory on your machine.
```
    cd social-platform-donut-backend
```
- Now use ```git checkout development``` to move to the development branch.
- Install all the dependencies using:
```sh
npm install 
```
- Run the development server using:
```sh
npm run dev
```
- Now the server is running on PORT 5000 or the PORT mentioned in the environment **.env.dev** variables

```
Note: Setup the environment variables as mentioned below
```


## Run unit test
Use the given below command to run all the unit test cases.
```
npm run test
```


## What are the environment variables required to run the project locally on a machine?
- Follow these steps to set the environment variable for development:
- Move to the root directory of the project and open **.env.dev** (for development) or **.env.test** (for testing)
- PORT = 5000
- NODE_ENV = "development"
- JWT_SECRET="<YOUR SECRET KEY>"
- DATABASE_URL="<YOUR DB URL>"
- SENDGRID_API_KEY = '<YOUR SENDGRID API KEY>'
- SOCKET_PORT = 8810

Note: To get **SENDGRID_API_KEY** follow the Sendgrid official [docs](https://sendgrid.com/docs/ui/account-and-settings/api-keys/#creating-an-api-key)

## Workflow (After setup)

Must follow the steps to use the platform:
1. Create an organization -  [API](https://docs.codeuino.org/donut-social-networking-platform/rest-apis/organization-api#create-an-organization)
2. Register as an admin - [API](https://docs.codeuino.org/donut-social-networking-platform/rest-apis/post-api#create-a-user)
3. Now login and use the features implemented - [API](https://docs.codeuino.org/donut-social-networking-platform/rest-apis/post-api#login-user)
4. To know more about features please go through the docs - [Docs](https://docs.codeuino.org/donut-social-networking-platform/rest-apis/post-api)

```
NOTE: Please make sure when you setup for the first time your database is empty.
```


## Allowed HTTPs requests:
<pre>
POST    : To create resource 
PATCH   : To Update resource
GET     : Get a resource or list of resources
DELETE  : To delete resource
</pre>

## Description Of Donut API Server Responses:
<table>	
    <tr>
        <th>Code</th>	
        <th>Name</th>
        <th>Details</th>
    </tr>
    <tr>
        <td><code>200</code></td>
        <td><code>OK</code></td>
        <td>the request was successful.</td>
    </tr>
    <tr>
        <td><code>201</code></td>
        <td><code>Created</code></td>
        <td>the request was successful and a resource was created.</td>
    </tr>
    <tr>
        <td><code>204</code></td>
        <td><code>No Content</code></td>
        <td>the request was successful but there is no representation to return (i.e. the response is empty).</td>
    </tr>
    <tr>
        <td><code>400</code></td>
        <td><code>Bad Request</code></td>
        <td>the request could not be understood or was missing required parameters.</td>
    </tr>
    <tr>
        <td><code>401</code></td>
        <td><code>Unauthorized</code></td>
        <td>authentication failed or user doesn't have permissions for requested operation.</td>
    </tr>
    <tr>
        <td><code>403</code></td>
        <td><code>Forbidden</code></td>
        <td>access denied.</td>
    </tr>
    <tr>
        <td><code>404</code></td>
        <td><code>Not Found</code></td>
        <td>resource was not found.</td>
    </tr>
    <tr>
        <td><code>405</code></td>
        <td><code>Method Not Allowed</code></td>
        <td>requested method is not supported for resource.</td>
    </tr>
    <tr>
        <td><code>409</code></td>
        <td><code>Conflict</code></td>
        <td>resourse with given id already exist.</td>
    </tr>  
    <tr>
        <td><code>429</code></td>
        <td><code>Too many requests</code></td>
        <td>sent too many requests to the server in short span of time</td>
    </tr>    
</table>
<br></br>

## Contributing 💻
We are happy to see you here and we welcome your contributions towards Donut-Platform.
Contributions are not limited to coding only, you can help in many other ways which includes leaving constructive feedback to people's Pull Request threads also.

Donut platform also provides an extensive list of issues, some of them includes labels like good-first-issue, help-wanted. You can take a look at good-first-issue issues if you are new here but you are free to choose any issue you would like to work on.

If there's no issue available currently, you can setup the project locally and find out the bugs/new features and open issues for that and discuss the bugs or features with the project maintainers or admins.

After choosing an issue and doing changes in the code regarding that, you can open up a Pull Request (PR) to development branch to get your work reviewed and merged!