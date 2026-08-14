export declare class EmailService {
    private transporter;
    private readonly logger;
    constructor();
    sendPasswordSetupEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendAccountCreatedEmail(email: string, password: string): Promise<void>;
}
