import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { join } from 'path'; // Asegúrate de importar join/ Si estás usando este adaptador
import { HandlebarsAdapter } from 'nodemailer-express-handlebars';

dotenv.config({
    path: '.env.development.local',
});

export const nodemailerTransport = () => {
    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    transport.use('compile', new HandlebarsAdapter({
        viewPath: join(__dirname, '..', 'mail', 'templates'),
        options: {
            strict: true
        }
    }));

    return transport;
};