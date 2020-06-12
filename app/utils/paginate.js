module.exports = {
  paginate: (req) => {
    const query = {}
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10
    const currentPage = req.query.page ? parseInt(req.query.page) : 1
    query.skip = (currentPage - 1) * pagination
    query.limit = pagination
    return query
  }
}
