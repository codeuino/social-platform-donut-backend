const { google } = require('googleapis')
const analytics = google.analytics('v3')
const jwt = require('../../config/gAnalytics')
const viewId = process.env.VIEW_ID
const HANDLER = require('../utils/response-helper')
const HttpStatus = require('http-status-codes')

module.exports = {
  getBrowser: async (req, res, next) => {
    const { startDate, endDate, proposalId } = req.body
    console.log(req.body)
    try {
      const result = await analytics.data.ga.get({
        auth: jwt,
        ids: `ga:${viewId}`,
        metrics: 'ga:users',
        dimensions: ['ga:browser'],
        'start-date': startDate,
        'end-date': endDate,
        filters: `ga:pagePath==/${proposalId}`
      })
      res.status(HttpStatus.OK).json({ analytics: result.data.rows })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getCountries: async (req, res, next) => {
    const { startDate, endDate, proposalId } = req.body

    try {
      const result = await analytics.data.ga.get({
        auth: jwt,
        ids: `ga:${viewId}`,
        metrics: 'ga:users',
        dimensions: ['ga:country'],
        'start-date': startDate,
        'end-date': endDate,
        filters: `ga:pagePath==/${proposalId}`
      })
      res.status(HttpStatus.OK).json({ analytics: result.data.rows })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getDevice: async (req, res, next) => {
    const { startDate, endDate, proposalId } = req.body

    try {
      const result = await analytics.data.ga.get({
        auth: jwt,
        ids: `ga:${viewId}`,
        metrics: 'ga:users',
        dimensions: ['ga:deviceCategory'],
        'start-date': startDate,
        'end-date': endDate,
        filters: `ga:pagePath==/${proposalId}`
      })
      res.status(HttpStatus.OK).json({ analytics: result.data.rows })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getTopProposals: async (req, res, next) => {
    const { startDate, endDate } = req.body

    try {
      const result = await analytics.data.ga.get({
        auth: jwt,
        ids: `ga:${viewId}`,
        metrics: 'ga:pageviews',
        dimensions: ['ga:pagePath'],
        'start-date': startDate,
        'end-date': endDate,
        filters: 'ga:pagePath!=/homepage'
      })
      res.status(HttpStatus.OK).json({ analytics: result.data })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  },

  getProposalViews: async (req, res, next) => {
    const { startDate, endDate, proposalId } = req.body

    try {
      const result = await analytics.data.ga.get({
        auth: jwt,
        ids: `ga:${viewId}`,
        metrics: 'ga:pageviews',
        dimensions: ['ga:date'],
        'start-date': startDate,
        'end-date': endDate,
        filters: `ga:pagePath==/${proposalId}`
      })

      res.status(HttpStatus.OK).json({ analytics: result.data.rows })
    } catch (error) {
      HANDLER.handleError(res, error)
    }
  }
}
