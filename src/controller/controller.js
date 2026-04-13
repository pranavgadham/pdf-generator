import xlsx from "xlsx";
import fs from 'fs';
import ejs from 'ejs';
import { exportPdf } from "../utils/create.js";
import { json } from "stream/consumers";

let data = [];
let tripPlaces = [];
let tripTitle = '';
let tripStartDate = '';
let tripEndDate = '';
let duriation = '';

export function xlsxUploadHandler(req, res) {
    try {
        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        data = xlsx.utils.sheet_to_json(sheet);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${filePath}`, err);
            } else {
                console.log(`Successfully deleted file: ${filePath}`);
            }
        });

        res.status(200).render('tripDetails', { data });
    } catch (error) {
        console.log(error);
        res.status(400).send('Error while handling the xlsxData');
    }
}

export async function createpdf(req, res) {
    try {
        const pdfData = {
            tripTitle: tripTitle,
            tripStartDate: tripStartDate,
            tripDuration: '',
            tripDetails: tripPlaces
        }

        const pdfTemplate = await ejs.renderFile('pdfTemplates/index.html', pdfData);
        const pdf = await exportPdf(pdfTemplate, 'trip-details.pdf');

        const fileStream = fs.createReadStream(pdf.filePath);
        fileStream.pipe(res);

        fileStream.on('close', () => {
            fs.unlink(pdf.filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${pdf.filePath}`, err);
                } else {
                    console.log(`Successfully deleted file: ${pdf.filePath}`);
                }
            });
        });

    } catch (error) {
        console.log(error);
        res.status(400).send('Error while creating PDF');
    }
}

export function handleTripDetails(req, res) {
    try {
        // Extract data from the request body
        tripTitle = req.body.tripTitle;
        tripStartDate = req.body.tripStartDate;
        tripEndDate = req.body.tripEndDate;

        // Filter the selected places from the data array
        const selectedPlaces = req.body.tripPlaces; // Array of selected place names
        tripPlaces = data.filter((place) => selectedPlaces.includes(place.place)); // Filter based on 'places' key

        // Calculate the duration (X days, Y nights)
        const startDate = new Date(tripStartDate);
        const endDate = new Date(tripEndDate);

        // Calculate the difference in milliseconds
        const timeDifference = endDate - startDate;

        // Convert the difference to days
        const totalDays = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert ms to days

        if (totalDays > 0) {
            duriation = `${totalDays} Days, ${totalDays - 1} Nights`;
        } else {
            throw new Error("End date must be after the start date");
        }

        console.log("Trip Title:", tripTitle);
        console.log("Trip Start Date:", tripStartDate);
        console.log("Trip End Date:", tripEndDate);
        console.log("Selected Places:", tripPlaces);
        console.log("Duration:", duriation);

        // Render the timeDetails page with the filtered tripPlaces
        res.status(200).render("timeDetails", { tripPlaces });
    } catch (error) {
        console.log(error);
        res.status(400).render("error", { error: error });
    }
}

export function collectTimeDetails(req, res) {

}

export function handleTimeDetails(req, res) {
    try {
        const tripDetails = req.body.tripDetails;
        tripPlaces = tripDetails;

        res.status(200).json({ message: "Time details collected" });
    } catch (error) {
        console.log(error);
        res.status(400).send('Error while collecting time details');
    }
}

export function collectxlsxSheetDetails(req, res) {
    res.render('xlsxFileUpload');
}
