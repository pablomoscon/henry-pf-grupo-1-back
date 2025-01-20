import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { nodemailerTransport } from 'src/config/nodemailer.config';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailerTransport();
  }

  async sendConfirmedReservation(reservation: Reservation): Promise<void> {
    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'confirmed-reservation.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { user, checkInDate, checkOutDate, totalAmount, room, cats, status } = reservation;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid date format for checkInDate or checkOutDate');
    }

    const data = {
      user: user.name,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      totalAmount: totalAmount.toFixed(2),
      room: room?.name || 'Not Assigned',
      cats: cats.map(cat => cat.name).join(', ') || 'None',
      status,
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM || 'your-email@example.com'}>`,
      to: user.email,
      subject: 'Reservation Confirmation',
      html: htmlContent, 
      attachments: [
        {
          filename: 'LogoApp.png',
          path: 'https://res.cloudinary.com/dofznnphj/image/upload/v1737408225/LogoApp_xslnki.png',
          cid: 'logoApp'  
        }
      ]
    };

    await this.transporter.sendMail(mailOptions);
  };
}
