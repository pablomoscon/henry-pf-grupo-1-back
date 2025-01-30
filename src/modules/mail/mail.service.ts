import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { nodemailerTransport } from 'src/config/nodemailer.config';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { PaymentsService } from '../payments/payments.service';
import { User } from '../users/entities/user.entity';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {
    this.transporter = nodemailerTransport();
  }

  async sendInitiatedReservation(reservation: Reservation): Promise<void> {
    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'reservation-initiated.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { user, checkInDate, checkOutDate, totalAmount, room, cats, status } = reservation;

    const sessionUrl = await this.paymentsService.createCheckoutSession(reservation.id);

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const data = {
      user: user.name,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      totalAmount: totalAmount.toFixed(2),
      room: room?.name || 'Not Assigned',
      cats: cats.map(cat => cat.name).join(', ') || 'None',
      status,
      paymentLink: sessionUrl,
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM || 'your-email@example.com'}>`,
      to: user.email,
      subject: 'Reservation initiated',
      html: htmlContent,
      attachments: [
        {
          filename: 'LogoApp.png',
          path: 'https://res.cloudinary.com/dofznnphj/image/upload/v1737408225/LogoApp_xslnki.png',
          cid: 'logoApp',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  };

  async sendConfirmatedReservation(reservation: Reservation): Promise<void> {

    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'reservation-confirmated.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { user, checkInDate, checkOutDate, totalAmount, room, cats, status } = reservation;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const data = {
      user: user.name,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      totalAmount: totalAmount,
      room: room?.name || 'Not Assigned',
      cats: cats.map(cat => cat.name).join(', ') || 'None',
      status,
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM || 'your-email@example.com'}>`,
      to: user.email,
      subject: 'Reservation confirmated',
      html: htmlContent,
      attachments: [
        {
          filename: 'LogoApp.png',
          path: 'https://res.cloudinary.com/dofznnphj/image/upload/v1737408225/LogoApp_xslnki.png',
          cid: 'logoApp',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  };

  async sendPasswordChangeAlert(user: User): Promise<void> {

    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'send-password-change-alert.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { name, email, id } = user;
    const password = user.credential.password;


    const token = jwt.sign(
      { userId: id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `http://localhost:3001/reset-password/${id}?token=${token}`;

    const data = {
      name,
      email,
      resetLink,
      password
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM || 'your-email@example.com'}>`,
      to: email,
      subject: 'Reset your Password',
      html: htmlContent,
      attachments: [
        {
          filename: 'LogoApp.png',
          path: 'https://res.cloudinary.com/dofznnphj/image/upload/v1738092721/LogoApp_bjtclb.png',
          cid: 'logoApp',
        },
      ],
    };

    await this.transporter.sendMail(mailOptions);
  };
}