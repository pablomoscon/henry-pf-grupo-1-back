import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { nodemailerTransport } from 'src/config/nodemailer.config';
import { Reservation } from 'src/modules/reservations/entities/reservation.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { User } from '../users/entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { Credential } from '../credentials/entities/credential.entity';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
  ) {
    this.transporter = nodemailerTransport();
  }


  async sendConfirmatedReservation(reservation: Reservation): Promise<void> {

    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'reservation-confirmated.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { user, checkInDate, checkOutDate, totalAmount, room, cats, status } = reservation;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    const loginLink = `${process.env.FRONTEND_URL}/login`;

    const data = {
      user: user.name,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      totalAmount: totalAmount,
      room: room?.name || 'Not Assigned',
      cats: cats.map(cat => cat.name).join(', ') || 'None',
      status,
      loginLink 
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'Your Reservation at The Fancy Box is Officially Confirmed! 🎉',
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

  async sendPasswordChangeAlert(user: User, credential: Credential): Promise<void> {

    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'send-password-change-alert.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { name, email, id } = user;
    const { password } = credential;


    const token = jwt.sign(
      { userId: id },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    
    const resetLink = `${process.env.FRONTEND_URL}/change-password/${id}?token=${token}`;

    const data = {
      name,
      email,
      resetLink,
      password
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Your Password Change Request – Action Required',
      html: htmlContent,
      attachments: [
        {
          filename: 'LogoApp.png',
          path: 'https://res.cloudinary.com/dofznnphj/image/upload/v1738092721/LogoApp_bjtclb.png',
          cid: 'logoApp',
        },
      ],
      headers: {
        'List-Unsubscribe': '<http://example.com/unsubscribe>',
        'X-Priority': '1', 
        'Importance': 'High',
        'X-Mailer': 'The Fancy Box Mailer',
      },
    };
    await this.transporter.sendMail(mailOptions);
  };

  async sendSuccessfulregistration(userData: User): Promise<void> {
    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'successful-registration.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { name, email } = userData;

    const data = {
      name,
      email,
      appName: 'The Fancy Box',
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: `Welcome to The Fancy Box, ${name}! Your registration was successful`,
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

  async sendCompleteReservationsReview(reservation: Reservation): Promise<void> {
    const templatePath = path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', 'reservation-completed-review.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateSource);

    const { user, checkOutDate } = reservation;

    const checkOut = new Date(checkOutDate);

    const data = {
      user: user?.name || 'No Name', // Manejar caso de nombre de usuario nulo o no definido
      checkOut: checkOut.toISOString().split('T')[0], // Formatear la fecha correctamente
    };

    const htmlContent = template(data);

    const mailOptions = {
      from: `"The Fancy Box" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: 'We Hope You Enjoyed Your Stay! Share Your Experience 📝',
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