function NameFilms(req, res, connection) {
    const sql = `
    SELECT
    id, title, image
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
            if (!movie.image) {
                const newImageName = movie.title.toLowerCase().replace(/\s+/g, "_") + '.jpg';
                const modifySql = `UPDATE movies SET image = ? WHERE id = ?`;
                const promise = new Promise((resolve, reject) => {
                    connection.query(modifySql, [newImageName, movie.id], (err, updateResults) => {
                        if (err) {
                            console.error(`Errore durante l'aggiornamento dell'immagine per il film con ID ${movie.id}:`, err);
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
                res.json('Tutti i film senza nome immagine sono stati aggiornati.');
            })
            .catch((error) => {
                res.status(500).json({ error: `Si è verificato un errore durante l'aggiornamento dei nomi delle immagini.` });
            });
    });
}

module.exports = NameFilms;