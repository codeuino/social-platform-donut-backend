const HttpStatus = require('http-status-codes')
const HANDLER = require('../utils/response-helper')
const fetch = require('node-fetch')
const base64 = require('base-64')
const axios = require('axios')

const clientId = 'a3e08516c35fe7e83f43'
const clientSecret = '9be3bfa05972a533e1e7843d3e8a69cc0dc3227e'

const githubAPI = 'https://api.github.com'
let accessToken = null
let remoteRepo = null
let adminUserId = null
let orgId = null

const sidebarInitialContent = `
- [$Home$]
    - [$Events$]
        - [$About$]
- [Google](https://www.google.co.in/)
  `

const getUser = async () => {
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  const respUser = await axios.get(`${githubAPI}/user`, opts)
  return (respUser.data.login)
}

const getOrg = async () => {
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  const respOrg = await axios.get(`${githubAPI}/user/orgs`, opts)
  return (respOrg.data[0].login)
}

const getAllRepos = async () => {
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  const resp = await axios.get(`${githubAPI}/orgs/${orgId}/repos`, opts)
  return (resp.data)
}

const fileToIssuesMapping = {} // needs to stored in db

const changeFileOnRemote = async (fileName, content, commitMesage, newFile = false) => {
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  let resp = null
  // base64 the content
  let data = {
    message: commitMesage,
    // committer: {
    //   name: 'Donut Backend',
    //   email: 'codeuino@github.com'
    // },
    content: base64.encode(content)
  }
  if (!newFile) {
    resp = await axios.get(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents/${fileName}.md`, opts)
    resp = resp.data
    console.log(resp.data)
    data.sha = resp.sha
  }
  try {
    // create new file on the repo with the provided content
    resp = await axios.put(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents/${fileName}.md`, data, opts)
    // the sha of the commit
    const commit = resp.data.commit.sha
    console.log(commit)
    // open a new issue with the name of the file
    if (newFile) {
      // open an issue
      data = {
        title: fileName,
        body: 'A demo issue opened by Donut to keep track of commits which change this file'
      }
      resp = await axios.post(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/issues`, data, opts)
      // close the issue
      data = {
        state: 'closed'
      }
      fileToIssuesMapping[fileName] = resp.data.number
      resp = await axios.patch(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/issues/${resp.data.number}`, data, opts)
    }
    // comment the sha of the commit on the issue
    data = {
      body: commit
    }
    // this is problemactic we cannot do it like this we should get all the issues for search for one which matches this name get its number
    resp = await axios.post(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/issues/${fileToIssuesMapping[fileName]}/comments`, data, opts)
  } catch (err) {
    console.log(err)
  }
}

const fetchPage = async (pageName, ref = 'master') => {
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  const resp = await axios.get(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents/${pageName}.md?ref=${ref}`, opts)
  return base64.decode(resp.data.content)
}

const getPagesIndex = async () => { // runs on every request, will give an index of all the pages which are there
  const opts = { headers: { Authorization: `token ${accessToken}` } }
  const toBeReturned = []
  toBeReturned.push({ title: '_Sidebar' }) // Sidebar should be at index 0
  toBeReturned.push({ title: 'Home' }) // Home with always be at 1 and Home cannot be deleted
  toBeReturned[0].content = await fetchPage('_Sidebar') // get the latest sidebar
  // toBeReturned[1].content = await fetchPage('Home')
  const resp = await axios.get(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents`, opts)
  resp.data.forEach(ele => {
    const eleName = ele.name.substring(0, ele.name.indexOf('.'))
    if (eleName !== '_Sidebar' && eleName !== 'Home') {
      toBeReturned.push({ title: eleName })
    }
  })
  return toBeReturned
}

const addPageToIndex = async (pagesIndex, page, ref = 'master') => {
  for (let i = 0; i < pagesIndex.length; i++) {
    if (pagesIndex[i].title === page) {
      pagesIndex[i].content = await fetchPage(page, ref)
    }
  }
  return pagesIndex
}

const createRepo = async () => {
  const allRepos = await getAllRepos()
  const alreadyExists = allRepos.filter(repo => repo.name === 'Donut-wikis-backup')

  if (alreadyExists.length) {
    console.log('Repository of the name Donut-wikis-backup already exists')
    return 'ALREADY_EXISTS'
  } else {
    const opts = { headers: { Authorization: `token ${accessToken}` } }
    const data = {
      name: 'Donut-wikis-backup',
      private: true,
      description: 'Super Private Donut repo'
    }
    try {
      const resp = await axios.post(`${githubAPI}/orgs/${orgId}/repos`, data, opts) // create repo
      // create files for initial repo
      await changeFileOnRemote('Home', 'This is an awesome Home Page', 'Home Initial Commit', true)
      await changeFileOnRemote('_Sidebar', sidebarInitialContent, '_Sidebar Initial Commit', true)
      return 'CREATED'
    } catch (err) {
      console.log(err)
    }
  }
}

/*

Login and planning

Files could simply not be renamed
fetch the hope page (latest commit) and its histroy and sidebar and send them
we nned another route GET /wikis/:id - this id will contain the page we want and the commit we want
the redis cache will store the data fetched so far so that we dont need to query the github API everytime
for getting content of a page, when the admin updates a page then we clear that item out of the redis cache maybe

*/

module.exports = {

  getWikis: async (req, res, next) => {
    try {
      if (!accessToken) {
        res.status(HttpStatus.OK).json({
          wikis: 'NO_ACCESS_TOKEN'
        })
      } else {
        res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(await getPagesIndex(), 'Home') })
      }
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getPage: async (req, res, next) => {
    try {
      const { title, ref } = req.query
      console.log(title)
      res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(await getPagesIndex(), title) })
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ Error: err.message })
    }
  },

  editPage: async (req, res, next) => {
    const { title, content } = req.body
    console.log('From Edit page')
    console.log(title)
    console.log(content)
    try {
      await changeFileOnRemote(title, content, `${title} changes`)
      if (title !== '_Sidebar') {
        res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(await getPagesIndex(), title) })
      } else {
        const pagesIndex = await getPagesIndex()
        res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(pagesIndex, pagesIndex[1].title) })
      }
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ Error: err.message })
    }
  },

  deletePage: async (req, res, next) => {
    const { title } = req.body
    console.log(req.body)
    console.log(`!!!!!!!~~~~~~~~~~${title}~~~~~~~~~~~!!!!!!!!!!!`)
    const opts = { headers: { Authorization: `token ${accessToken}` } }
    try {
      let resp = await axios.get(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents/${title}.md`, opts)
      resp = resp.data
      console.log(resp.sha)
      const data = {
        message: `${title} deleted`,
        sha: resp.sha
      }
      resp = await axios.delete(`${githubAPI}/repos/${orgId}/Donut-wikis-backup/contents/${title}.md`, {
        data: data,
        headers: opts.headers
      })
      // console.log(resp)
      const pagesIndex = await getPagesIndex()
      res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(pagesIndex, pagesIndex[1].title) })
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ Error: err.message })
    }
  },

  newPage: async (req, res, next) => {
    const { title, content } = req.body
    try {
      await changeFileOnRemote(title, content, `${title} initial commit`, true)
      res.status(HttpStatus.OK).json({ wikis: await addPageToIndex(await getPagesIndex(), title) })
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json({ Error: err.message })
    }
  },

  // http://thecodebarbarian.com/github-oauth-login-with-node-js.html

  oauthCheck: async (req, res, next) => {
    console.log(accessToken)
    if (!accessToken) {
      console.log('redirected to github auth')
      res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo`
      )
    } else {
      res.redirect(`${process.env.clientbaseurl}wikis`)
    }
  },

  oauthCallback: async (req, res, next) => {
    const body = {
      client_id: clientId,
      client_secret: clientSecret,
      code: req.query.code
    }
    const opts = { headers: { accept: 'application/json' } }
    try {
      const resp = await axios.post('https://github.com/login/oauth/access_token', body, opts)
      console.log('From OAuth Callback')
      console.log(resp.data)
      accessToken = resp.data.access_token
      adminUserId = await getUser()
      orgId = await getOrg()
      console.log(`accessToken = ${accessToken}`)
      console.log(`orgId = ${orgId}`)
      await createRepo()
      res.redirect(`${process.env.clientbaseurl}wikis`)
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  }
}

/* Stuff yet to do
  That comments part in the ediotr in the front end should be in the commit message
  Should give some kind of feedback to the user when we have to make him wait, like a spinner or something
  Implement chaching to make things work faster
  Disable title editing everywhere
  implement histories in backed and frontend both
  discuss with jaskirat about the desgin aspects which siddhart recomended

  Fixed
  implement deleting of pages
*/
