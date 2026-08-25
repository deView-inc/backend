import * as fs from 'node:fs';
import * as path from 'node:path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as hbs from 'handlebars';
import * as nodemailer from 'nodemailer';

import { IMailPort } from './port';

@Injectable()
export class MailAdapter implements IMailPort {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly cfg: ConfigService) {
        const port = this.cfg.get('MAIL_PORT');
        const mode = this.cfg.get('NODE_ENV');

        this.transporter = nodemailer.createTransport({
            host: this.cfg.get('MAIL_HOST'),
            port: Number(port),
            secure: port === 465,
            auth: {
                user: this.cfg.get('MAIL_USER'),
                pass: this.cfg.get('MAIL_PASSWORD'),
            },
            pool: true,
            connectionTimeout: 10_000,
            tls: {
                rejectUnauthorized: mode === 'production',
                servername: 'smtp.gmail.com',
            },
        });
    }

    private sendMail(to: string, subject: string, templateName: string, context: any) {
        const templatePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        const contextWithYear = {
            ...context,
            year: new Date().getFullYear(),
        };

        const template = hbs.compile(templateSource);
        const html = template(contextWithYear);

        return this.transporter.sendMail({
            from: `"${this.cfg.get('MAIL_FROM_NAME')}" <${this.cfg.get('MAIL_FROM_EMAIL')}>`,
            to,
            subject,
            html,
        });
    }

    async sendCodeForSignUp(email: string, name: string, code: string) {
        const codeArray = [...code.toString()];

        return this.sendMail(email, 'Код подтверждения регистрации', 'sign-up', {
            name,
            codeArray,
        });
    }

    async sendCodeForSignIn(email: string, name: string, code: string) {
        const codeArray = [...code.toString()];

        return this.sendMail(email, 'Код подтверждения авторизации', 'sign-in', {
            name,
            codeArray,
        });
    }
}
