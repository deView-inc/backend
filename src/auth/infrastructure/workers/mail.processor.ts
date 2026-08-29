import { MailCurrentSessionEvent } from '@core/auth/domain/events/mail-current-session.event';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { IMailPort } from '@shared/adapters/mail';
import type { Job } from 'bullmq';

import { AuthMailJobs, AuthQueues } from '../../domain/enums';
import { MailCodeEvent } from '../../domain/events';

@Processor(AuthQueues.AUTH_MAIL)
export class MailProcessor extends WorkerHost {
    constructor(
        @Inject('IMailPort')
        private readonly mailAdapter: IMailPort,
    ) {
        super();
    }

    async process(job: Job<MailCodeEvent>): Promise<void>;
    async process(job: Job<MailCurrentSessionEvent>): Promise<void>;
    async process(job: Job): Promise<void> {
        await job.log(`[START] Job ID: ${job.id} | Type: ${job.name}`);

        try {
            switch (job.name) {
                case AuthMailJobs.SEND_REGISTER_CODE: {
                    await this.sendRegisterCode(job);
                    break;
                }

                case AuthMailJobs.SEND_LOGIN_CODE: {
                    await this.sendLoginCode(job);
                    break;
                }

                case AuthMailJobs.SEND_CURRENT_SESSION: {
                    await this.sendCurrentSession(job);
                    break;
                }

                default: {
                    await job.log(`[WRN] No handler for job: ${job.name}`);
                    await job.updateProgress(100);
                }
            }

            await job.log(`[DONE] Job ${job.id} processed`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : '';

            await job.log(`[FAIL] ${errorMessage}`);
            if (errorStack) {
                await job.log(errorStack);
            }

            throw error;
        }
    }

    private readonly sendRegisterCode = async (job: Job<MailCodeEvent>) => {
        const { email, otp } = job.data;

        await job.log(`Sending registration code to: ${email}`);
        await job.updateProgress(20);

        await this.mailAdapter.sendCodeForSignUp(email, otp);

        await job.log(`Successfully sent to ${email}`);
        await job.updateProgress(100);
    };

    private readonly sendLoginCode = async (job: Job<MailCodeEvent>) => {
        const { email, otp } = job.data;

        await job.log(`Sending code for login to: ${email}`);
        await job.updateProgress(20);

        await this.mailAdapter.sendCodeForSignIn(email, otp);

        await job.log(`Successfully sent to ${email}`);
        await job.updateProgress(100);
    };

    private readonly sendCurrentSession = async (job: Job<MailCurrentSessionEvent>) => {
        const { email, session } = job.data;

        await job.log(`Sending session info to: ${email}`);
        await job.updateProgress(20);

        await this.mailAdapter.sendCurrentSession(email, session);

        await job.log(`Successfully sent to ${email}`);
        await job.updateProgress(100);
    };
}
