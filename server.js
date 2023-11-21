const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const PORT = process.env.PORT || 5050; // Utilizza la porta specificata nell'ambiente o la porta 5050 di default

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
	'mongodb+srv://paolo12691:1019Bebo@paolo12691.kchsnkr.mongodb.net/oliveto-progetto', // Aggiungi il nome del database
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	}
);

const bookingSchema = new mongoose.Schema({
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true }
	// Altri campi del documento di prenotazione, come nome, cognome, email, ecc.
});

const Booking = mongoose.model('Booking', bookingSchema);

app.get('/bookings', async (req, res) => {
	try {
		const bookings = await Booking.find();
		res.json(bookings);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.post('/bookings', async (req, res) => {
	try {
		const { startDate, endDate /* Altri dati della prenotazione */ } = req.body;

		// Verifica disponibilità
		const existingBooking = await Booking.findOne({
			$or: [
				{ startDate: { $gte: startDate, $lt: endDate } },
				{ endDate: { $gt: startDate, $lte: endDate } }
			]
		});

		if (existingBooking) {
			return res.status(400).json({ error: 'Date not available' });
		}

		const newBooking = new Booking({
			startDate,
			endDate /* dati della prenotazione */
		});

		await newBooking.save();

		res.status(201).json(newBooking);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
