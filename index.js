import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import xlsxFileUpload from './src/middleware/fileUploadMiddleware.js';
import { collectTimeDetails, collectxlsxSheetDetails, createpdf, handleTimeDetails, handleTripDetails, xlsxUploadHandler } from "./src/controller/controller.js";

const app = express();

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(expressEjsLayouts);
app.set("view engine", "ejs");
app.set("views", "src/view");
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.post('/', xlsxFileUpload('xlsx'), xlsxUploadHandler);
app.get('/', collectxlsxSheetDetails);
app.post('/handleTripDetails', handleTripDetails);
app.get('/collectTimeDetails', collectTimeDetails);
app.post('/handleTimeDetails', handleTimeDetails);
app.get('/generatePDF', createpdf);

export default app;