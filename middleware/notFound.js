function notFound(req, res, next) {
    res.status(404).json({
        error: 'Not Found',
        message: 'Pagina non trova'
    })
}
module.exports = notFound