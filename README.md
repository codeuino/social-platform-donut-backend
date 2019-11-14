# social-platform-donut-backend

<p align="center">
    <a href="https://travis-ci.org/devesh-verma/social-platform-donut-backend" alt="BuildInfo">
        <img src="https://travis-ci.org/devesh-verma/social-platform-donut-backend.svg?branch=development" />
    </a>
    <a href="https://codecov.io/gh/devesh-verma/social-platform-donut-backend">
        <img src="https://codecov.io/gh/devesh-verma/social-platform-donut-backend/branch/development/graph/badge.svg" />
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
</p>

### STEPS

```.sh
npm install
```

#### Package descriptions

- bcrypt :- hash your plain password and store hashed password in database.
- body-parser :- Parse incoming request bodies in a middleware before your handlers, available under the req.bodyproperty.
- express :- Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- jsonwebtoken :- JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object.
- mongoose :- Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment.
- morgan :- HTTP request logger middleware for node.js.
- nodemon :- nodemon will watch the files in the directory in which nodemon was started, and if any files change, nodemon will automatically restart your node application.


These are the Donut APIs

## API Response Format
The response body for all the APIs will use the following format and it will contain one of them ( data | errors ).
<pre>
{
    data: {
        /../
    },
    errors: {
        /../
    }
}
</pre>
    
## Error Objects
Error objects provide additional information about problems encountered while performing an operation. Error objects MUST be returned as an array keyed by errors in the top level of a JSON:API document.

### An error object MAY have the following members:

- `status` : the HTTP status code applicable to this problem, expressed as a string value.
- `code` : an application-specific error code, expressed as a string value.
- `title` : a short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization.
- `detail` : a human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized.

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
</table>