const { default: slugify } = require("slugify");

function slugFilms(req, res, connection) {
    const sql = `
    SELECT
    id, title, slug
    FROM
    movies
  `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Errore durante l'esecuzione della query:", err);
            return res.status(500).json({ error: 'Errore nella query al database' });
        }

        const updatePromises = [];

        results.forEach((movie) => {
            if (!movie.slug) {
                const newslugName = slugify(movie.title)

                const modifySql = `UPDATE movies SET slug = ? WHERE id = ?`;
                const promise = new Promise((resolve, reject) => {
                    connection.query(modifySql, [newslugName, movie.id], (err, updateResults) => {
                        if (err) {
                            console.error(`Errore durante l'aggiornamento dello slug per il film con ID ${movie.id}:`, err);
                            reject(err);
                        } else {
                            resolve(updateResults);
                        }
                    });
                });
                updatePromises.push(promise);
            }
        });

        Promise.all(updatePromises)
            .then(() => {
                res.json('Tutti i film senza slug sono stati aggiornati.');
            })
            .catch((error) => {
                res.status(500).json({ error: `Si è verificato un errore durante l'aggiornamento degli slug.` });
            });
    });
}

module.exports = slugFilms;