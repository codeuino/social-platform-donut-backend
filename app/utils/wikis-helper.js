const redis = require('../../config/redis')
const redisClient = redis.redisClient
const base64 = require('base-64')
const axios = require('axios')

const githubAPI = 'https://api.github.com'
let githubAPIrepos = null
let opts = { headers: {} }
let orgId = null

module.exports = {

  getOpts: () => opts,

  getOrg: async () => {
    const respOrg = await axios.get(`${githubAPI}/user/orgs`, opts)
    orgId = respOrg.data[0].login
    githubAPIrepos = `${githubAPI}/repos/${orgId}/Donut-wikis-backup`
    return orgId
  },

  getOrgId: () => orgId,

  getAllRepos: async () => (await axios.get(`${githubAPI}/orgs/${orgId}/repos`, opts)).data,

  fetchPage: async (pageName, ref = 'master') => {
    try {
      const isPresentInCache = await redisClient.exists(`${pageName}-${ref}`)
      if (isPresentInCache) {
        return base64.decode(await redisClient.get(`${pageName}-${ref}`))
      }
      const page = (await axios.get(`${githubAPIrepos}/${pageName}.md?ref=${ref}`, opts)).data.content
      await redisClient.set(`${pageName}-${ref}`, page)
      return base64.decode(page)
    } catch (err) {
      console.log(err)
    }
  },

  clearPageFromCache: async (pageName) => {
    const pageKeys = await redisClient.keys('*')
    pageKeys.forEach(async (key) => {
      if (key.substring(0, key.indexOf('-')) === pageName) {
        await redisClient.del(key)
      }
    })
  },

  updatePageHistory: async (pageName) => {
    try {
      const issueNumber = await module.exports.getFileIssueNumber(pageName)
      let history = (await axios.get(`${githubAPIrepos}/issues/${issueNumber}/comments`, opts)).data
      history = history.reverse()
      await redisClient.set(`${pageName}-history`, JSON.stringify(history))
    } catch (err) {
      console.log(err)
    }
  },

  fetchPageHistory: async (pageName) => {
    if (!await redisClient.exists(`${pageName}-history`)) {
      await module.exports.updatePageHistory(pageName)
    }
    return JSON.parse(await redisClient.get(`${pageName}-history`))
  },

  updatePagesIndex: async () => {
    const pageCotent = await module.exports.fetchPage('_Sidebar')
    const newIndex = [{ title: '_Sidebar', content: pageCotent }, { title: 'Home' }]
    const pages = (await axios.get(`${githubAPIrepos}/contents`, opts)).data
    pages.forEach(ele => {
      const eleName = ele.name.substring(0, ele.name.indexOf('.'))
      if (eleName !== '_Sidebar' && eleName !== 'Home') { newIndex.push({ title: eleName }) }
    })
    await redisClient.set('pagesIndex', JSON.stringify(newIndex))
  },

  fetchPagesIndex: async () => {
    if (!await redisClient.exists('pagesIndex')) {
      await module.exports.updatePagesIndex()
    }
    return JSON.parse(await redisClient.get('pagesIndex'))
  },

  addPageToIndex: async (pagesInd, page, ref = 'master') => {
    let pagesIndex = pagesInd
    if (!pagesIndex) {
      await module.exports.updatePagesIndex()
      pagesIndex = await redisClient.get('pagesIndex')
    }
    for (let i = 0; i < pagesIndex.length; i++) {
      if (pagesIndex[i].title === page) {
        pagesIndex[i].content = await module.exports.fetchPage(page, ref)
        pagesIndex[i].history = await module.exports.fetchPageHistory(page)
      }
    }
    return pagesIndex
  },

  getFileIssueNumber: async (fileName) => {
    let issueNumber = null
    if (await redisClient.exists(`${fileName}-IssueNumber`)) {
      issueNumber = await redisClient.get(`${fileName}-IssueNumber`)
    } else {
      const allIssues = (await axios.get(`${githubAPIrepos}/issues?state=closed`, opts)).data
      issueNumber = (allIssues.filter(issue => issue.title === fileName))[0].number
      await redisClient.set(`${fileName}-IssueNumber`, issueNumber)
    }
    return issueNumber
  },

  changeFileOnRemote: async (fileName, content, commitMesage, newFile = false) => {
    let data = { message: commitMesage, content: base64.encode(content) }
    if (!newFile) {
      data.sha = (await axios.get(`${githubAPIrepos}/contents/${fileName}.md`, opts)).data.sha
    }
    try {
      const commit = (await axios.put(`${githubAPIrepos}/contents/${fileName}.md`, data, opts)).data.commit.sha
      if (newFile) {
        // open an issue
        data = { title: fileName, body: 'Issue opened by Donut to keep track of commits affecting this file.' }
        const issueNumber = (await axios.post(`${githubAPIrepos}/issues`, data, opts)).data.number
        redisClient.set(`${fileName}-IssueNumber`, issueNumber)
        await axios.patch(`${githubAPIrepos}/issues/${issueNumber}`, { state: 'closed' }, opts)
      }
      await redisClient.set(`${fileName}-master`, base64.encode(content))
      // comment the sha of the commit and comments on the issue
      const commentBody = {
        commit: commit,
        comment: commitMesage
      }
      const issueNumber = await module.exports.getFileIssueNumber(fileName)
      await axios.post(`${githubAPIrepos}/issues/${issueNumber}/comments`, { body: JSON.stringify(commentBody) }, opts)
      await module.exports.updatePageHistory(fileName)
    } catch (err) {
      console.log(err)
    }
  },

  createRepo: async () => {
    const sidebarInitialContent = `
- [$Home$]
  `
    if ((await module.exports.getAllRepos()).filter(repo => repo.name === 'Donut-wikis-backup').length) {
      return 'ALREADY_EXISTS'
    } else {
      const data = { name: 'Donut-wikis-backup', private: false, description: 'Super Private Donut repo' }
      try {
        await axios.post(`${githubAPI}/orgs/${orgId}/repos`, data, module.exports.getOpts()) // create repo
        await module.exports.changeFileOnRemote('Home', 'This is an awesome Home Page', 'Home Initial Commit', true)
        await module.exports.changeFileOnRemote('_Sidebar', sidebarInitialContent, '_Sidebar Initial Commit', true)
        return 'CREATED'
      } catch (err) {
        console.log(err)
      }
    }
  },
  setOrgId: (id) => {
    orgId = id
    githubAPIrepos = `${githubAPI}/repos/${orgId}/Donut-wikis-backup`
  },
  setOpts: (token) => { opts.headers.Authorization = `token ${token}` },
  getUser: async () => (await axios.get(`${githubAPI}/user`, opts)).data.login
}
