import * as fs from 'node:fs';
import * as path from 'node:path';

import { SessionEmail } from '@core/auth/application/interfaces/session-email.type';
import { EMAIL_CODE_TTL_SECONDS } from '@core/auth/infrastructure/constants';
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

        const baseContext = {
            help_url: 'https://example.com/confirm',
            notification_settings_url: 'https://example.com/confirm',
            assets_base_url: './icons',
            not_me_url: 'https://example.com/confirm',
            dashboard_url: 'https://example.com/confirm',
            year: new Date().getFullYear(),
        };

        const template = hbs.compile(templateSource);
        const html = template({ ...baseContext, ...context });

        return this.transporter.sendMail({
            from: `"${this.cfg.get('MAIL_FROM_NAME')}" <${this.cfg.get('MAIL_FROM_EMAIL')}>`,
            to,
            subject,
            html,
            attachments: [
                {
                    filename: 'sign-in.png',
                    path: path.join(process.cwd(), 'templates/icons/sign-in.png'),
                    cid: 'sign-in',
                },
                {
                    filename: 'terminal-window.png',
                    path: path.join(process.cwd(), 'templates/icons/terminal-window.png'),
                    cid: 'terminal-window',
                },
            ],
        });
    }

    async sendCodeForSignUp(email: string, code: string) {
        const codeTtlMinutes = EMAIL_CODE_TTL_SECONDS / 60;
        const context = {
            code: [...code.toString()],
            title: 'Подтвердите ваш почтовый адрес',
            badge_text: 'Регестрация',
            description: `Используйте этот код, чтобы создать аккаунт в deView. Код действителен в течение ${codeTtlMinutes} минут.`,
            code_ttl_minutes: EMAIL_CODE_TTL_SECONDS / 60,
            confirm_url: 'https://example.com/confirm',
        };

        return this.sendMail(email, 'Код подтверждения регистрации', 'mail-code', context);
    }

    async sendCodeForSignIn(email: string, code: string) {
        const codeTtlMinutes = EMAIL_CODE_TTL_SECONDS / 60;
        const context = {
            code: [...code.toString()],
            title: 'Подтвердите вход в аккаунт',
            badge_text: 'Авторизация',
            description: `Используйте этот код, чтобы войти в аккаунт deView. Код действителен в течение ${codeTtlMinutes} минут.`,
            code_ttl_minutes: codeTtlMinutes,
            confirm_url: 'https://example.com/confirm',
        };

        return this.sendMail(email, 'Код подтверждения авторизации', 'mail-code', context);
    }

    async sendCurrentSession(email: string, session: SessionEmail) {
        const context = {
            account_email: email,
            login_time: session.createdAt,
            device: session.deviceType,
            browser: session.browser,
            ip: session.ip,
            location: `${session.country} / ${session.city}`,
        };

        return this.sendMail(email, 'Вы вошли в аккаунт', 'login-success', context);
    }
}
