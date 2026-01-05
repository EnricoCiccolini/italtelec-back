const connection = require('../data/db')
const slugify = require('slugify')

function index(req, res) {
    const paramsResarc = []
    const { resarc } = req.query
    console.log(resarc)

    let sql = `
   SELECT 
    antenne.*
    FROM
    antenne
    `
    if (resarc) {
        sql += ` WHERE nome LIKE ? OR range_frequenza LIKE ? OR potenza_watt LIKE ? OR prezzo LIKE ?`
        paramsResarc.push(`%${resarc}%`, `%${resarc}%`, `%${resarc}%`, `%${resarc}%`)
    }

    sql += ` GROUP BY antenne.id`

    connection.query(sql, paramsResarc, (err, results) => {
        if (err) return res.status(500).json({ error: err })

        // Calcola metadata
        const totalObjects = results.length
        const totalPages = Math.ceil(totalObjects / 6)

        // Aggiungi la chiave page ad ogni oggetto
        const data = results.map((result, index) => ({
            ...result,
            imagepath: result.immagine ? process.env.DB_PATH + result.immagine : null,
            page: Math.floor((index / 6) + 1)
        }))

        // Risposta con data e metadata
        res.json({
            data: data,
            metadata: {
                totalObjects: totalObjects,
                totalPages: totalPages
            }
        })
    })
}

function show(req, res) {
    const { id } = req.params;

    const antenneSql = `
    SELECT
    antenne.*
    FROM
    antenne
    WHERE
    antenne.id = ?
    `;

    connection.query(antenneSql, [id], (err, antenneResults) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        if (antenneResults.length === 0) return res.status(404).json({ error: 'Antenna non trovata' });

        const antenna = antenneResults[0];

        res.json({
            ...antenna,
            imagepath: antenna.immagine ? process.env.DB_PATH + antenna.immagine : null
        });
    });
}

function patchNameImage(req, res) {
    const { id, immagine } = req.body;

    if (!id || !immagine) {
        return res.status(400).json({ error: 'ID e nome immagine sono richiesti' });
    }

    const sql = `UPDATE antenne SET immagine = ? WHERE id = ?`;

    connection.query(sql, [immagine, id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Antenna non trovata' });
        }
        res.status(200).json({ message: 'Immagine aggiornata con successo' });
    });
}

function postReview(req, res) {
    // const { id } = req.params;
    // const { name, vote, text } = req.body;

    // let notValid = false;
    // const parsedVote = parseInt(vote);
    // let problem = `dati non validi: `

    // if (!name || !vote) {
    //     return res.status(400).json({ error: 'Nome e voto sono richiesti' });
    // }

    // if (isNaN(parsedVote)) {
    //     notValid = true;
    //     problem += `il valore inserito nel campo vote non è un numero. `
    // }

    // if (name.length > 30) {
    //     notValid = true;
    //     problem += `il nome non può essere lungo più di 30 caratteri. `
    // }

    // if (parsedVote < 1 || parsedVote > 5) {
    //     notValid = true;
    //     problem += `il voto deve essere compreso tra 1 e 5. `
    // }

    // if (notValid) {
    //     return res.status(400).json({ error: problem });
    // }

    // let sql = `INSERT INTO reviews (antenna_id, name, vote, text) VALUES (?, ?, ?, ?)`;

    // connection.query(sql, [id, name, parsedVote, text], (err) => {
    //     if (err) {
    //         console.error(err);
    //         return res.status(500).json({ error: err });
    //     }
    //     res.status(201).json({ message: 'Recensione creata con successo' });
    // });
}

function store(req, res) {
    console.log('Body ricevuto:', req.body);
    console.log('File ricevuto:', req.file);

    const { nome, range_frequenza, potenza_watt, prezzo, specifiche, dimensioni, peso } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Immagine è richiesta' });
    }

    const imageName = req.file.filename;

    let notValid = false;
    let problem = `dati non validi: `

    if (!nome || !range_frequenza || !potenza_watt || !prezzo) {
        return res.status(400).json({ error: 'Nome, range_frequenza, potenza_watt e prezzo sono obbligatori' });
    }

    const parsedPotenza = parseFloat(potenza_watt);
    const parsedPrezzo = parseFloat(prezzo);
    const parsedPeso = peso ? parseFloat(peso) : null;

    if (isNaN(parsedPotenza)) {
        notValid = true;
        problem += `il valore inserito nel campo potenza non è un numero. `
    }

    if (isNaN(parsedPrezzo)) {
        notValid = true;
        problem += `il valore inserito nel campo prezzo non è un numero. `
    }

    if (nome.length > 255) {
        notValid = true;
        problem += `il nome non può essere lungo più di 255 caratteri. `
    }

    if (range_frequenza.length > 255) {
        notValid = true;
        problem += `il range di frequenza non può essere lungo più di 255 caratteri. `
    }

    if (notValid) {
        return res.status(400).json({ error: problem });
    }

    let sql = `INSERT INTO antenne (nome, range_frequenza, potenza_watt, prezzo, specifiche, immagine, dimensioni, peso) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(sql, [nome, range_frequenza, parsedPotenza, parsedPrezzo, specifiche || null, imageName, dimensioni || null, parsedPeso], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Antenna aggiunta con successo',
            id: results.insertId,
            immagine: imageName
        });
    });
}

module.exports = { index, show, patchNameImage, postReview, store }